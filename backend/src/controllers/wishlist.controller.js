import mongoose from "mongoose";
import { Wishlist } from "../models/wishlist.model.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
};


export const toggleWishlistProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  // Edge Case: Verify product exists in database and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found or has been discontinued");
  }

  const wishlist = await getOrCreateWishlist(req.user._id);

  // Check if product is already in the wishlist
  const isAlreadyWishlisted = wishlist.products.some(
    (item) => item.product?.toString() === productId.toString()
  );

  let updatedWishlist;
  let isWishlisted = false;
  let message = "";

  if (isAlreadyWishlisted) {
    // Action 1: Remove from Wishlist
    updatedWishlist = await Wishlist.findByIdAndUpdate(
      wishlist._id,
      {
        $pull: {
          products: { product: productId }
        }
      },
      { new: true }
    );
    isWishlisted = false;
    message = "Product removed from your wishlist";
  } else {
    // Action 2: Add to Wishlist
    updatedWishlist = await Wishlist.findByIdAndUpdate(
      wishlist._id,
      {
        $push: {
          products: {
            product: productId,
            addedAt: new Date()
          }
        }
      },
      { new: true }
    );
    isWishlisted = true;
    message = "Product added to your wishlist";
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isWishlisted,
        productId,
        totalWishlistItems: updatedWishlist?.products?.length || 0
      },
      message
    )
  );
});



export const getUserWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);

  // Populate product details
  await wishlist.populate({
    path: "products.product",
    select: "title slug brand category regularPrice salePrice stock images averageRating numReviews isActive"
  });

  // Edge Case: If Admin deleted a product, populated product will be null.
  // We filter out deleted products and self-heal the database document in the background.
  const validProducts = [];
  const validDbEntries = [];
  let hasGhostProducts = false;

  for (const item of wishlist.products) {
    if (item.product && item.product.isActive) {
      validProducts.push({
        _id: item._id,
        addedAt: item.addedAt,
        product: item.product
      });
      validDbEntries.push(item);
    } else {
      hasGhostProducts = true;
    }
  }

  // Self-Healing DB: Clean up ghost references if any were found
  if (hasGhostProducts) {
    wishlist.products = validDbEntries;
    await wishlist.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalItems: validProducts.length,
        items: validProducts
      },
      "Wishlist retrieved successfully"
    )
  );
});



export const checkWishlistStatus = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res
      .status(200)
      .json(new ApiResponse(200, { isWishlisted: false }, "Invalid ID format"));
  }

  const wishlist = await Wishlist.findOne({
    user: req.user._id,
    "products.product": productId
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { isWishlisted: Boolean(wishlist) },
      "Wishlist status checked"
    )
  );
});



export const moveWishlistItemToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product is no longer available");
  }

  if (product.stock <= 0) {
    throw new ApiError(400, "Product is currently out of stock");
  }

  // Active price (salePrice if available, otherwise regularPrice)
  const activePrice = product.salePrice && product.salePrice < product.regularPrice
    ? product.salePrice
    : product.regularPrice;

  // 1. Add to Customer's Cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingCartItem = cart.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingCartItem) {
    existingCartItem.quantity = Math.min(existingCartItem.quantity + 1, 5);
  } else {
    cart.items.push({
      product: product._id,
      quantity: 1,
      price: activePrice
    });
  }

  await cart.save();

  // 2. Remove from Wishlist
  await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { products: { product: productId } }
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { cart },
      "Product moved from wishlist to cart successfully"
    )
  );
});



export const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $set: { products: [] } },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { totalItems: 0, items: [] },
      "Wishlist cleared successfully"
    )
  );
});
