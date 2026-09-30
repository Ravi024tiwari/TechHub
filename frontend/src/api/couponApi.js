import { apiClient } from "./client";

/**
 * =====================================================================
 * COUPON API CLIENT SERVICE (Admin & Customer)
 * =====================================================================
 */

// 1. Fetch all coupons with filters, pagination and stats for Admin
export const fetchAdminCouponsApi = async (params = {}) => {
  const response = await apiClient.get("/coupons/admin/all", { params });
  return response.data?.data;
};

// 2. Fetch single coupon details by ID for Admin
export const fetchCouponByIdAdminApi = async (couponId) => {
  const response = await apiClient.get(`/coupons/admin/${couponId}`);
  return response.data?.data?.coupon;
};

// 3. Create a new coupon (Admin only)
export const createCouponApi = async (couponData) => {
  const response = await apiClient.post("/coupons/admin", couponData);
  return response.data?.data?.coupon;
};

// 4. Update coupon by ID (Admin only)
export const updateCouponApi = async (couponId, couponData) => {
  const response = await apiClient.put(`/coupons/admin/${couponId}`, couponData);
  return response.data?.data?.coupon;
};

// 5. Toggle coupon active/inactive status (Admin only)
export const toggleCouponStatusApi = async (couponId) => {
  const response = await apiClient.patch(`/coupons/admin/${couponId}/toggle`);
  return response.data?.data;
};

// 6. Delete coupon by ID (Admin only)
export const deleteCouponApi = async (couponId) => {
  const response = await apiClient.delete(`/coupons/admin/${couponId}`);
  return response.data?.data;
};

// 7. Fetch active unexpired promotional coupons (Customer & Guest)
export const fetchActiveCouponsApi = async () => {
  const response = await apiClient.get("/coupons/active");
  return response.data?.data?.coupons || [];
};

// 8. Fetch eligible coupons for authenticated cart
export const fetchAvailableCartCouponsApi = async () => {
  const response = await apiClient.get("/cart/coupons");
  return response.data?.data?.coupons || [];
};
