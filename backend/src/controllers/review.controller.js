import mongoose from "mongoose";
import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Helper: Aggregate star rating breakdown histogram for a product
 */
const getProductRatingHistogram = async (productId) => {
  const objectId = new mongoose.Types.ObjectId(productId);

  const stats = await Review.aggregate([
    { $match: { product: objectId } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 }
      }
    }
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  let totalReviews = 0;
  let totalScore = 0;

  for (const item of stats) {
    distribution[item._id] = item.count;
    totalReviews += item.count;
    totalScore += item._id * item.count;
  }

  const averageRating = totalReviews > 0
    ? Math.round((totalScore / totalReviews) * 10) / 10
    : 0;

  const percentages = {};
  for (let star = 1; star <= 5; star++) {
    percentages[star] = totalReviews > 0
      ? Math.round((distribution[star] / totalReviews) * 100)
      : 0;
  }

  return {
    averageRating,
    totalReviews,
    distribution,
    percentages
  };
};


export const checkCanUserReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  // 1. Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id
  });

  if (existingReview) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          canReview: false,
          hasReviewed: true,
          existingReview,
          reason: "You have already reviewed this product. You can update your existing review."
        },
        "User review eligibility checked"
      )
    );
  }

  // 2. Check if user has an order with status DELIVERED containing this product
  const deliveredOrder = await Order.findOne({
    user: req.user._id,
    "orderItems.product": productId,
    orderStatus: "DELIVERED"
  });

  if (!deliveredOrder) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          canReview: false,
          hasReviewed: false,
          reason: "Only customers who have purchased and received this product can write a review."
        },
        "User review eligibility checked"
      )
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        canReview: true,
        hasReviewed: false,
        deliveredOrderId: deliveredOrder._id
      },
      "Customer is eligible to review this product"
    )
  );
});


export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment, pros = [], cons = [] } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  // Validate rating
  const parsedRating = Number(rating);
  if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
    throw new ApiError(400, "Star rating must be an integer between 1 and 5");
  }

  // Validate headline & comment
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    throw new ApiError(400, "Review headline must be at least 3 characters long");
  }

  if (!comment || typeof comment !== "string" || comment.trim().length < 10) {
    throw new ApiError(400, "Review comment must be at least 10 characters long");
  }

  // Verify product exists and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found or is no longer available");
  }

  // Restriction 1: Prevent duplicate reviews by the same user
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id
  });

  if (existingReview) {
    throw new ApiError(
      409,
      "You have already submitted a review for this product. Please edit your existing review instead."
    );
  }

  // Restriction 2: Verified Purchase Enforcement
  // Must have purchased the product in an order that has reached DELIVERED status
  const verifiedOrder = await Order.findOne({
    user: req.user._id,
    "orderItems.product": productId,
    orderStatus: "DELIVERED"
  });

  if (!verifiedOrder) {
    throw new ApiError(
      403,
      "Access restricted: Only customers who have purchased and received this product can write a review."
    );
  }

  // Clean and normalize pros and cons
  const cleanPros = Array.isArray(pros)
    ? pros.map((p) => String(p).trim()).filter(Boolean).slice(0, 5)
    : [];

  const cleanCons = Array.isArray(cons)
    ? cons.map((c) => String(c).trim()).filter(Boolean).slice(0, 5)
    : [];

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: verifiedOrder._id,
    rating: parsedRating,
    title: title.trim(),
    comment: comment.trim(),
    pros: cleanPros,
    cons: cleanCons,
    isVerifiedPurchase: true
  });

  await review.populate("user", "name avatar");

  return res.status(201).json(
    new ApiResponse(
      201,
      { review },
      "Thank you! Your review has been submitted successfully."
    )
  );
});

/**
 * @desc    Fetch product reviews with Infinite Scroll (cursor-based pagination) & Rating Histogram
 * @route   GET /api/v1/reviews/product/:productId
 * @access  Public
 */

export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const {
    limit = 6,
    cursor,
    sortBy = "newest", // "newest", "highest_rating", "lowest_rating", "most_helpful"
    ratingFilter
  } = req.query;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const limitNumber = Math.min(30, Math.max(1, parseInt(limit, 10)));

  // Base query
  const query = { product: productId };

  // Optional star rating filter
  if (ratingFilter) {
    const starNum = parseInt(ratingFilter, 10);
    if (starNum >= 1 && starNum <= 5) {
      query.rating = starNum;
    }
  }

  // Sorting definitions
  let sortCriteria = { createdAt: -1, _id: -1 };

  if (sortBy === "highest_rating") {
    sortCriteria = { rating: -1, createdAt: -1, _id: -1 };
  } else if (sortBy === "lowest_rating") {
    sortCriteria = { rating: 1, createdAt: -1, _id: -1 };
  } else if (sortBy === "most_helpful") {
    sortCriteria = { helpfulCount: -1, createdAt: -1, _id: -1 };
  }

  // Cursor pagination logic: cursor represents the createdAt ISO timestamp of the last loaded item
  if (cursor) {
    const cursorDate = new Date(cursor);
    if (!isNaN(cursorDate.getTime())) {
      query.createdAt = { $lt: cursorDate };
    }
  }

  // Fetch limit + 1 items to determine hasMore
  const reviews = await Review.find(query)
    .sort(sortCriteria)
    .limit(limitNumber + 1)
    .populate("user", "name avatar")
    .select("-__v");

  const hasMore = reviews.length > limitNumber;
  const results = hasMore ? reviews.slice(0, limitNumber) : reviews;

  const nextCursor =
    hasMore && results.length > 0
      ? results[results.length - 1].createdAt.toISOString()
      : null;

  // Include rating histogram summary on initial request (when cursor is absent)
  let ratingStats = null;
  if (!cursor) {
    ratingStats = await getProductRatingHistogram(productId);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews: results,
        nextCursor,
        hasMore,
        ratingStats
      },
      "Product reviews retrieved successfully"
    )
  );
});

/**
 * @desc    Update a customer's existing review
 * @route   PUT /api/v1/reviews/:reviewId
 * @access  Private (Owner of the review)
 */

export const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, title, comment, pros, cons } = req.body;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID format");
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Ensure only the author can edit their review
  if (review.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own reviews");
  }

  if (rating !== undefined) {
    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5 stars");
    }
    review.rating = parsedRating;
  }

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 3) {
      throw new ApiError(400, "Headline must be at least 3 characters long");
    }
    review.title = title.trim();
  }

  if (comment !== undefined) {
    if (typeof comment !== "string" || comment.trim().length < 10) {
      throw new ApiError(400, "Comment must be at least 10 characters long");
    }
    review.comment = comment.trim();
  }

  if (pros !== undefined && Array.isArray(pros)) {
    review.pros = pros.map((p) => String(p).trim()).filter(Boolean).slice(0, 5);
  }

  if (cons !== undefined && Array.isArray(cons)) {
    review.cons = cons.map((c) => String(c).trim()).filter(Boolean).slice(0, 5);
  }

  await review.save();
  await review.populate("user", "name avatar");

  return res.status(200).json(
    new ApiResponse(200, { review }, "Review updated successfully")
  );
});

/**
 * @desc    Delete a review (recalculates product rating automatically)
 * @route   DELETE /api/v1/reviews/:reviewId
 * @access  Private (Owner or Admin)
 */

export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID format");
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Access forbidden: You cannot delete this review");
  }

  const productId = review.product;
  await Review.findByIdAndDelete(reviewId);

  // Recalculate average rating on product
  await Review.calculateAverageRating(productId);

  return res.status(200).json(
    new ApiResponse(200, { reviewId }, "Review deleted successfully")
  );
});

/**
 * @desc    Toggle helpful vote on a review (prevents spam / duplicate upvotes)
 * @route   PATCH /api/v1/reviews/:reviewId/helpful
 * @access  Private (Customer)
 */
export const toggleHelpfulVote = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID format");
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Prevent users from upvoting their own reviews
  if (review.user.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot upvote your own review");
  }

  const alreadyVotedIndex = review.helpfulUsers.findIndex(
    (userId) => userId.toString() === req.user._id.toString()
  );

  let isHelpful = false;

  if (alreadyVotedIndex > -1) {
    // Unvote
    review.helpfulUsers.splice(alreadyVotedIndex, 1);
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    isHelpful = false;
  } else {
    // Upvote
    review.helpfulUsers.push(req.user._id);
    review.helpfulCount += 1;
    isHelpful = true;
  }

  await review.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviewId: review._id,
        helpfulCount: review.helpfulCount,
        isHelpful
      },
      isHelpful ? "Marked review as helpful" : "Helpful vote removed"
    )
  );
});
