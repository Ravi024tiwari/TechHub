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

// Download Tax Invoice PDF as a Blob and trigger native browser file save
export const downloadInvoicePdfApi = async (orderId, orderNumber = "INV") => {
  const response = await apiClient.get(`/invoices/${orderId}/download`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Invoice-${orderNumber}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return true;
};

// Submit verified purchase review for an order item
export const submitReviewApi = async (productId, { rating, title, comment, pros = [], cons = [] }) => {
  const response = await apiClient.post(`/reviews/${productId}`, {
    rating,
    title,
    comment,
    pros,
    cons,
  });
  return response.data;
};

// Submit return or replacement request for a delivered order item
export const submitReturnRequestApi = async ({
  orderId,
  orderItemId,
  requestType = "RETURN_AND_REFUND",
  reason,
  description,
  serialNumber = "",
}) => {
  const response = await apiClient.post("/returns", {
    orderId,
    orderItemId,
    requestType,
    reason,
    description,
    serialNumber,
  });
  return response.data;
};

