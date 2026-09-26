import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyOrdersApi,
  fetchOrderByIdApi,
  placeCodOrderApi,
  cancelOrderApi,
} from "../api/orderApi";
import { useAuthStore } from "../store/useAuthStore";

export const ORDER_KEYS = {
  all: ["orders"],
  myOrders: ["myOrders"],
  detail: (id) => ["orders", id],
};

/**
 * Hook to retrieve all orders placed by the current customer.
 */
export function useMyOrdersQuery(params = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: [...ORDER_KEYS.myOrders, params],
    queryFn: () => fetchMyOrdersApi(params),
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 60 * 3, // 3 minutes fresh
  });
}

/**
 * Hook to retrieve a single order by its ID.
 */
export function useOrderDetailQuery(orderId) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ORDER_KEYS.detail(orderId),
    queryFn: () => fetchOrderByIdApi(orderId),
    enabled: Boolean(isAuthenticated && orderId),
  });
}

/**
 * Hook to place a Cash on Delivery (COD) order.
 */
export function usePlaceCodOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: placeCodOrderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.myOrders });
    },
  });
}

/**
 * Hook to cancel an order.
 */
export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }) => cancelOrderApi(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.myOrders });
    },
  });
}
