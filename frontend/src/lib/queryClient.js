import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

/**
 * Production TanStack Query Client Configuration:
 * - staleTime: 5 mins (prevent eager re-fetching on navigation)
 * - gcTime: 24 hrs (maintain offline/stale cache in memory)
 * - refetchOnMount: false (instant UI paint using existing cache)
 * - refetchOnWindowFocus: true (silent background revalidation when returning to app)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: true,
      refetchOnMount: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * LocalStorage Synchronous Persister:
 * Automatically writes query cache to localStorage and hydrates on reload.
 */
export const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "shop_query_cache",
  throttleTime: 1000, // Debounce storage writes to avoid UI thread lag
});
