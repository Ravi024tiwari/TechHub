import { apiClient } from "./client";

/**
 * Product & Category API Service:
 * Pure network calls returning promise responses.
 */

// Fetch paginated products with optional filters
export const fetchProducts = async (params = {}) => {
  const response = await apiClient.get("/products", { params });
  return response.data?.data || { products: [], pagination: {} };
};

// Fetch single product by MongoDB ID or SEO slug
export const fetchProductByIdOrSlug = async (idOrSlug) => {
  const response = await apiClient.get(`/products/${idOrSlug}`);
  return response.data?.data || null;
};

// Fetch flat categories list
export const fetchCategories = async () => {
  const response = await apiClient.get("/categories");
  return response.data?.data || [];
};

// Fetch fast search suggestions
export const fetchSearchSuggestions = async (query) => {
  if (!query || query.trim().length < 1) return [];
  const response = await apiClient.get("/products/search/suggestions", {
    params: { q: query.trim() },
  });
  return response.data?.data || [];
};

// Fetch all active brand partners
export const fetchBrands = async () => {
  const response = await apiClient.get("/brands");
  return response.data?.data || [];
};
