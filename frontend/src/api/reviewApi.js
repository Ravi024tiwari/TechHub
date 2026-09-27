import { apiClient } from "./client";

/**
 * Fetch product reviews with cursor-based infinite scroll & rating histogram
 * @param {Object} params
 * @param {string} params.productId - Product ID
 * @param {number} [params.limit=6] - Number of items per page
 * @param {string} [params.cursor] - ISO timestamp cursor for infinite scroll
 * @param {string} [params.sortBy="newest"] - "newest" | "highest_rating" | "lowest_rating" | "most_helpful"
 * @param {number|string} [params.ratingFilter] - Optional star rating filter (1-5)
 */
export const fetchProductReviewsApi = async ({
  productId,
  limit = 6,
  cursor,
  sortBy = "newest",
  ratingFilter,
}) => {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.set("limit", String(limit));
  if (cursor) queryParams.set("cursor", cursor);
  if (sortBy) queryParams.set("sortBy", sortBy);
  if (ratingFilter) queryParams.set("ratingFilter", String(ratingFilter));

  const response = await apiClient.get(
    `/reviews/product/${productId}?${queryParams.toString()}`
  );
  return response.data?.data || response.data;
};

/**
 * Check if the currently authenticated user is eligible to review this product
 * (Must have an order containing this item with DELIVERED status, and not reviewed yet)
 */
export const checkCanUserReviewApi = async (productId) => {
  const response = await apiClient.get(`/reviews/can-review/${productId}`);
  return response.data?.data || response.data;
};

/**
 * Create a new verified customer review for a product
 */
export const createReviewApi = async (productId, reviewData) => {
  const response = await apiClient.post(`/reviews/${productId}`, reviewData);
  return response.data?.data || response.data;
};

/**
 * Update an existing customer review
 */
export const updateReviewApi = async (reviewId, reviewData) => {
  const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
  return response.data?.data || response.data;
};

/**
 * Delete a review (owner or admin)
 */
export const deleteReviewApi = async (reviewId) => {
  const response = await apiClient.delete(`/reviews/${reviewId}`);
  return response.data?.data || response.data;
};

/**
 * Toggle helpfulness upvote on a review
 */
export const toggleHelpfulVoteApi = async (reviewId) => {
  const response = await apiClient.patch(`/reviews/${reviewId}/helpful`);
  return response.data?.data || response.data;
};
