import crypto from "crypto";
import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { User } from "../models/user.model.js";
import { Review } from "../models/review.model.js";
import { ReturnRequest } from "../models/return.model.js";
import { FlashDeal } from "../models/flashDeal.model.js";
import { StockReservation } from "../models/stockReservation.model.js";
import { restoreReservedItemsStock } from "../utils/stockReservationCleanup.js";
import { razorpayInstance } from "../config/razorpay.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const RESERVATION_HOLD_MINUTES = 10;

/**
 * Helper: Atomically increment claimedCount for products enrolled in an active flash deal
 */
const incrementFlashDealClaims = async (orderItems) => {
  const now = new Date();
  for (const item of orderItems) {
    const productId = item.product?._id || item.product;
    if (productId) {
      await FlashDeal.findOneAndUpdate(
        {
          status: "ACTIVE",
          startTime: { $lte: now },
          endTime: { $gte: now },
          "products.product": productId
        },
        {
          $inc: { "products.$.claimedCount": item.quantity }
        }
      );
    }
  }
};

/**
 * Helper: Atomically decrement claimedCount when order is cancelled
 */
const rollbackFlashDealClaims = async (orderItems) => {
  for (const item of orderItems) {
    const productId = item.product?._id || item.product;
    if (productId) {
      await FlashDeal.findOneAndUpdate(
        {
          "products.product": productId
        },
        {
          $inc: { "products.$.claimedCount": -item.quantity }
        }
      );
    }
  }
};

/**
 * Standard product fields populated from cart
 */
const CART_POPULATE_FIELDS =
  "title slug brand category regularPrice salePrice stock images isActive thumbnail colors";



const resolveShippingAddress = async (userId, body) => {
  const { shippingAddressId, shippingAddress } = body;

  if (shippingAddressId) {
    if (!mongoose.Types.ObjectId.isValid(shippingAddressId)) {
      throw new ApiError(400, "Invalid shipping address ID format");
    }

    const user = await User.findById(userId);
    const savedAddress = user?.addresses?.id(shippingAddressId);

    if (!savedAddress) {
      throw new ApiError(
        404,
        "Selected shipping address not found in your saved addresses"
      );
    }

    return {
      fullName: savedAddress.fullName,
      phone: savedAddress.phone,
      street: savedAddress.street,
      landmark: savedAddress.landmark || "",
      city: savedAddress.city,
      state: savedAddress.state,
      pincode: savedAddress.pincode,
      addressType: savedAddress.addressType || "home"
    };
  }

  if (shippingAddress) {
    const { fullName, phone, street, city, state, pincode } = shippingAddress;

    if (!fullName || !phone || !street || !city || !state || !pincode) {
      throw new ApiError(
        400,
        "Shipping address requires: fullName, phone, street, city, state, pincode"
      );
    }

    return {
      fullName: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      landmark: (shippingAddress.landmark || "").trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      addressType: shippingAddress.addressType || "home"
    };
  }

  throw new ApiError(
    400,
    "Shipping address is required. Provide either shippingAddressId or shippingAddress object."
  );
};



/**
 * Phase 1: Atomically lock available stock into reservedStock during checkout initiation
 */
const atomicallyHoldStockForReservation = async (cartItems) => {
  const successfullyHeld = [];

  for (const item of cartItems) {
    const productId = item.product?._id || item.product;
    const qtyToHold = item.quantity;
    const chosenColor = item.selectedSpecs?.color;

    let updatedProduct = null;

    // 1. If color variant specified, atomically transfer variant stock -> variant reservedStock
    if (chosenColor) {
      const prodCheck = await Product.findById(productId);
      const hasMatchingVariant = prodCheck?.colors?.some(
        (c) => c.colorName.toLowerCase() === chosenColor.toLowerCase()
      );

      if (hasMatchingVariant) {
        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: productId,
            isActive: true,
            colors: {
              $elemMatch: {
                colorName: new RegExp(`^${chosenColor.trim()}$`, "i"),
                stock: { $gte: qtyToHold }
              }
            },
            stock: { $gte: qtyToHold }
          },
          {
            $inc: {
              "colors.$.stock": -qtyToHold,
              "colors.$.reservedStock": qtyToHold,
              stock: -qtyToHold,
              reservedStock: qtyToHold
            }
          },
          { new: true }
        );

        if (updatedProduct) {
          successfullyHeld.push({
            product: productId,
            title: updatedProduct.title,
            color: chosenColor.trim(),
            quantity: qtyToHold,
            price: item.price
          });
        }
      }
    }

    // 2. Base product inventory transfer stock -> reservedStock
    if (
      !updatedProduct &&
      (!chosenColor ||
        !successfullyHeld.some(
          (h) => h.product.toString() === productId.toString() && h.color === chosenColor.trim()
        ))
    ) {
      updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: qtyToHold },
          isActive: true
        },
        {
          $inc: {
            stock: -qtyToHold,
            reservedStock: qtyToHold
          }
        },
        { new: true }
      );

      if (updatedProduct) {
        successfullyHeld.push({
          product: productId,
          title: updatedProduct.title,
          color: "",
          quantity: qtyToHold,
          price: item.price
        });
      }
    }

    // 3. If hold failed, roll back all items held in this batch
    if (!updatedProduct) {
      await restoreReservedItemsStock(successfullyHeld);

      const productInfo = await Product.findById(productId);
      const productName = productInfo ? productInfo.title : "Product";
      const colorSuffix = chosenColor ? ` (${chosenColor})` : "";

      throw new ApiError(
        400,
        `Cannot reserve stock: '${productName}'${colorSuffix} is out of stock or does not have ${qtyToHold} unit(s) available.`
      );
    }
  }

  return successfullyHeld;
};

const atomicallyReserveStock = async (cartItems, session = null) => {
  const successfullyDecremented = [];

  for (const item of cartItems) {
    const productId = item.product?._id || item.product;
    const qtyToDeduct = item.quantity;
    const chosenColor = item.selectedSpecs?.color;

    let updatedProduct = null;

    // 1. If item has a chosen color variant, attempt atomic variant-level deduction
    if (chosenColor) {
      const prodCheck = await Product.findById(productId).session(session);
      const hasMatchingVariant = prodCheck?.colors?.some(
        (c) => c.colorName.toLowerCase() === chosenColor.toLowerCase()
      );

      if (hasMatchingVariant) {
        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: productId,
            isActive: true,
            colors: {
              $elemMatch: {
                colorName: new RegExp(`^${chosenColor.trim()}$`, "i"),
                stock: { $gte: qtyToDeduct }
              }
            },
            stock: { $gte: qtyToDeduct }
          },
          {
            $inc: {
              "colors.$.stock": -qtyToDeduct,
              stock: -qtyToDeduct
            }
          },
          { new: true, session }
        );

        if (updatedProduct) {
          successfullyDecremented.push({
            productId,
            quantity: qtyToDeduct,
            color: chosenColor.trim()
          });
        }
      }
    }

    // 2. Base product inventory deduction (if no variant specified or variant not tracked)
    if (!updatedProduct && (!chosenColor || !successfullyDecremented.some(d => d.productId.toString() === productId.toString() && d.color === chosenColor.trim()))) {
      updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: qtyToDeduct },
          isActive: true
        },
        {
          $inc: { stock: -qtyToDeduct }
        },
        { new: true, session }
      );

      if (updatedProduct) {
        successfullyDecremented.push({ productId, quantity: qtyToDeduct });
      }
    }

    if (!updatedProduct) {
      // Roll back any products that were already decremented if not inside a session
      if (!session) {
        for (const dec of successfullyDecremented) {
          if (dec.color) {
            await Product.findOneAndUpdate(
              {
                _id: dec.productId,
                "colors.colorName": new RegExp(`^${dec.color}$`, "i")
              },
              {
                $inc: {
                  "colors.$.stock": dec.quantity,
                  stock: dec.quantity
                }
              }
            );
          } else {
            await Product.findByIdAndUpdate(dec.productId, {
              $inc: { stock: dec.quantity }
            });
          }
        }
      }

      const productInfo = await Product.findById(productId).session(session);
      const productName = productInfo ? productInfo.title : "Product";
      const colorSuffix = chosenColor ? ` (${chosenColor})` : "";

      throw new ApiError(
        400,
        `Insufficient inventory for '${productName}'${colorSuffix}. Only remaining stock could not fulfill ${qtyToDeduct} unit(s).`
      );
    }
  }

  return successfullyDecremented;
};


const restockOrderProducts = async (orderItems) => {
  for (const item of orderItems) {
    if (item.product) {
      const chosenColor = item.selectedSpecs?.color;
      if (chosenColor) {
        const prod = await Product.findById(item.product);
        const hasVariant = prod?.colors?.some(
          (c) => c.colorName.toLowerCase() === chosenColor.toLowerCase()
        );
        if (hasVariant) {
          await Product.findOneAndUpdate(
            {
              _id: item.product,
              "colors.colorName": new RegExp(`^${chosenColor.trim()}$`, "i")
            },
            {
              $inc: {
                "colors.$.stock": item.quantity,
                stock: item.quantity
              }
            }
          );
          continue;
        }
      }

      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }
  }
};

/**
 * Helper: Commit coupon redemption counter and record user usage in database
 */
const commitCouponUsage = async (couponSnapshot, userId, session = null) => {
  if (!couponSnapshot?.couponId) return;

  const coupon = await Coupon.findById(couponSnapshot.couponId).session(session);
  if (!coupon) return;

  coupon.usedCount += 1;

  const userIndex = coupon.usersUsed.findIndex(
    (record) => record.user.toString() === userId.toString()
  );

  if (userIndex > -1) {
    coupon.usersUsed[userIndex].usedCount += 1;
    coupon.usersUsed[userIndex].lastUsedAt = new Date();
  } else {
    coupon.usersUsed.push({
      user: userId,
      usedCount: 1,
      lastUsedAt: new Date()
    });
  }

  await coupon.save({ session });
};

/**
 * Helper: Roll back coupon redemption counter on order cancellation
 */
const rollbackCouponUsage = async (couponSnapshot, userId) => {
  if (!couponSnapshot?.couponId) return;

  const coupon = await Coupon.findById(couponSnapshot.couponId);
  if (!coupon) return;

  coupon.usedCount = Math.max(0, coupon.usedCount - 1);

  const userIndex = coupon.usersUsed.findIndex(
    (record) => record.user.toString() === userId.toString()
  );

  if (userIndex > -1) {
    coupon.usersUsed[userIndex].usedCount -= 1;
    if (coupon.usersUsed[userIndex].usedCount <= 0) {
      coupon.usersUsed.splice(userIndex, 1);
    }
  }

  await coupon.save();
};

/**
 * Helper: Transform cart items into immutable Order Item snapshots
 */
const buildOrderItemSnapshots = (cartItems) => {
  return cartItems.map((item) => {
    const product = item.product;
    const chosenColor = item.selectedSpecs?.color;

    // Check if there is a color-specific image gallery
    let thumbnailImage = "";
    if (chosenColor && product.colors && product.colors.length > 0) {
      const variant = product.colors.find(
        (c) => c.colorName.toLowerCase() === chosenColor.toLowerCase()
      );
      if (variant && variant.images && variant.images.length > 0) {
        thumbnailImage =
          variant.images.find((img) => img.isPrimary)?.url ||
          variant.images[0].url;
      }
    }

    // Fallback to base product primary image
    if (!thumbnailImage) {
      thumbnailImage =
        (product.images && product.images.length > 0
          ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
          : "") || "";
    }

    return {
      product: product._id,
      title: product.title,
      image: thumbnailImage,
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
 * =====================================================================
 * CUSTOMER CHECKOUT & ORDER CONTROLLERS
 * =====================================================================
 */


export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { shippingAddressId } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: CART_POPULATE_FIELDS
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty. Add products before checking out.");
  }

  // Pre-checkout stock validation
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      throw new ApiError(
        400,
        "One or more items in your cart are no longer available. Please review your cart."
      );
    }
  }

  // 1. Release any previous active reservation for this user to avoid double-locking
  const existingActive = await StockReservation.find({
    user: req.user._id,
    status: "RESERVED",
    expiresAt: { $gt: new Date() }
  });

  for (const prevRes of existingActive) {
    await restoreReservedItemsStock(prevRes.items);
    prevRes.status = "RELEASED";
    prevRes.releasedAt = new Date();
    await prevRes.save();
  }

  // 2. Concurrency-Safe Stock Hold: Atomically transfer stock -> reservedStock
  const heldItems = await atomicallyHoldStockForReservation(cart.items);

  // Grand total in paise (Razorpay takes smallest currency unit)
  const amountInPaise = Math.round(cart.pricing.grandTotal * 100);

  if (amountInPaise <= 0) {
    // Rollback held items if amount invalid
    await restoreReservedItemsStock(heldItems);
    throw new ApiError(400, "Invalid order total amount");
  }

  const receipt = `rcpt_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;

  let razorpayOrder;
  try {
    const razorpayOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: req.user._id.toString(),
        shippingAddressId: shippingAddressId ? shippingAddressId.toString() : "",
        totalItems: cart.pricing.totalItems.toString()
      }
    };
    razorpayOrder = await razorpayInstance.orders.create(razorpayOptions);
  } catch (rzpErr) {
    // If Razorpay API fails, immediately release stock hold
    await restoreReservedItemsStock(heldItems);
    throw new ApiError(500, `Failed to initialize gateway order: ${rzpErr.message}`);
  }

  // 3. Create StockReservation document with 10-minute TTL expiry
  const expiresAt = new Date(Date.now() + RESERVATION_HOLD_MINUTES * 60 * 1000);

  const reservation = await StockReservation.create({
    user: req.user._id,
    razorpayOrderId: razorpayOrder.id,
    items: heldItems,
    status: "RESERVED",
    expiresAt,
    metadata: {
      grandTotal: cart.pricing.grandTotal,
      shippingAddressId
    }
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        reservationId: reservation._id,
        expiresAt: reservation.expiresAt,
        holdMinutes: RESERVATION_HOLD_MINUTES,
        remainingSeconds: RESERVATION_HOLD_MINUTES * 60
      },
      `Stock reserved for ${RESERVATION_HOLD_MINUTES} minutes. Please complete payment before timeout.`
    )
  );
});

/**
 * @desc    Cancel active stock reservation if customer cancels checkout modal
 * @route   POST /api/v1/orders/checkout/cancel-reservation
 * @access  Private (Customer)
 */
export const cancelStockReservation = asyncHandler(async (req, res) => {
  const { razorpayOrderId } = req.body;

  if (!razorpayOrderId) {
    throw new ApiError(400, "Razorpay Order ID is required to cancel reservation");
  }

  const reservation = await StockReservation.findOne({
    user: req.user._id,
    razorpayOrderId,
    status: "RESERVED"
  });

  if (!reservation) {
    return res.status(200).json(
      new ApiResponse(200, null, "No active reservation found or already resolved")
    );
  }

  await restoreReservedItemsStock(reservation.items);
  reservation.status = "RELEASED";
  reservation.releasedAt = new Date();
  await reservation.save();

  return res.status(200).json(
    new ApiResponse(200, { released: true }, "Stock reservation released and inventory restored")
  );
});

/**
 * @desc    Get active stock reservation for the current user
 * @route   GET /api/v1/orders/checkout/active-reservation
 * @access  Private (Customer)
 */
export const getActiveStockReservation = asyncHandler(async (req, res) => {
  const reservation = await StockReservation.findOne({
    user: req.user._id,
    status: "RESERVED",
    expiresAt: { $gt: new Date() }
  });

  if (!reservation) {
    return res.status(200).json(
      new ApiResponse(200, { hasActiveReservation: false }, "No active reservation")
    );
  }

  const remainingSeconds = Math.max(
    0,
    Math.round((new Date(reservation.expiresAt).getTime() - Date.now()) / 1000)
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hasActiveReservation: true,
        reservationId: reservation._id,
        razorpayOrderId: reservation.razorpayOrderId,
        expiresAt: reservation.expiresAt,
        remainingSeconds,
        itemsCount: reservation.items.length
      },
      "Active stock reservation found"
    )
  );
});

/**
 * @desc    Verify Razorpay Payment with MongoDB ACID Multi-Document Transaction
 * @route   POST /api/v1/orders/checkout/verify-payment
 * @access  Private (Customer)
 */
export const verifyPaymentAndPlaceOrder = asyncHandler(async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    shippingAddressId,
    shippingAddress
  } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(
      400,
      "Payment verification tokens missing: razorpayOrderId, razorpayPaymentId, razorpaySignature required."
    );
  }

  // 1. Cryptographic Signature Verification (HMAC-SHA256)
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new ApiError(
      400,
      "Payment verification failed: Digital signature does not match. Tampering detected."
    );
  }

  // 2. Locate active reservation
  const reservation = await StockReservation.findOne({
    razorpayOrderId,
    user: req.user._id
  });

  // Safety Net: If reservation expired or is not RESERVED, customer was charged on gateway
  // Trigger automated Razorpay refund immediately to prevent orphan charge!
  if (!reservation || reservation.status !== "RESERVED" || new Date(reservation.expiresAt) < new Date()) {
    try {
      await razorpayInstance.payments.refund(razorpayPaymentId, {
        notes: {
          reason: "Payment verified after 10-minute stock reservation expired",
          razorpayOrderId
        }
      });
    } catch (refundErr) {
      console.error("💥 Auto-refund attempt failed:", refundErr.message);
    }

    if (reservation && reservation.status === "RESERVED") {
      reservation.status = "EXPIRED";
      reservation.releasedAt = new Date();
      await reservation.save();
    }

    throw new ApiError(
      400,
      "Your 10-minute checkout reservation expired before payment verification. A full refund has been automatically initiated to your original payment method."
    );
  }

  // 3. Resolve Shipping Address
  const resolvedAddress = await resolveShippingAddress(req.user._id, {
    shippingAddressId,
    shippingAddress
  });

  // 4. Fetch Cart
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: CART_POPULATE_FIELDS
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError(
      400,
      "Cart is empty or has already been processed into an order."
    );
  }

  const orderItemsSnapshots = buildOrderItemSnapshots(cart.items);
  const couponSnapshot = {
    couponId: cart.coupon?.couponId || null,
    code: cart.coupon?.code || null,
    discountAmount: cart.coupon?.discountAmount || 0
  };

  // 5. ACID Multi-Document Transaction Execution
  const session = await mongoose.startSession();
  let newOrder = null;

  try {
    const executeInTransaction = async () => {
      // Step A: Convert reservedStock into permanent purchase
      for (const resItem of reservation.items) {
        if (resItem.color) {
          await Product.findOneAndUpdate(
            {
              _id: resItem.product,
              "colors.colorName": new RegExp(`^${resItem.color.trim()}$`, "i")
            },
            {
              $inc: {
                "colors.$.reservedStock": -resItem.quantity,
                reservedStock: -resItem.quantity
              }
            },
            { session }
          );
        } else {
          await Product.findByIdAndUpdate(
            resItem.product,
            {
              $inc: { reservedStock: -resItem.quantity }
            },
            { session }
          );
        }
      }

      // Step B: Mark StockReservation as COMPLETED
      reservation.status = "COMPLETED";
      reservation.completedAt = new Date();
      await reservation.save({ session });

      // Step C: Create Order in MongoDB
      const [created] = await Order.create(
        [
          {
            user: req.user._id,
            orderItems: orderItemsSnapshots,
            shippingAddress: resolvedAddress,
            paymentInfo: {
              method: "RAZORPAY",
              status: "PAID",
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
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
                note: "Payment received via Razorpay. Order confirmed."
              }
            ]
          }
        ],
        { session }
      );
      newOrder = created;

      // Step D: Commit coupon usage
      if (couponSnapshot.couponId) {
        await commitCouponUsage(couponSnapshot, req.user._id, session);
      }

      // Step E: Clear customer cart
      cart.items = [];
      cart.coupon = { couponId: null, code: null, discountAmount: 0 };
      await cart.save({ session });
    };

    // Execute with transaction (Atlas / Replica Set)
    await session.withTransaction(executeInTransaction);
  } catch (transErr) {
    // Fallback if standalone MongoDB environment (no replica set configured)
    if (transErr.message?.includes("Transaction numbers are only allowed")) {
      for (const resItem of reservation.items) {
        if (resItem.color) {
          await Product.findOneAndUpdate(
            {
              _id: resItem.product,
              "colors.colorName": new RegExp(`^${resItem.color.trim()}$`, "i")
            },
            {
              $inc: {
                "colors.$.reservedStock": -resItem.quantity,
                reservedStock: -resItem.quantity
              }
            }
          );
        } else {
          await Product.findByIdAndUpdate(resItem.product, {
            $inc: { reservedStock: -resItem.quantity }
          });
        }
      }

      reservation.status = "COMPLETED";
      reservation.completedAt = new Date();
      await reservation.save();

      newOrder = await Order.create({
        user: req.user._id,
        orderItems: orderItemsSnapshots,
        shippingAddress: resolvedAddress,
        paymentInfo: {
          method: "RAZORPAY",
          status: "PAID",
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
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
            note: "Payment received via Razorpay. Order confirmed."
          }
        ]
      });

      if (couponSnapshot.couponId) {
        await commitCouponUsage(couponSnapshot, req.user._id);
      }

      cart.items = [];
      cart.coupon = { couponId: null, code: null, discountAmount: 0 };
      await cart.save();
    } else {
      throw transErr;
    }
  } finally {
    await session.endSession();
  }

  // 6. Post-Commit Actions: Flash deals and loyalty updates
  await incrementFlashDealClaims(newOrder.orderItems);

  try {
    const userDoc = await User.findById(req.user._id);
    if (userDoc) {
      const userOrderCount = await Order.countDocuments({ user: req.user._id });
      await userDoc.recordOrderPayment({
        amount: cart.pricing.grandTotal,
        orderCount: userOrderCount,
        orderNumber: newOrder.orderNumber
      });
    }
  } catch (loyaltyErr) {
    console.error("Non-blocking loyalty update error:", loyaltyErr);
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      { order: newOrder },
      "Payment verified and order placed successfully!"
    )
  );
});

/**
 * @desc    Place Cash on Delivery Order with ACID Multi-Document Transaction
 * @route   POST /api/v1/orders/checkout/cod
 * @access  Private (Customer)
 */
export const placeCodOrder = asyncHandler(async (req, res) => {
  const { shippingAddressId, shippingAddress } = req.body;

  // Resolve Shipping Address
  const resolvedAddress = await resolveShippingAddress(req.user._id, {
    shippingAddressId,
    shippingAddress
  });

  // Fetch and populate Cart
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: CART_POPULATE_FIELDS
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty. Add products before checking out.");
  }

  const orderItemsSnapshots = buildOrderItemSnapshots(cart.items);
  const couponSnapshot = {
    couponId: cart.coupon?.couponId || null,
    code: cart.coupon?.code || null,
    discountAmount: cart.coupon?.discountAmount || 0
  };

  const session = await mongoose.startSession();
  let newOrder = null;

  try {
    const executeInTransaction = async () => {
      // 1. Atomically reserve and decrement stock inside transaction
      await atomicallyReserveStock(cart.items, session);

      // 2. Create Order in MongoDB inside transaction
      const [created] = await Order.create(
        [
          {
            user: req.user._id,
            orderItems: orderItemsSnapshots,
            shippingAddress: resolvedAddress,
            paymentInfo: {
              method: "COD",
              status: "PENDING"
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
                note: "Order placed via Cash on Delivery. Verification pending."
              }
            ]
          }
        ],
        { session }
      );
      newOrder = created;

      // 3. Commit coupon usage in database
      if (couponSnapshot.couponId) {
        await commitCouponUsage(couponSnapshot, req.user._id, session);
      }

      // 4. Clear customer cart
      cart.items = [];
      cart.coupon = { couponId: null, code: null, discountAmount: 0 };
      await cart.save({ session });
    };

    await session.withTransaction(executeInTransaction);
  } catch (transErr) {
    // Standalone fallback
    if (transErr.message?.includes("Transaction numbers are only allowed")) {
      await atomicallyReserveStock(cart.items);
      newOrder = await Order.create({
        user: req.user._id,
        orderItems: orderItemsSnapshots,
        shippingAddress: resolvedAddress,
        paymentInfo: {
          method: "COD",
          status: "PENDING"
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
            note: "Order placed via Cash on Delivery. Verification pending."
          }
        ]
      });

      if (couponSnapshot.couponId) {
        await commitCouponUsage(couponSnapshot, req.user._id);
      }

      cart.items = [];
      cart.coupon = { couponId: null, code: null, discountAmount: 0 };
      await cart.save();
    } else {
      throw transErr;
    }
  } finally {
    await session.endSession();
  }

  // Increment Flash Deal claimed quota if any item is enrolled
  await incrementFlashDealClaims(newOrder.orderItems);

  // Trigger Event-Driven Loyalty & Badge Progression on User Model
  try {
    const userDoc = await User.findById(req.user._id);
    if (userDoc) {
      const userOrderCount = await Order.countDocuments({ user: req.user._id });
      await userDoc.recordOrderPayment({
        amount: cart.pricing.grandTotal,
        orderCount: userOrderCount,
        orderNumber: newOrder.orderNumber
      });
    }
  } catch (loyaltyErr) {
    console.error("Non-blocking loyalty update error:", loyaltyErr);
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      { order: newOrder },
      "Cash on Delivery order placed successfully!"
    )
  );
});



export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { user: req.user._id };
  if (status) {
    query.orderStatus = status.toUpperCase();
  }

  const pageNumber = Math.max(1, parseInt(page, 10));
  const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNumber - 1) * limitNumber;

  const [rawOrders, totalOrders] = await Promise.all([
    Order.find(query)
      .populate("orderItems.product", "slug brand category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .select("-__v"),
    Order.countDocuments(query)
  ]);

  let orders = rawOrders.map((o) => o.toObject());

  // Attach user review and return status to order items
  const [userReviews, userReturns] = await Promise.all([
    Review.find({ user: req.user._id })
      .select("_id product order rating title comment createdAt")
      .lean(),
    ReturnRequest.find({ user: req.user._id })
      .select("_id returnNumber order orderItem.orderItemId status requestType reason adminRemarks rejectionReason replacementDetails refundDetails createdAt")
      .lean()
  ]);

  const reviewsMap = new Map();
  userReviews.forEach((rev) => {
    if (rev.product) {
      reviewsMap.set(rev.product.toString(), rev);
    }
    if (rev.order && rev.product) {
      reviewsMap.set(`${rev.order.toString()}_${rev.product.toString()}`, rev);
    }
  });

  const returnsMap = new Map();
  userReturns.forEach((ret) => {
    if (ret.orderItem?.orderItemId) {
      returnsMap.set(ret.orderItem.orderItemId.toString(), ret);
    }
  });

  orders = orders.map((o) => {
    const isDelivered = ["DELIVERED", "Delivered", "delivered"].includes(o.orderStatus);
    return {
      ...o,
      orderItems: (o.orderItems || []).map((item) => {
        const prodId = (item.product?._id || item.product)?.toString();
        const existingReview = isDelivered && prodId
          ? (o._id ? reviewsMap.get(`${o._id.toString()}_${prodId}`) : null) || reviewsMap.get(prodId) || null
          : null;

        const itemIdStr = item._id?.toString();
        const existingReturn = itemIdStr ? returnsMap.get(itemIdStr) || null : null;

        return {
          ...item,
          userReview: existingReview
            ? {
                _id: existingReview._id,
                rating: existingReview.rating,
                title: existingReview.title,
                comment: existingReview.comment,
                createdAt: existingReview.createdAt
              }
            : null,
          returnRequest: existingReturn
        };
      })
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          totalOrders,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalOrders / limitNumber),
          limit: limitNumber
        }
      },
      "Order history retrieved successfully"
    )
  );
});

/**
 * @desc    Get single order details by ID or orderNumber with timeline
 * @route   GET /api/v1/orders/:orderId
 * @access  Private (Customer / Admin)
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const query = mongoose.Types.ObjectId.isValid(orderId)
    ? { _id: orderId }
    : { orderNumber: orderId.toUpperCase() };

  const order = await Order.findOne(query)
    .populate("user", "name email phone")
    .populate("orderItems.product", "slug brand category");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Restrict access: Only the order owner or an admin can view details
  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Access forbidden: You do not have permission to view this order");
  }

  let orderData = order.toObject();

  // If order is delivered, populate review and return status for each item
  if (
    order.orderStatus &&
    ["DELIVERED", "Delivered", "delivered"].includes(order.orderStatus)
  ) {
    const [userReviews, userReturns] = await Promise.all([
      Review.find({ user: req.user._id })
        .select("_id product order rating title comment createdAt")
        .lean(),
      ReturnRequest.find({ order: order._id })
        .select("_id returnNumber order orderItem.orderItemId status requestType reason adminRemarks rejectionReason replacementDetails refundDetails createdAt")
        .lean()
    ]);

    const reviewsMap = new Map();
    userReviews.forEach((rev) => {
      if (rev.product) {
        reviewsMap.set(rev.product.toString(), rev);
      }
      if (rev.order && rev.product) {
        reviewsMap.set(`${rev.order.toString()}_${rev.product.toString()}`, rev);
      }
    });

    const returnsMap = new Map();
    userReturns.forEach((ret) => {
      if (ret.orderItem?.orderItemId) {
        returnsMap.set(ret.orderItem.orderItemId.toString(), ret);
      }
    });

    orderData.orderItems = (orderData.orderItems || []).map((item) => {
      const prodId = (item.product?._id || item.product)?.toString();
      const existingReview = prodId
        ? (orderData._id ? reviewsMap.get(`${orderData._id.toString()}_${prodId}`) : null) || reviewsMap.get(prodId) || null
        : null;

      const itemIdStr = item._id?.toString();
      const existingReturn = itemIdStr ? returnsMap.get(itemIdStr) || null : null;

      return {
        ...item,
        userReview: existingReview
          ? {
              _id: existingReview._id,
              rating: existingReview.rating,
              title: existingReview.title,
              comment: existingReview.comment,
              createdAt: existingReview.createdAt
            }
          : null,
        returnRequest: existingReturn
      };
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { order: orderData }, "Order details retrieved successfully")
  );
});

/**
 * @desc    Customer self-cancellation (allowed if status is PLACED or CONFIRMED)
 * @route   POST /api/v1/orders/:orderId/cancel
 * @access  Private (Customer)
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason = "Cancelled by customer" } = req.body;

  const query = mongoose.Types.ObjectId.isValid(orderId)
    ? { _id: orderId }
    : { orderNumber: orderId.toUpperCase() };

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Verify ownership
  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only cancel your own orders");
  }

  // Business Rule: Can only cancel if PLACED or CONFIRMED
  const CANCELLABLE_STATUSES = ["PLACED", "CONFIRMED"];
  if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
    throw new ApiError(
      400,
      `Cannot cancel order. The order is already in '${order.orderStatus}' status. Please contact support.`
    );
  }

  // 1. Restock products
  await restockOrderProducts(order.orderItems);

  // 2. Roll back coupon usage
  if (order.coupon?.couponId) {
    await rollbackCouponUsage(order.coupon, req.user._id);
  }

  // 3. Roll back Flash Deal claimed quota
  await rollbackFlashDealClaims(order.orderItems);

  // 4. Update order status and append to timeline
  order.orderStatus = "CANCELLED";
  order.cancellation = {
    reason: reason.trim(),
    cancelledAt: new Date(),
    cancelledBy: "CUSTOMER"
  };

  order.statusTimeline.push({
    status: "CANCELLED",
    timestamp: new Date(),
    note: `Order cancelled by customer. Reason: ${reason.trim()}`
  });

  await order.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { order },
      "Order cancelled successfully. Inventory and coupon have been restored."
    )
  );
});

/**
 * =====================================================================
 * ADMIN ORDER MANAGEMENT CONTROLLERS
 * =====================================================================
 */

/**
 * @desc    Get all orders across the store with filtering, search, and pagination
 * @route   GET /api/v1/orders/admin/all
 * @access  Private (Admin)
 */

export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    paymentMethod,
    search
  } = req.query;

  const query = {};

  if (status) {
    query.orderStatus = status.toUpperCase();
  }

  if (paymentStatus) {
    query["paymentInfo.status"] = paymentStatus.toUpperCase();
  }

  if (paymentMethod) {
    query["paymentInfo.method"] = paymentMethod.toUpperCase();
  }

  if (search && search.trim()) {
    query.$or = [
      { orderNumber: { $regex: search.trim(), $options: "i" } },
      { "shippingAddress.fullName": { $regex: search.trim(), $options: "i" } },
      { "shippingAddress.phone": { $regex: search.trim(), $options: "i" } }
    ];
  }

  const pageNumber = Math.max(1, parseInt(page, 10));
  const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNumber - 1) * limitNumber;

  const [orders, totalOrders] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("user", "name email phone"),
    Order.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          totalOrders,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalOrders / limitNumber),
          limit: limitNumber
        }
      },
      "Admin orders list retrieved successfully"
    )
  );
});

/**
 * @desc    Update order status along the fulfillment lifecycle
 * @route   PATCH /api/v1/orders/admin/:orderId/status
 * @access  Private (Admin)
 */

export const updateOrderStatusAdmin = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, note = "" } = req.body;

  if (!status) {
    throw new ApiError(400, "New order status is required");
  }

  const VALID_STATUSES = [
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "RETURNED"
  ];

  const normalizedStatus = status.toUpperCase();
  if (!VALID_STATUSES.includes(normalizedStatus)) {
    throw new ApiError(400, `Invalid order status. Allowed: ${VALID_STATUSES.join(", ")}`);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.orderStatus === "CANCELLED" || order.orderStatus === "DELIVERED") {
    throw new ApiError(
      400,
      `Cannot modify an order that is already '${order.orderStatus}'`
    );
  }

  // Update status and append to timeline
  order.orderStatus = normalizedStatus;
  order.statusTimeline.push({
    status: normalizedStatus,
    timestamp: new Date(),
    note: note || `Order status updated to ${normalizedStatus} by administrator.`
  });

  // If status is DELIVERED, record delivered timestamp and mark COD payment as PAID
  if (normalizedStatus === "DELIVERED") {
    order.trackingInfo = order.trackingInfo || {};
    order.trackingInfo.deliveredAt = new Date();

    if (order.paymentInfo.method === "COD" && order.paymentInfo.status === "PENDING") {
      order.paymentInfo.status = "PAID";
      order.paymentInfo.paidAt = new Date();

      // Trigger Event-Driven Loyalty & Badge Progression on User Model for COD delivery
      try {
        const userDoc = await User.findById(order.user);
        if (userDoc) {
          const userOrderCount = await Order.countDocuments({ user: order.user });
          await userDoc.recordOrderPayment({
            amount: order.pricing?.grandTotal || 0,
            orderCount: userOrderCount,
            orderNumber: order.orderNumber
          });
        }
      } catch (loyaltyErr) {
        console.error("Non-blocking loyalty update error on COD delivery:", loyaltyErr);
      }
    }
  }

  await order.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { order },
      `Order status successfully updated to '${normalizedStatus}'`
    )
  );
});

/**
 * @desc    Attach or update courier tracking information
 * @route   PATCH /api/v1/orders/admin/:orderId/tracking
 * @access  Private (Admin)
 */
export const updateOrderTrackingAdmin = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { courierPartner, trackingNumber, trackingUrl, estimatedDelivery } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.trackingInfo = {
    courierPartner: courierPartner || order.trackingInfo?.courierPartner || "",
    trackingNumber: trackingNumber || order.trackingInfo?.trackingNumber || "",
    trackingUrl: trackingUrl || order.trackingInfo?.trackingUrl || "",
    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : order.trackingInfo?.estimatedDelivery,
    deliveredAt: order.trackingInfo?.deliveredAt
  };

  // If tracking info is added and status is still PROCESSING/CONFIRMED, advance to SHIPPED
  if (courierPartner && trackingNumber && ["CONFIRMED", "PROCESSING"].includes(order.orderStatus)) {
    order.orderStatus = "SHIPPED";
    order.statusTimeline.push({
      status: "SHIPPED",
      timestamp: new Date(),
      note: `Package dispatched via ${courierPartner} (Tracking: ${trackingNumber})`
    });
  }

  await order.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { order },
      "Order tracking details updated successfully"
    )
  );
});

/**
 * @desc    Admin cancellation (with reason, inventory restocking, and coupon rollback)
 * @route   POST /api/v1/orders/admin/:orderId/cancel
 * @access  Private (Admin)
 */
export const cancelOrderAdmin = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason = "Cancelled by store administrator" } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.orderStatus === "CANCELLED") {
    throw new ApiError(400, "Order is already cancelled");
  }

  if (order.orderStatus === "DELIVERED") {
    throw new ApiError(400, "Cannot cancel an order that has already been delivered");
  }

  // 1. Restock products
  await restockOrderProducts(order.orderItems);

  // 2. Roll back coupon usage
  if (order.coupon?.couponId) {
    await rollbackCouponUsage(order.coupon, order.user);
  }

  // 3. Roll back Flash Deal claimed quota
  await rollbackFlashDealClaims(order.orderItems);

  order.orderStatus = "CANCELLED";
  order.cancellation = {
    reason: reason.trim(),
    cancelledAt: new Date(),
    cancelledBy: "ADMIN"
  };

  order.statusTimeline.push({
    status: "CANCELLED",
    timestamp: new Date(),
    note: `Order cancelled by admin. Reason: ${reason.trim()}`
  });

  await order.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { order },
      "Order cancelled by administrator. Inventory and coupon usage restored."
    )
  );
});
