import { Router } from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  toggleHelpfulVote,
  checkCanUserReview
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { reviewLimiter } from "../middlewares/rateLimiter.middleware.js";

const reviewRouter = Router();

// Public: Fetch product reviews with infinite scroll cursor pagination & histogram
reviewRouter.get("/product/:productId", getProductReviews);

// Protected routes (Customer must be authenticated)
reviewRouter.get("/can-review/:productId", verifyJWT, checkCanUserReview);
reviewRouter.post("/:productId", verifyJWT, reviewLimiter, createReview);
reviewRouter.put("/:reviewId", verifyJWT, updateReview);
reviewRouter.delete("/:reviewId", verifyJWT, deleteReview);
reviewRouter.patch("/:reviewId/helpful", verifyJWT, toggleHelpfulVote);

export default reviewRouter;
