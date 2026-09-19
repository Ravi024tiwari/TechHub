import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

/**
 * Standardized rate limit error response handler that aligns with our ApiError format
 */
const createRateLimitHandler = (message) => {
  return (req, res, next, options) => {
    throw new ApiError(
      options.statusCode || 429,
      message || "Too many requests from this IP. Please try again later."
    );
  };
};

/**
 * Base configuration options conforming to modern RFC standards 
 */
const baseOptions = {
  standardHeaders: "draft-7", // Return standard `RateLimit-*` headers
  legacyHeaders: false // Disable deprecated `X-RateLimit-*` headers
};

/**
 * 1. Global API Limiter
 * Applied across all /api/v1 routes to protect the server from DDoS and automated scrapers.
 * Limit: 200 requests per 15 minutes per IP.
 */
export const globalLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  handler: createRateLimitHandler(
    "Too many requests received from your IP address. Please slow down and try again after 15 minutes."
  )
});

/**
 * 2. Auth & Security Limiter
 * Applied to login, register, and password modification routes to protect against
 * brute-force password guessing and credential stuffing attacks.
 * Limit: 10 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  handler: createRateLimitHandler(
    "Too many authentication attempts from this IP address. Account access is temporarily throttled. Please try again in 15 minutes."
  )
});

/**
 * 3. Checkout & Payment Limiter
 * Applied to Razorpay session creation, payment verification, and COD order placement.
 * Prevents automated card testing bots, accidental double charging, and inventory lock spamming.
 * Limit: 10 requests per 5 minutes per IP.
 */
export const checkoutLimiter = rateLimit({
  ...baseOptions,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  handler: createRateLimitHandler(
    "Too many checkout or payment verification requests. Please wait a few minutes before trying again to avoid duplicate orders."
  )
});

/**
 * 4. Coupon Verification Limiter
 * Applied to promotional coupon application endpoint.
 * Prevents dictionary attacks and automated scripts from brute-forcing discount codes.
 * Limit: 8 attempts per 10 minutes per IP.
 */
export const couponLimiter = rateLimit({
  ...baseOptions,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 8,
  handler: createRateLimitHandler(
    "Too many coupon code validation attempts. Promotional code entry has been temporarily paused. Please try again in 10 minutes."
  )
});

/**
 * 5. Review & Rating Limiter
 * Applied to product review creation endpoint to prevent spam reviews and review flooding.
 * Limit: 5 reviews per 10 minutes per IP.
 */
export const reviewLimiter = rateLimit({
  ...baseOptions,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  handler: createRateLimitHandler(
    "You have submitted too many reviews in a short time. Please wait 10 minutes before submitting another review."
  )
});

/**
 * 6. Live Search & Suggestions Limiter
 * Applied to debounced live search suggestions to allow fast natural typing while
 * preventing malicious scripts from pegging the database CPU at 100%.
 * Limit: 60 queries per 1 minute per IP.
 */
export const searchLimiter = rateLimit({
  ...baseOptions,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  handler: createRateLimitHandler(
    "Search frequency limit reached. Please pause typing momentarily."
  )
});
