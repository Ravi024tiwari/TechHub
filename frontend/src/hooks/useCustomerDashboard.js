import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCustomerDashboardSummary } from "../api/customerApi";

export const CUSTOMER_DASHBOARD_QUERY_KEY = ["customer", "dashboard", "summary"];

/**
 * Enterprise Production Hook for Customer Dashboard Summary:
 * - 2-second fresh data cache (staleTime: 2,000ms)
 * - 5-second garbage collection retention (gcTime: 5,000ms)
 * - High-speed instant rendering
 */
export function useCustomerDashboardQuery(options = {}) {
  return useQuery({
    queryKey: CUSTOMER_DASHBOARD_QUERY_KEY,
    queryFn: fetchCustomerDashboardSummary,
    staleTime: 2000, // 2 seconds fresh cache
    gcTime: 5000,    // 5 seconds garbage collection
    refetchOnWindowFocus: true,
    ...options
  });
}

/**
 * Helper to manually invalidate and refresh customer dashboard cache
 */
export function useInvalidateCustomerDashboard() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: CUSTOMER_DASHBOARD_QUERY_KEY });
  };
}
