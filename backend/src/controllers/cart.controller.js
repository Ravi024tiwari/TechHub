import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { FlashDeal } from "../models/flashDeal.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Standard population fields for products in cart items
 */
const CART_POPULATE_FIELDS =
  "title slug brand category regularPrice salePrice stock images isActive";


const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      coupon: { couponId: null, code: null, discountAmount: 0 }
    });
  }
  return cart;
};

/**
 * Helper to calculate active product price (accounting for sales)
 */
const getActiveProductPrice = (product) => {
  return product.salePrice && product.salePrice < product.regularPrice
    ? product.salePrice
    : product.regularPrice;
};

/**
 * Helper to check if a product is enrolled in a live Flash Deal with remaining stock quota
 */
const getActiveFlashDealPrice = async (productId) => {
  const now = new Date();
  const activeDeal = await FlashDeal.findOne({
    status: "ACTIVE",
    startTime: { $lte: now },
    endTime: { $gte: now },
    "products.product": productId
  });

  if (!activeDeal) return null;

  const dealItem = activeDeal.products.find(
    (p) => p.product.toString() === productId.toString()
  );

  if (dealItem && dealItem.claimedCount < dealItem.dealStock) {
    return {
      dealPrice: dealItem.dealPrice,
      dealId: activeDeal._id,
      discountPercentage: dealItem.discountPercentage
    };
  }

  return null;
};

/**
 * Helper to validate and recalculate active dynamic coupon on cart
 */
const syncCartCoupon = async (cart, userId, subtotal) => {
  if (!cart.coupon?.code) return false;

  const coupon = cart.coupon.couponId
    ? await Coupon.findById(cart.coupon.couponId)
    : await Coupon.findOne({ code: cart.coupon.code });

  if (!coupon) {
    cart.coupon = { couponId: null, code: null, discountAmount: 0 };
    return true;
  }

  const eligibility = coupon.validateCouponEligibility(userId, subtotal);
  if (!eligibility.valid) {
    // Subtotal or timeline no longer qualifies for this coupon
    cart.coupon = { couponId: null, code: null, discountAmount: 0 };
    return true;
  }

  const updatedDiscount = coupon.calculateDiscount(subtotal);
  if (cart.coupon.discountAmount !== updatedDiscount || !cart.coupon.couponId) {
    cart.coupon.couponId = coupon._id;
    cart.coupon.code = coupon.code;
    cart.coupon.discountAmount = updatedDiscount;
    return true;
  }

  return false;
};



export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  // Populate product details for all cart items
  await cart.populate({
    path: "items.product",
    select: CART_POPULATE_FIELDS
  });

  // Self-healing & Real-Time Price Sync:
  // 1. Remove items if product was deleted by Admin
  // 2. Synchronize item price if sale/regular price changed in catalog
  let isModified = false;
  const validItems = [];

  for (const item of cart.items) {
    if (!item.product) {
      isModified = true;
      continue;
    }

    const flashDeal = await getActiveFlashDealPrice(item.product._id);
    const currentActivePrice = flashDeal ? flashDeal.dealPrice : getActiveProductPrice(item.product);
    if (item.price !== currentActivePrice) {
      item.price = currentActivePrice;
      isModified = true;
    }

    validItems.push(item);
  }

  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    isModified = true;
  }

  const currentSubtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Validate applied coupon against database rules
  const couponModified = await syncCartCoupon(cart, req.user._id, currentSubtotal);
  if (couponModified) {
    isModified = true;
  }

  if (isModified) {
    await cart.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { cart },
      "Cart fetched successfully"
    )
  );
});



export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, selectedSpecs = {} } = req.body;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Valid product ID is required");
  }

  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty < 1) {
    throw new ApiError(400, "Quantity must be a positive integer");
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product is not available or has been discontinued");
  }

  if (product.stock <= 0) {
    throw new ApiError(400, "Product is currently out of stock");
  }

  const cart = await getOrCreateCart(req.user._id);

  // Normalize selected specs for electronics (color, storage, ram)
  const normalizedSpecs = {
    color: (selectedSpecs?.color || "").trim(),
    storage: (selectedSpecs?.storage || "").trim(),
    ram: (selectedSpecs?.ram || "").trim()
  };

  // Color variant stock & pricing resolution
  let availableStock = product.stock;
  let activePrice = getActiveProductPrice(product);

  if (normalizedSpecs.color && product.colors && product.colors.length > 0) {
    const matchedVariant = product.colors.find(
      (c) => c.colorName.toLowerCase() === normalizedSpecs.color.toLowerCase()
    );
    if (!matchedVariant) {
      throw new ApiError(
        400,
        `Selected color '${normalizedSpecs.color}' is not available for this product`
      );
    }
    availableStock = matchedVariant.stock;
    if (matchedVariant.priceOverride) {
      activePrice = matchedVariant.priceOverride;
    }
  }

  // Check if product is part of a live Flash Deal with remaining dealStock
  const flashDeal = await getActiveFlashDealPrice(product._id);
  if (flashDeal) {
    activePrice = flashDeal.dealPrice;
  }

  // Find matching item by product ID AND matching specifications
  const existingItemIndex = cart.items.findIndex((item) => {
    const isSameProduct = item.product.toString() === productId.toString();
    const isSameColor = (item.selectedSpecs?.color || "") === normalizedSpecs.color;
    const isSameStorage = (item.selectedSpecs?.storage || "") === normalizedSpecs.storage;
    const isSameRam = (item.selectedSpecs?.ram || "") === normalizedSpecs.ram;
    return isSameProduct && isSameColor && isSameStorage && isSameRam;
  });

  if (existingItemIndex > -1) {
    const existingItem = cart.items[existingItemIndex];
    const targetQuantity = existingItem.quantity + parsedQty;

    // Enforce maximum 5 units per electronic gadget limit
    if (targetQuantity > 5) {
      throw new ApiError(
        400,
        `Maximum allowed quantity is 5 units per item. You already have ${existingItem.quantity} in your cart.`
      );
    }

    // Enforce real-time inventory limit
    if (targetQuantity > availableStock) {
      const colorMsg = normalizedSpecs.color ? ` for color '${normalizedSpecs.color}'` : "";
      throw new ApiError(
        400,
        `Only ${availableStock} units available in stock${colorMsg}. You currently have ${existingItem.quantity} in your cart.`
      );
    }

    existingItem.quantity = targetQuantity;
    existingItem.price = activePrice;
  } else {
    if (parsedQty > 5) {
      throw new ApiError(400, "Maximum allowed quantity is 5 units per item");
    }

    if (parsedQty > availableStock) {
      const colorMsg = normalizedSpecs.color ? ` for color '${normalizedSpecs.color}'` : "";
      throw new ApiError(
        400,
        `Only ${availableStock} units available in stock${colorMsg} for this product`
      );
    }

    cart.items.push({
      product: product._id,
      quantity: parsedQty,
      price: activePrice,
      selectedSpecs: normalizedSpecs
    });
  }

  // Pre-save recalculates subtotal, taxes, shipping, discount, and grand total
  await cart.save();

  // Re-verify active coupon with new subtotal
  await syncCartCoupon(cart, req.user._id, cart.pricing.subtotal);
  await cart.save();

  await cart.populate({
    path: "items.product",
    select: CART_POPULATE_FIELDS
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { cart },
      "Product added to cart successfully"
    )
  );
});



export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!itemId) {
    throw new ApiError(400, "Item ID is required");
  }

  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty < 1) {
    throw new ApiError(
      400,
      "Quantity must be at least 1. Use the remove endpoint to delete an item."
    );
  }

  if (parsedQty > 5) {
    throw new ApiError(400, "Maximum 5 units allowed per electronic gadget");
  }

  const cart = await getOrCreateCart(req.user._id);

  // Locate item either by cartItem._id or by matching product ID
  const cartItem = cart.items.find(
    (item) =>
      item._id.toString() === itemId.toString() ||
      item.product.toString() === itemId.toString()
  );

  if (!cartItem) {
    throw new ApiError(404, "Item not found in your cart");
  }

  // Verify product inventory in database
  const product = await Product.findById(cartItem.product);
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product is no longer available in the catalog");
  }

  if (parsedQty > product.stock) {
    throw new ApiError(
      400,
      `Cannot update quantity. Only ${product.stock} units available in stock.`
    );
  }

  cartItem.quantity = parsedQty;
  cartItem.price = getActiveProductPrice(product);

  await cart.save();

  // Re-verify active coupon with updated subtotal
  await syncCartCoupon(cart, req.user._id, cart.pricing.subtotal);
  await cart.save();

  await cart.populate({
    path: "items.product",
    select: CART_POPULATE_FIELDS
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { cart },
      "Cart item quantity updated successfully"
    )
  );
});



export const removeItemFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  if (!itemId) {
    throw new ApiError(400, "Item ID is required");
  }

  const cart = await getOrCreateCart(req.user._id);

  const initialCount = cart.items.length;
  cart.items = cart.items.filter(
    (item) =>
      item._id.toString() !== itemId.toString() &&
      item.product.toString() !== itemId.toString()
  );

  if (cart.items.length === initialCount) {
    throw new ApiError(404, "Item not found in your cart");
  }

  // If cart becomes empty, reset any active coupon
  if (cart.items.length === 0) {
    cart.coupon = { couponId: null, code: null, discountAmount: 0 };
  } else {
    // Check if remaining subtotal still meets coupon requirement
    await cart.save();
    await syncCartCoupon(cart, req.user._id, cart.pricing.subtotal);
  }

  await cart.save();

  await cart.populate({
    path: "items.product",
    select: CART_POPULATE_FIELDS
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { cart },
      "Item removed from cart successfully"
    )
  );
});



export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  cart.items = [];
  cart.coupon = { couponId: null, code: null, discountAmount: 0 };

  await cart.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { cart },
      "Cart cleared successfully"
    )
  );
});



export const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;

  if (!couponCode || typeof couponCode !== "string") {
    throw new ApiError(400, "Coupon code is required");
  }

  const normalizedCode = couponCode.trim().toUpperCase();

  const cart = await getOrCreateCart(req.user._id);

  if (!cart.items || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty. Add products before applying a coupon.");
  }

  // Query coupon from database
  const coupon = await Coupon.findOne({ code: normalizedCode });
  if (!coupon) {
    throw new ApiError(404, `Coupon code '${normalizedCode}' not found`);
  }

  // Calculate current subtotal
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Validate coupon against database rules
  const eligibility = coupon.validateCouponEligibility(req.user._id, subtotal);
  if (!eligibility.valid) {
    throw new ApiError(400, eligibility.message);
  }

  const calculatedDiscount = coupon.calculateDiscount(subtotal);

  cart.coupon = {
    couponId: coupon._id,
    code: coupon.code,
    discountAmount: calculatedDiscount
  };

  await cart.save();

  await cart.populate({
    path: "items.product",
    select: CART_POPULATE_FIELDS
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        cart,
        couponSummary: {
          couponId: coupon._id,
          code: coupon.code,
          discountAmount: calculatedDiscount,
          description: coupon.description
        }
      },
      `Coupon '${coupon.code}' applied successfully!`
    )
  );
});



export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  cart.coupon = { couponId: null, code: null, discountAmount: 0 };
  await cart.save();

  await cart.populate({
    path: "items.product",
    select: CART_POPULATE_FIELDS
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { cart },
      "Coupon removed successfully"
    )
  );
});



export const getAvailableCoupons = asyncHandler(async (req, res) => {
  const now = new Date();
  const userId = req.user._id;

  const coupons = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    expiryDate: { $gt: now }
  }).sort({ minOrderValue: 1 });

  const eligibleCoupons = coupons
    .filter((coupon) => {
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return false;
      }
      const userRecord = coupon.usersUsed.find(
        (record) => record.user.toString() === userId.toString()
      );
      if (userRecord && userRecord.usedCount >= coupon.usageLimitPerUser) {
        return false;
      }
      return true;
    })
    .map((coupon) => ({
      _id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minOrderValue: coupon.minOrderValue,
      expiryDate: coupon.expiryDate
    }));

  return res.status(200).json(
    new ApiResponse(
      200,
      { coupons: eligibleCoupons },
      "Available promotional coupons retrieved"
    )
  );
});



export const syncCart = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    throw new ApiError(400, "Items must be an array of cart items");
  }

  const cart = await getOrCreateCart(req.user._id);

  for (const guestItem of items) {
    if (
      !guestItem.productId ||
      !mongoose.Types.ObjectId.isValid(guestItem.productId)
    ) {
      continue;
    }

    const qtyToAdd = Math.max(1, parseInt(guestItem.quantity || 1, 10));
    const product = await Product.findById(guestItem.productId);

    if (!product || !product.isActive || product.stock <= 0) {
      continue;
    }

    const normalizedSpecs = {
      color: (guestItem.selectedSpecs?.color || "").trim(),
      storage: (guestItem.selectedSpecs?.storage || "").trim(),
      ram: (guestItem.selectedSpecs?.ram || "").trim()
    };

    const existingIndex = cart.items.findIndex((item) => {
      const isSameProduct =
        item.product.toString() === guestItem.productId.toString();
      const isSameColor =
        (item.selectedSpecs?.color || "") === normalizedSpecs.color;
      const isSameStorage =
        (item.selectedSpecs?.storage || "") === normalizedSpecs.storage;
      const isSameRam =
        (item.selectedSpecs?.ram || "") === normalizedSpecs.ram;
      return isSameProduct && isSameColor && isSameStorage && isSameRam;
    });

    const activePrice = getActiveProductPrice(product);

    if (existingIndex > -1) {
      const existingItem = cart.items[existingIndex];
      const mergedQty = Math.min(
        existingItem.quantity + qtyToAdd,
        Math.min(5, product.stock)
      );
      existingItem.quantity = mergedQty;
      existingItem.price = activePrice;
    } else {
      const finalQty = Math.min(qtyToAdd, Math.min(5, product.stock));
      cart.items.push({
        product: product._id,
        quantity: finalQty,
        price: activePrice,
        selectedSpecs: normalizedSpecs
      });
    }
  }

  await cart.save();

  // Re-verify coupon with merged cart subtotal
  await syncCartCoupon(cart, req.user._id, cart.pricing.subtotal);
  await cart.save();

  await cart.populate({
    path: "items.product",
    select: CART_POPULATE_FIELDS
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { cart },
      "Guest cart successfully merged with your account"
    )
  );
});
