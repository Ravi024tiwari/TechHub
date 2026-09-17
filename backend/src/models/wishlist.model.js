import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required for wishlist"]
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required for wishlist"],
      unique: true,
      index: true
    },
    products: [wishlistItemSchema]
  },
  {
    timestamps: true
  }
);

// Compound index for fast lookup of whether a user has already wishlisted a specific product
wishlistSchema.index({ user: 1, "products.product": 1 });

/**
 * Instance Method: Check if a product ID exists in user's wishlist
 */
wishlistSchema.methods.hasProduct = function (productId) {
  return this.products.some(
    (item) => item.product.toString() === productId.toString()
  );
};

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
