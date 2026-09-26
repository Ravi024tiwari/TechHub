import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminOverview,
  fetchAdminSalesAnalytics,
  fetchAdminInventoryHealth,
  fetchAdminCustomerInsights,
} from "../api/adminApi";
import { useAuthStore } from "../store/useAuthStore";

export const DASHBOARD_KEYS = {
  all: ["admin", "dashboard"],
  overview: () => [...DASHBOARD_KEYS.all, "overview"],
  sales: (timeframe) => [...DASHBOARD_KEYS.all, "sales", timeframe],
  inventory: () => [...DASHBOARD_KEYS.all, "inventory"],
  insights: () => [...DASHBOARD_KEYS.all, "insights"],
};

// 2-minute staleTime as specified by client (renders cached data up to 2 mins before contacting DB)
const CACHE_STALE_TIME = 1000 * 60 * 2; // 2 minutes
const CACHE_GC_TIME = 1000 * 60 * 10; // 10 minutes

/**
 * Hook to retrieve executive overview metrics (KPIs, recent orders, catalog counts)
 */
export function useAdminOverviewQuery() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  return useQuery({
    queryKey: DASHBOARD_KEYS.overview(),
    queryFn: fetchAdminOverview,
    enabled: Boolean(isAdmin),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to retrieve sales analytics with interactive timeframe selector (7d, 30d, 90d, 1y)
 */
export function useAdminSalesAnalyticsQuery(timeframe = "30d") {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  return useQuery({
    queryKey: DASHBOARD_KEYS.sales(timeframe),
    queryFn: () => fetchAdminSalesAnalytics(timeframe),
    enabled: Boolean(isAdmin),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to retrieve inventory health, low stock alerts, and bestsellers
 */
export function useAdminInventoryHealthQuery() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  return useQuery({
    queryKey: DASHBOARD_KEYS.inventory(),
    queryFn: fetchAdminInventoryHealth,
    enabled: Boolean(isAdmin),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to retrieve customer insights, repeat purchase ratios, and top spenders
 */
export function useAdminCustomerInsightsQuery() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  return useQuery({
    queryKey: DASHBOARD_KEYS.insights(),
    queryFn: fetchAdminCustomerInsights,
    enabled: Boolean(isAdmin),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

/**
 * Helper hook to trigger an on-demand cache invalidation and refresh
 */
export function useRefreshAdminDashboard() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
  };
}
