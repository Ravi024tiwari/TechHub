import crypto from "crypto";
import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { User } from "../models/user.model.js";
import { FlashDeal } from "../models/flashDeal.model.js";
import { razorpayInstance } from "../config/razorpay.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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



const atomicallyReserveStock = async (cartItems) => {
  const successfullyDecremented = [];

  for (const item of cartItems) {
    const productId = item.product._id || item.product;
    const qtyToDeduct = item.quantity;
    const chosenColor = item.selectedSpecs?.color;

    let updatedProduct = null;

    // 1. If item has a chosen color variant, attempt atomic variant-level deduction
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
          { new: true }
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
        { new: true }
      );

      if (updatedProduct) {
        successfullyDecremented.push({ productId, quantity: qtyToDeduct });
      }
    }

    if (!updatedProduct) {
      // Roll back any products that were already decremented in this batch
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

      const productInfo = await Product.findById(productId);
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
const commitCouponUsage = async (couponSnapshot, userId) => {
  if (!couponSnapshot?.couponId) return;

  const coupon = await Coupon.findById(couponSnapshot.couponId);
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

  await coupon.save();
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

  // Pre-checkout stock verification
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      throw new ApiError(
        400,
        `One or more items in your cart are no longer available. Please review your cart.`
      );
    }

    const chosenColor = item.selectedSpecs?.color;
    if (chosenColor && item.product.colors && item.product.colors.length > 0) {
      const variant = item.product.colors.find(
        (c) => c.colorName.toLowerCase() === chosenColor.toLowerCase()
      );
      if (variant) {
        if (variant.stock < item.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for '${item.product.title}' (${chosenColor}). Only ${variant.stock} unit(s) available in this color.`
          );
        }
      } else if (item.product.stock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for '${item.product.title}'. Only ${item.product.stock} available.`
        );
      }
    } else if (item.product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for '${item.product.title}'. Only ${item.product.stock} available.`
      );
    }
  }

  // Grand total in paise (Razorpay takes smallest currency unit)
  const amountInPaise = Math.round(cart.pricing.grandTotal * 100);

  if (amountInPaise <= 0) {
    throw new ApiError(400, "Invalid order total amount");
  }

  const receipt = `rcpt_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;

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

  const razorpayOrder = await razorpayInstance.orders.create(razorpayOptions);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      },
      "Razorpay order initialized successfully"
    )
  );
});



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

  // Cryptographic Signature Verification (HMAC-SHA256)
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
    throw new ApiError(
      400,
      "Cart is empty or has already been processed into an order."
    );
  }

  // Atomically lock and decrement inventory
  await atomicallyReserveStock(cart.items);

  // Prepare immutable order snapshots
  const orderItemsSnapshots = buildOrderItemSnapshots(cart.items);

  // Prepare permanent coupon snapshot
  const couponSnapshot = {
    couponId: cart.coupon?.couponId || null,
    code: cart.coupon?.code || null,
    discountAmount: cart.coupon?.discountAmount || 0
  };

  // Create Order in MongoDB
  const newOrder = await Order.create({
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

  // Commit coupon usage in database
  if (couponSnapshot.couponId) {
    await commitCouponUsage(couponSnapshot, req.user._id);
  }

  // Increment Flash Deal claimed quota if any item is enrolled
  await incrementFlashDealClaims(newOrder.orderItems);

  // Clear customer cart
  cart.items = [];
  cart.coupon = { couponId: null, code: null, discountAmount: 0 };
  await cart.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      { order: newOrder },
      "Payment verified and order placed successfully!"
    )
  );
});



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

  // Atomically lock and decrement inventory
  await atomicallyReserveStock(cart.items);

  // Prepare immutable order snapshots
  const orderItemsSnapshots = buildOrderItemSnapshots(cart.items);

  // Prepare permanent coupon snapshot
  const couponSnapshot = {
    couponId: cart.coupon?.couponId || null,
    code: cart.coupon?.code || null,
    discountAmount: cart.coupon?.discountAmount || 0
  };

  // Create Order in MongoDB
  const newOrder = await Order.create({
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

  // Commit coupon usage in database
  if (couponSnapshot.couponId) {
    await commitCouponUsage(couponSnapshot, req.user._id);
  }

  // Increment Flash Deal claimed quota if any item is enrolled
  await incrementFlashDealClaims(newOrder.orderItems);

  // Clear customer cart
  cart.items = [];
  cart.coupon = { couponId: null, code: null, discountAmount: 0 };
  await cart.save();

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

  const [orders, totalOrders] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .select("-__v"),
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

  return res.status(200).json(
    new ApiResponse(200, { order }, "Order details retrieved successfully")
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
