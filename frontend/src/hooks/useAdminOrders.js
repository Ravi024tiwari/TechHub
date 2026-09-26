import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchAdminOrders,
  updateOrderStatus,
  updateOrderTracking,
  cancelAdminOrder,
} from "../api/adminApi";
import { fetchOrderByIdApi } from "../api/orderApi";
import { useAuthStore } from "../store/useAuthStore";

/**
 * Enterprise Production Order Caching System:
 * - 2-minute staleTime so repeated visits & tab switches serve instantly from cache with 0ms network latency.
 * - 5-minute gcTime preserves pages in RAM.
 * - Infinite scroll pagination with pageParam resolution.
 * - Centralized Query Invalidation on status mutations.
 */
export const CACHE_STALE_TIME = 1000 * 60 * 2; // 2 Minutes
export const CACHE_GC_TIME = 1000 * 60 * 5; // 5 Minutes

export const ADMIN_ORDER_KEYS = {
  all: ["admin", "orders"],
  lists: () => [...ADMIN_ORDER_KEYS.all, "list"],
  list: (filters) => [...ADMIN_ORDER_KEYS.lists(), filters],
};

/**
 * Infinite Scroll Order Query Hook with 2-Minute Memory Cache
 */
export function useAdminOrdersInfiniteQuery({
  status = "",
  search = "",
  limit = 10,
} = {}) {
  const user = useAuthStore((state) => state.user);// get that user from the  zustand

  const isAdmin = user?.role === "admin";

  const filters = {
    status: status || undefined,
    search: search?.trim() || undefined,
  };

  return useInfiniteQuery({
    queryKey: ADMIN_ORDER_KEYS.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await fetchAdminOrders({
        page: pageParam,
        limit,
        status: status || undefined,
        search: search?.trim() || undefined,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: Boolean(isAdmin),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

/**
 * Status Lifecycle Mutation Hook
 */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status, notes = "" }) =>
      updateOrderStatus(orderId, status, notes),
    onSuccess: () => {
      // Invalidate all admin order lists so UI reflects updated status
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDER_KEYS.all });
    },
  });
}

/**
 * Courier Tracking Mutation Hook
 */
export function useUpdateOrderTrackingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, trackingData }) =>
      updateOrderTracking(orderId, trackingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDER_KEYS.all });
    },
  });
}

/**
 * Order Cancellation Mutation Hook (with Auto-Restock)
 */
export function useCancelAdminOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }) => cancelAdminOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDER_KEYS.all });
    },
  });
}

/**
 * On-demand manual cache refresh helper
 */
export function useRefreshAdminOrders() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: ADMIN_ORDER_KEYS.all });
  };
}

/**
 * Single Order Detail Query Hook with 2-Minute Memory Cache
 */
export function useAdminOrderDetailQuery(orderId) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  return useQuery({
    queryKey: ["admin", "orders", "detail", orderId],
    queryFn: async () => {
      const res = await fetchOrderByIdApi(orderId);
      return res;
    },
    enabled: Boolean(isAdmin && orderId),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

