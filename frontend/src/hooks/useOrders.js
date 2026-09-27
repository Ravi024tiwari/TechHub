import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyOrdersApi,
  fetchOrderByIdApi,
  placeCodOrderApi,
  cancelOrderApi,
  downloadInvoicePdfApi,
  submitReviewApi,
  submitReturnRequestApi,
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
    staleTime: 0, // Always fresh telemetry for review badges and statuses
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to retrieve a single order by its ID or orderNumber.
 */
export function useOrderDetailQuery(orderId) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ORDER_KEYS.detail(orderId),
    queryFn: () => fetchOrderByIdApi(orderId),
    enabled: Boolean(isAuthenticated && orderId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.myOrders });
      if (variables?.orderId) {
        queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(variables.orderId) });
      }
    },
  });
}

/**
 * Hook to download PDF tax invoice.
 */
export function useDownloadInvoiceMutation() {
  return useMutation({
    mutationFn: ({ orderId, orderNumber }) => downloadInvoicePdfApi(orderId, orderNumber),
  });
}

/**
 * Hook to submit product review from delivered order item.
 */
export function useSubmitReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, reviewData }) => submitReviewApi(productId, reviewData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["productReviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.myOrders });
    },
  });
}

/**
 * Hook to submit item return/exchange request.
 */
export function useSubmitReturnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitReturnRequestApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myReturns"] });
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.myOrders });
    },
  });
}

