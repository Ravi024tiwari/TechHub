import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProductReviewsApi,
  checkCanUserReviewApi,
  createReviewApi,
  updateReviewApi,
  deleteReviewApi,
  toggleHelpfulVoteApi,
} from "../api/reviewApi";
import { useAuthStore } from "../store/useAuthStore";

export const REVIEW_KEYS = {
  all: ["reviews"],
  productReviews: (productId, filters) => ["reviews", "product", productId, filters],
  eligibility: (productId) => ["reviews", "eligibility", productId],
};

/**
 * Production-grade infinite query for product reviews with cursor-based pagination
 */
export function useInfiniteProductReviewsQuery({
  productId,
  sortBy = "newest",
  ratingFilter = null,
  limit = 6,
}) {
  const filters = { sortBy, ratingFilter: ratingFilter || undefined, limit };

  return useInfiniteQuery({
    queryKey: REVIEW_KEYS.productReviews(productId, filters),
    queryFn: async ({ pageParam = undefined }) => {
      return await fetchProductReviewsApi({
        productId,
        limit,
        cursor: pageParam || undefined,
        sortBy,
        ratingFilter: ratingFilter || undefined,
      });
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.hasMore) return undefined;
      return lastPage.nextCursor || undefined;
    },
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 2, // 2 minutes fresh
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

/**
 * Check if the current user is eligible to write a review for this product
 * (Must be authenticated and have an order with DELIVERED status containing this product)
 */
export function useReviewEligibilityQuery(productId) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: REVIEW_KEYS.eligibility(productId),
    queryFn: () => checkCanUserReviewApi(productId),
    enabled: Boolean(isAuthenticated && productId),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Create a new verified purchase customer review
 */
export function useCreateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, reviewData }) => createReviewApi(productId, reviewData),
    onSuccess: (_data, variables) => {
      // Invalidate review queries for this product
      queryClient.invalidateQueries({
        queryKey: ["reviews", "product", variables.productId],
      });
      // Invalidate eligibility
      queryClient.invalidateQueries({
        queryKey: REVIEW_KEYS.eligibility(variables.productId),
      });
      // Invalidate product details so average rating and review counts update immediately
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      // Invalidate orders queries so delivered item review status updates immediately
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

/**
 * Update an existing customer review
 */
export function useUpdateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, reviewData }) => updateReviewApi(reviewId, reviewData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      if (variables?.productId) {
        queryClient.invalidateQueries({
          queryKey: ["product", variables.productId],
        });
      }
    },
  });
}

/**
 * Delete a review (owner or admin)
 */
export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId }) => deleteReviewApi(reviewId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      if (variables?.productId) {
        queryClient.invalidateQueries({
          queryKey: ["product", variables.productId],
        });
      }
    },
  });
}

/**
 * Upvote or remove helpful vote on a review
 */
export function useToggleHelpfulVoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId }) => toggleHelpfulVoteApi(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
