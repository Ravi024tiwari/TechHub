import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submitReturnRequestApi,
  fetchMyReturnsApi,
  fetchReturnDetailsApi,
  cancelReturnRequestApi,
  fetchAllReturnsAdminApi,
  reviewReturnStatusAdminApi,
  processReturnRefundAdminApi,
  dispatchReplacementAdminApi,
} from "../api/returnApi";
import { ORDER_KEYS } from "./useOrders";
import { useAuthStore } from "../store/useAuthStore";

export const RETURN_KEYS = {
  all: ["returns"],
  myReturns: ["myReturns"],
  detail: (id) => ["returns", id],
  adminList: (params) => ["adminReturns", params],
};

/**
 * Hook to retrieve current customer's return requests
 */
export function useMyReturnsQuery(params = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: [...RETURN_KEYS.myReturns, params],
    queryFn: () => fetchMyReturnsApi(params),
    enabled: Boolean(isAuthenticated),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to retrieve detailed view of a return request
 */
export function useReturnDetailsQuery(returnId) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: RETURN_KEYS.detail(returnId),
    queryFn: () => fetchReturnDetailsApi(returnId),
    enabled: Boolean(isAuthenticated && returnId),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

/**
 * Hook for customer to submit return or replacement request
 */
export function useSubmitReturnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => submitReturnRequestApi(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RETURN_KEYS.myReturns });
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.myOrders });
    },
  });
}

/**
 * Hook for customer to cancel a pending return request
 */
export function useCancelReturnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (returnId) => cancelReturnRequestApi(returnId),
    onSuccess: (_data, returnId) => {
      queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RETURN_KEYS.myReturns });
      if (returnId) {
        queryClient.invalidateQueries({ queryKey: RETURN_KEYS.detail(returnId) });
      }
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.myOrders });
    },
  });
}

/**
 * Admin Hook: Fetch all return requests with filters and pagination
 */
export function useAdminReturnsQuery(params = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  return useQuery({
    queryKey: RETURN_KEYS.adminList(params),
    queryFn: () => fetchAllReturnsAdminApi(params),
    enabled: Boolean(isAuthenticated && isAdmin),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

/**
 * Admin Hook: Update Return status (Approve, Reject, Item Received, etc.)
 */
export function useReviewReturnStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, payload }) => reviewReturnStatusAdminApi(returnId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminReturns"] });
      queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      if (variables?.returnId) {
        queryClient.invalidateQueries({ queryKey: RETURN_KEYS.detail(variables.returnId) });
      }
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
    },
  });
}

/**
 * Admin Hook: Process programmatic Razorpay / COD refund
 */
export function useProcessRefundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, payload }) => processReturnRefundAdminApi(returnId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminReturns"] });
      queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      if (variables?.returnId) {
        queryClient.invalidateQueries({ queryKey: RETURN_KEYS.detail(variables.returnId) });
      }
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
  });
}

/**
 * Admin Hook: Dispatch replacement unit to customer
 */
export function useDispatchReplacementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, payload }) => dispatchReplacementAdminApi(returnId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminReturns"] });
      queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      if (variables?.returnId) {
        queryClient.invalidateQueries({ queryKey: RETURN_KEYS.detail(variables.returnId) });
      }
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
  });
}
