import crypto from "crypto";
import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { User } from "../models/user.model.js";
import { Coupon } from "../models/coupon.model.js";
import { WebhookEvent } from "../models/webhookEvent.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Constant populated fields for cart items
const CART_POPULATE_FIELDS = "title regularPrice salePrice stock images isActive sku category";

/**
 * Constant-time HMAC-SHA256 signature verification to prevent timing attacks
 */
const verifyWebhookSignature = (rawBody, signature, secret) => {
  if (!signature || !secret || !rawBody) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
};

/**
 * Helper: Atomically decrement stock when creating an order from a webhook drop-off
 */
const atomicallyReserveStock = async (cartItems) => {
  const successfullyDecremented = [];

  for (const item of cartItems) {
    const productId = item.product?._id || item.product;
    const qtyToDeduct = item.quantity;

    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        stock: { $gte: qtyToDeduct },
        isActive: true
      },
      {
        $inc: { stock: -qtyToDeduct }
      },
      { new: true }
    );

    if (!updatedProduct) {
      // Rollback previous items
      for (const dec of successfullyDecremented) {
        await Product.findByIdAndUpdate(dec.productId, {
          $inc: { stock: dec.quantity }
        });
      }
      return false; // Insufficient stock
    }

    successfullyDecremented.push({ productId, quantity: qtyToDeduct });
  }

  return true;
};

/**
 * Helper: Build immutable order item snapshots from cart
 */
const buildOrderItemSnapshots = (cartItems) => {
  return cartItems.map((item) => {
    const product = item.product;
    const primaryImage =
      product.images?.find((img) => img.isPrimary)?.url ||
      product.images?.[0]?.url ||
      "";

    return {
      product: product._id,
      title: product.title,
      image: primaryImage,
      price: item.price,
      quantity: item.quantity,
      selectedSpecs: {
        color: item.selectedSpecs?.color || "",
        storage: item.selectedSpecs?.storage || "",
        ram: item.selectedSpecs?.ram || ""
      }
    };
  });
};

/**
 * @desc    Main Razorpay Webhook Event Ingestion Handler
 * @route   POST /api/v1/webhooks/razorpay
 * @access  Public (Secured via Razorpay HMAC Signature)
 */
export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSignature = req.headers["x-razorpay-signature"];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // In production, webhook secret is required
  if (!webhookSecret) {
    console.warn("⚠️ [Webhook] RAZORPAY_WEBHOOK_SECRET is not configured in .env");
    return res.status(500).json({ error: "Webhook secret is not configured on server" });
  }

  // Retrieve raw byte string captured by express.json verify
  const rawBody = req.rawBody || JSON.stringify(req.body);

  const isValid = verifyWebhookSignature(rawBody, webhookSignature, webhookSecret);

  if (!isValid) {
    console.error("❌ [Webhook] Invalid Razorpay signature detected. Rejecting payload.");
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const eventPayload = req.body;
  const eventType = eventPayload.event;
  // Use Razorpay event_id or fallback to unique ID
  const eventId =
    req.headers["x-razorpay-event-id"] ||
    eventPayload.event_id ||
    `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // ========================================================
  // 1. IDEMPOTENCY CHECK
  // Prevent duplicate processing if Razorpay retries this event
  // ========================================================
  const existingEvent = await WebhookEvent.findOne({ eventId });
  if (existingEvent) {
    return res.status(200).json({
      status: "acknowledged",
      message: "Event already processed (idempotent)"
    });
  }

  try {
    switch (eventType) {
      // ========================================================
      // 2. PAYMENT CAPTURED EVENT
      // ========================================================
      case "payment.captured":
      case "order.paid": {
        const payment = eventPayload.payload?.payment?.entity;
        if (!payment) break;

        const razorpayPaymentId = payment.id;
        const razorpayOrderId = payment.order_id;
        const notes = payment.notes || {};
        const userId = notes.userId;
        const shippingAddressId = notes.shippingAddressId;

        // Check if an order already exists for this Razorpay order
        let order = await Order.findOne({
          $or: [
            { "paymentInfo.razorpayOrderId": razorpayOrderId },
            { "paymentInfo.razorpayPaymentId": razorpayPaymentId }
          ]
        });

        if (order) {
          // If order exists and payment is still pending, mark as PAID
          if (order.paymentInfo.status !== "PAID") {
            order.paymentInfo.status = "PAID";
            order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
            order.paymentInfo.paidAt = new Date();
            order.statusTimeline.push({
              status: order.orderStatus,
              timestamp: new Date(),
              note: `Payment confirmed via Razorpay Webhook (${razorpayPaymentId})`
            });
            await order.save();
          }
        } else if (userId) {
          // ========================================================
          // RECONCILIATION FOR USER DROP-OFF (TAB CLOSED / TIMEOUT)
          // The money was captured, but the client redirect was aborted.
          // We recover the user's cart and create the order automatically.
          // ========================================================
          const cart = await Cart.findOne({ user: userId }).populate({
            path: "items.product",
            select: CART_POPULATE_FIELDS
          });

          if (cart && cart.items && cart.items.length > 0) {
            const user = await User.findById(userId);

            // Resolve shipping address
            let resolvedAddress = null;
            if (shippingAddressId && user?.addresses?.id(shippingAddressId)) {
              const saved = user.addresses.id(shippingAddressId);
              resolvedAddress = {
                fullName: saved.fullName,
                phone: saved.phone,
                street: saved.street,
                landmark: saved.landmark || "",
                city: saved.city,
                state: saved.state,
                pincode: saved.pincode,
                addressType: saved.addressType || "home"
              };
            } else if (user?.addresses?.length > 0) {
              const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
              resolvedAddress = {
                fullName: def.fullName,
                phone: def.phone,
                street: def.street,
                landmark: def.landmark || "",
                city: def.city,
                state: def.state,
                pincode: def.pincode,
                addressType: def.addressType || "home"
              };
            }

            if (resolvedAddress) {
              // Atomically reserve inventory
              const stockReserved = await atomicallyReserveStock(cart.items);

              if (stockReserved) {
                const orderItemsSnapshots = buildOrderItemSnapshots(cart.items);

                const couponSnapshot = {
                  couponId: cart.coupon?.couponId || null,
                  code: cart.coupon?.code || null,
                  discountAmount: cart.coupon?.discountAmount || 0
                };

                await Order.create({
                  user: userId,
                  orderItems: orderItemsSnapshots,
                  shippingAddress: resolvedAddress,
                  paymentInfo: {
                    method: "RAZORPAY",
                    status: "PAID",
                    razorpayOrderId,
                    razorpayPaymentId,
                    paidAt: new Date()
                  },
                  coupon: couponSnapshot,
                  pricing: {
                    itemsTotal: cart.pricing.subtotal,
                    shippingFee: cart.pricing.shippingFee,
                    taxAmount: cart.pricing.taxAmount,
                    discountAmount: cart.pricing.discountTotal,
                    grandTotal: cart.pricing.grandTotal
                  },
                  orderStatus: "PLACED",
                  statusTimeline: [
                    {
                      status: "PLACED",
                      timestamp: new Date(),
                      note: "Order auto-reconciled via Razorpay Webhook after payment capture."
                    }
                  ]
                });

                // Clear the recovered cart
                await Cart.findOneAndUpdate(
                  { user: userId },
                  {
                    items: [],
                    coupon: { couponId: null, code: null, discountAmount: 0 },
                    pricing: {
                      totalItems: 0,
                      subtotal: 0,
                      shippingFee: 0,
                      taxAmount: 0,
                      discountTotal: 0,
                      grandTotal: 0
                    }
                  }
                );
              }
            }
          }
        }

        // Record successful idempotency entry
        await WebhookEvent.create({
          eventId,
          eventType,
          razorpayOrderId,
          razorpayPaymentId,
          status: "PROCESSED"
        });
        break;
      }

      // ========================================================
      // 3. PAYMENT FAILED EVENT
      // ========================================================
      case "payment.failed": {
        const payment = eventPayload.payload?.payment?.entity;
        if (!payment) break;

        const razorpayPaymentId = payment.id;
        const razorpayOrderId = payment.order_id;
        const errorDescription =
          payment.error_description || payment.error_reason || "Payment declined by bank";

        const order = await Order.findOne({
          "paymentInfo.razorpayOrderId": razorpayOrderId
        });

        if (order && order.paymentInfo.status !== "PAID") {
          order.paymentInfo.status = "FAILED";
          order.statusTimeline.push({
            status: order.orderStatus,
            timestamp: new Date(),
            note: `Payment failed: ${errorDescription}`
          });
          await order.save();
        }

        await WebhookEvent.create({
          eventId,
          eventType,
          razorpayOrderId,
          razorpayPaymentId,
          status: "PROCESSED",
          errorReason: errorDescription
        });
        break;
      }

      // ========================================================
      // 4. REFUND PROCESSED EVENT
      // ========================================================
      case "refund.processed": {
        const refund = eventPayload.payload?.refund?.entity;
        if (!refund) break;

        const paymentId = refund.payment_id;
        const refundAmount = refund.amount / 100;

        const order = await Order.findOne({
          "paymentInfo.razorpayPaymentId": paymentId
        });

        if (order) {
          order.paymentInfo.status = "REFUNDED";
          order.orderStatus = "RETURNED";
          order.statusTimeline.push({
            status: "RETURNED",
            timestamp: new Date(),
            note: `Refund of ₹${refundAmount} processed via Razorpay (Refund ID: ${refund.id})`
          });
          await order.save();
        }

        await WebhookEvent.create({
          eventId,
          eventType,
          razorpayPaymentId: paymentId,
          status: "PROCESSED"
        });
        break;
      }

      default: {
        // Acknowledge unhandled event types gracefully
        await WebhookEvent.create({
          eventId,
          eventType,
          status: "IGNORED"
        });
        break;
      }
    }

    // Always acknowledge Razorpay promptly with HTTP 200 to prevent retries
    return res.status(200).json({ status: "success", event: eventType });
  } catch (error) {
    console.error(`💥 [Webhook Error] Processing failed for event ${eventType}:`, error);

    await WebhookEvent.create({
      eventId,
      eventType,
      status: "FAILED",
      errorReason: error.message
    }).catch(() => {});

    // Return 500 so Razorpay retries after server/database recovers
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});
