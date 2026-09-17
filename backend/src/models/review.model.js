import mongoose from "mongoose";
import { Product } from "./product.model.js";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required for review"],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required for review"],
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },
    rating: {
      type: Number,
      required: [true, "Star rating (1-5) is required"],
      min: [1, "Rating must be at least 1 star"],
      max: [5, "Rating cannot exceed 5 stars"]
    },
    title: {
      type: String,
      required: [true, "Review headline is required"],
      trim: true,
      maxlength: [100, "Headline cannot exceed 100 characters"]
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters long"],
      maxlength: [1500, "Comment cannot exceed 1500 characters"]
    },
    // Electronics specific pros and cons
    pros: {
      type: [String],
      default: []
    },
    cons: {
      type: [String],
      default: []
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true }
      }
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Prevent multiple reviews on the same product from the same user
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for sorting reviews on product detail page
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ product: 1, rating: -1 });

/**
 * Static method to calculate and sync average rating & review count directly to Product model
 */
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: new mongoose.Types.ObjectId(productId) }
    },
    {
      $group: {
        _id: "$product",
        numReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      numReviews: stats[0].numReviews,
      averageRating: Math.round(stats[0].averageRating * 10) / 10
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      numReviews: 0,
      averageRating: 0
    });
  }
};

// Recalculate rating on product after a new review is saved
reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.product);
});

// Recalculate rating when a review is deleted or modified
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

export const Review = mongoose.model("Review", reviewSchema);
