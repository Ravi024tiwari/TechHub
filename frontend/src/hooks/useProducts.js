import { useQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProductByIdOrSlug,
  fetchCategories,
  fetchSearchSuggestions,
  fetchBrands,
} from "../api/productApi";

export const PRODUCT_KEYS = {
  all: ["products"],
  list: (params) => [...PRODUCT_KEYS.all, "list", params],
  detail: (idOrSlug) => [...PRODUCT_KEYS.all, "detail", idOrSlug],
  categories: ["categories"],
  brands: ["brands"],
  search: (query) => ["search_suggestions", query],
};

/**
 * Hook to fetch paginated products with automatic caching & placeholder data
 */
export function useProductsQuery(params = {}) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => fetchProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to fetch single product details
 */
export function useProductDetailsQuery(idOrSlug) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(idOrSlug),
    queryFn: () => fetchProductByIdOrSlug(idOrSlug),
    enabled: Boolean(idOrSlug),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch store categories
 */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: PRODUCT_KEYS.categories,
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook for live search suggestions
 */
export function useSearchSuggestionsQuery(query) {
  return useQuery({
    queryKey: PRODUCT_KEYS.search(query),
    queryFn: () => fetchSearchSuggestions(query),
    enabled: Boolean(query && query.trim().length >= 1),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to fetch official OEM brand partners
 */
export function useBrandsQuery() {
  return useQuery({
    queryKey: PRODUCT_KEYS.brands,
    queryFn: fetchBrands,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
