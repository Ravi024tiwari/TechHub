import { apiClient } from "./client";

/**
 * Customer Orders & Checkout API Service:
 * Pure network calls returning promise responses.
 */

// Place Cash on Delivery (COD) order
export const placeCodOrderApi = async (orderPayload) => {
  const response = await apiClient.post("/orders/checkout/cod", orderPayload);
  return response.data; // { statusCode, data: { order }, message }
};

// Initialize Razorpay Order
export const createRazorpayOrderApi = async (orderPayload) => {
  const response = await apiClient.post("/orders/checkout/razorpay", orderPayload);
  return response.data;
};

// Verify Razorpay Payment & place order
export const verifyRazorpayPaymentApi = async (paymentPayload) => {
  const response = await apiClient.post("/orders/checkout/verify-payment", paymentPayload);
  return response.data;
};

// Fetch current customer orders
export const fetchMyOrdersApi = async (params = {}) => {
  const response = await apiClient.get("/orders/my-orders", { params });
  return response.data?.data?.orders || [];
};

// Fetch single order details
export const fetchOrderByIdApi = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data?.data?.order || response.data?.data;
};

// Cancel customer order
export const cancelOrderApi = async (orderId, reason = "") => {
  const response = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};
