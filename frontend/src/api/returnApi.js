import { apiClient } from "./client";

/**
 * Customer & Admin RMA (Returns & Replacements) API Service
 */

// 1. Submit a Return or Replacement request (multipart/form-data with evidence images)
export const submitReturnRequestApi = async (formData) => {
  const response = await apiClient.post("/returns", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 2. Fetch customer's own return requests
export const fetchMyReturnsApi = async (params = {}) => {
  const response = await apiClient.get("/returns/my-returns", { params });
  return response.data?.data || response.data;
};

// 3. Fetch detailed view of a specific return request
export const fetchReturnDetailsApi = async (returnId) => {
  const response = await apiClient.get(`/returns/${returnId}`);
  return response.data?.data || response.data;
};

// 4. Cancel a pending return request (Customer)
export const cancelReturnRequestApi = async (returnId) => {
  const response = await apiClient.patch(`/returns/${returnId}/cancel`);
  return response.data;
};

// 5. Admin: Fetch all return requests with filters and pagination
export const fetchAllReturnsAdminApi = async (params = {}) => {
  const response = await apiClient.get("/returns/admin/all", { params });
  return response.data?.data || response.data;
};

// 6. Admin: Review, Approve, Reject or advance status
export const reviewReturnStatusAdminApi = async (returnId, { status, adminRemarks = "", rejectionReason = "" }) => {
  const response = await apiClient.patch(`/returns/admin/${returnId}/status`, {
    status,
    adminRemarks,
    rejectionReason,
  });
  return response.data;
};

// 7. Admin: Process Programmatic Razorpay / COD refund
export const processReturnRefundAdminApi = async (returnId, { customAmount, restockItem = true, notes = "" } = {}) => {
  const response = await apiClient.post(`/returns/admin/${returnId}/refund`, {
    customAmount,
    restockItem,
    notes,
  });
  return response.data;
};

// 8. Admin: Dispatch replacement unit (auto-deduct inventory & attach tracking)
export const dispatchReplacementAdminApi = async (
  returnId,
  { courierPartner, trackingNumber, restockReturnedItem = false, adminRemarks = "" }
) => {
  const response = await apiClient.post(`/returns/admin/${returnId}/replacement`, {
    courierPartner,
    trackingNumber,
    restockReturnedItem,
    adminRemarks,
  });
  return response.data;
};
