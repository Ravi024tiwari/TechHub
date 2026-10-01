import { apiClient } from "./client";

/**
 * Production Wishlist API Service:
 * Manages customer-isolated server-side wishlist persistence with MongoDB.
 */

// Fetch the authenticated customer's wishlist items
export const fetchWishlistApi = async () => {
  const response = await apiClient.get("/wishlist");
  return response.data?.data?.items || [];
};

// Toggle product in/out of the authenticated customer's wishlist
export const toggleWishlistApi = async (productId) => {
  const response = await apiClient.post(`/wishlist/toggle/${productId}`);
  return response.data;
};

// Check if a specific product is in customer's wishlist
export const checkWishlistStatusApi = async (productId) => {
  const response = await apiClient.get(`/wishlist/check/${productId}`);
  return response.data?.data?.isWishlisted || false;
};

// Move wishlist product directly to cart
export const moveWishlistItemToCartApi = async (productId) => {
  const response = await apiClient.post(`/wishlist/move-to-cart/${productId}`);
  return response.data;
};

// Clear all products from authenticated customer's wishlist
export const clearWishlistApi = async () => {
  const response = await apiClient.delete("/wishlist/clear");
  return response.data;
};
