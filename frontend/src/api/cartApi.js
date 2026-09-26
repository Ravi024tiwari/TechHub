import { apiClient } from "./client";

/**
 * Production Cart & Checkout API Service:
 * Manages server-side cart persistence and guest/local synchronization.
 */

// Synchronize local / guest cart items with authenticated customer cart in MongoDB
export const syncCartApi = async (items) => {
  const response = await apiClient.post("/cart/sync", { items });
  return response.data;
};

// Fetch current user cart from MongoDB
export const fetchCartApi = async () => {
  const response = await apiClient.get("/cart");
  return response.data?.data?.cart || null;
};

// Clear customer cart on the backend
export const clearCartApi = async () => {
  const response = await apiClient.delete("/cart/clear");
  return response.data;
};

// Apply coupon code to cart
export const applyCouponApi = async (couponCode) => {
  const response = await apiClient.post("/cart/coupon/apply", { couponCode });
  return response.data;
};

// Remove active coupon from cart
export const removeCouponApi = async () => {
  const response = await apiClient.delete("/cart/coupon/remove");
  return response.data;
};
