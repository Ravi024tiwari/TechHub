import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loginUserApi,
  registerUserApi,
  logoutUserApi,
  getCurrentUserApi,
} from "../api/authApi";
import { useAuthStore } from "../store/useAuthStore";

export const AUTH_KEYS = {
  currentUser: ["currentUser"],
};

/**
 * Hook to manage User Login Mutation:
 * - Sends credentials to backend.
 * - On success: synchronizes Zustand store and updates TanStack cache.
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation({
    mutationFn: loginUserApi,
    onSuccess: (response) => {
      const { user, accessToken } = response.data || {};
      if (user && accessToken) {
        setCredentials({ user, accessToken });
        queryClient.setQueryData(AUTH_KEYS.currentUser, user);
      }
    },
  });
}

/**
 * Hook to manage User Registration Mutation:
 * - Sends registration payload to backend.
 * - On success: provisions user, updates Zustand store & TanStack cache.
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation({
    mutationFn: registerUserApi,
    onSuccess: (response) => {
      const { user, accessToken } = response.data || {};
      if (user && accessToken) {
        setCredentials({ user, accessToken });
        queryClient.setQueryData(AUTH_KEYS.currentUser, user);
      }
    },
  });
}

/**
 * Hook to manage User Logout Mutation:
 * - Revokes session on backend.
 * - Clears Zustand state and wipes TanStack Query cache.
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: logoutUserApi,
    onSettled: () => {
      logout();
      queryClient.removeQueries({ queryKey: AUTH_KEYS.currentUser });
      queryClient.clear();
    },
  });
}

/**
 * Hook to fetch and maintain Fresh Current User Profile in background:
 * - Enabled only when user is authenticated.
 * - Syncs updated user profile to Zustand on background revalidation.
 */
export function useCurrentUserQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);

  return useQuery({
    queryKey: AUTH_KEYS.currentUser,
    queryFn: async () => {
      const user = await getCurrentUserApi();
      if (user) {
        updateUser(user);
      }
      return user;
    },
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 60 * 15, // 15 mins fresh
  });
}
