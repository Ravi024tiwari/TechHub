import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAddressesApi,
  addAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
} from "../api/addressApi";
import { useAuthStore } from "../store/useAuthStore";

export const ADDRESS_KEYS = {
  all: ["addresses"],
};

/**
 * Hook to retrieve all saved addresses for current user.
 */
export function useAddressesQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ADDRESS_KEYS.all,
    queryFn: fetchAddressesApi,
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });
}

/**
 * Hook to add a new shipping address.
 */
export function useAddAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAddressApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.all });
    },
  });
}

/**
 * Hook to update an existing address.
 */
export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAddressApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.all });
    },
  });
}

/**
 * Hook to delete an address.
 */
export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddressApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.all });
    },
  });
}

/**
 * Hook to mark an address as the default shipping address.
 */
export function useSetDefaultAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultAddressApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.all });
    },
  });
}
