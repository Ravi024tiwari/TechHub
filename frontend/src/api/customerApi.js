import { apiClient } from "./client";

/**
 * Fetch 360-degree Customer Dashboard Summary:
 * Returns profile, VIP loyalty tier, lifetime metrics, 6-month spending trends,
 * category distribution, active orders with live tracking steps, and recent orders ledger.
 *
 * @route GET /api/v1/dashboard/customer/summary
 */
export const fetchCustomerDashboardSummary = async () => {
  const response = await apiClient.get("/dashboard/customer/summary");
  return response.data?.data;
};
