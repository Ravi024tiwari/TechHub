import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchAdminCustomers,
  fetchAdminCustomerDetails,
  toggleBlockCustomer,
} from "../api/adminApi";
import { useAuthStore } from "../store/useAuthStore";

/**
 * Enterprise Production Customer Caching System:
 * - 2-minute staleTime so repeated visits & tab switches serve instantly with 0ms network latency.
 * - 5-minute gcTime preserves pages in RAM for seamless back-navigation.
 * - Infinite scroll pagination with pageParam resolution and prefetching.
 * - Optimistic account status mutation with centralized Query Invalidation.
 */
export const CACHE_STALE_TIME = 1000 * 60 * 2; // 2 Minutes
export const CACHE_GC_TIME = 1000 * 60 * 5; // 5 Minutes

export const ADMIN_CUSTOMER_KEYS = {
  all: ["admin", "customers"],
  lists: () => [...ADMIN_CUSTOMER_KEYS.all, "list"],
  list: (filters) => [...ADMIN_CUSTOMER_KEYS.lists(), filters],
  details: () => [...ADMIN_CUSTOMER_KEYS.all, "detail"],
  detail: (id) => [...ADMIN_CUSTOMER_KEYS.details(), id],
};

/**
 * Infinite Scroll Customer Query Hook with 2-Minute Memory Cache
 */
export function useAdminCustomersInfiniteQuery({
  status = "",
  search = "",
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const filters = {
    status: status || undefined,
    search: search?.trim() || undefined,
    sortBy,
    sortOrder,
  };

  return useInfiniteQuery({
    queryKey: ADMIN_CUSTOMER_KEYS.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await fetchAdminCustomers({
        page: pageParam,
        limit,
        status: status || undefined,
        search: search?.trim() || undefined,
        sortBy,
        sortOrder,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { hasNextPage, currentPage } = lastPage?.pagination || {};
      return hasNextPage ? currentPage + 1 : undefined;
    },
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnWindowFocus: false,
    enabled: Boolean(isAdmin),
  });
}

/**
 * Single Customer Detailed 360-degree Dossier Query Hook
 */
export function useAdminCustomerDetailQuery(userId) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  return useQuery({
    queryKey: ADMIN_CUSTOMER_KEYS.detail(userId),
    queryFn: async () => {
      return await fetchAdminCustomerDetails(userId);
    },
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    enabled: Boolean(isAdmin && userId),
    refetchOnWindowFocus: false,
  });
}

/**
 * Toggle Block/Unblock Customer Mutation with Instant Optimistic Cache Updates
 */
export function useToggleBlockCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isBlocked, reason = "" }) => {
      return await toggleBlockCustomer(userId, { isBlocked, reason });
    },
    onMutate: async ({ userId, isBlocked }) => {
      // Cancel active queries
      await queryClient.cancelQueries({ queryKey: ADMIN_CUSTOMER_KEYS.all });

      // Snapshot previous state
      const previousLists = queryClient.getQueriesData({
        queryKey: ADMIN_CUSTOMER_KEYS.lists(),
      });

      // Optimistically update lists in cache
      queryClient.setQueriesData(
        { queryKey: ADMIN_CUSTOMER_KEYS.lists() },
        (oldData) => {
          if (!oldData?.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              customers: page.customers.map((cust) =>
                cust._id === userId
                  ? {
                      ...cust,
                      isBlocked:
                        typeof isBlocked === "boolean"
                          ? isBlocked
                          : !cust.isBlocked,
                    }
                  : cust
              ),
            })),
          };
        }
      );

      return { previousLists };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (_data, _error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CUSTOMER_KEYS.all });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ADMIN_CUSTOMER_KEYS.detail(userId),
        });
      }
    },
  });
}

/**
 * Manual Cache Invalidation Helper to bypass 2-min cache
 */
export function useInvalidateAdminCustomers() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: ADMIN_CUSTOMER_KEYS.all });
  };
}
