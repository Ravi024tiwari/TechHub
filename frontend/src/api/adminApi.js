import { apiClient } from "./client";

/**
 * Admin API Service:
 * Handles executive dashboard analytics, product management, order processing, and user administration.
 */

// Fetch executive overview metrics (KPIs, recent orders, catalog stats)
export const fetchAdminOverview = async () => {
  const response = await apiClient.get("/dashboard/admin/overview");
  return response.data?.data;
};

// Fetch sales & financial analytics with timeframe
export const fetchAdminSalesAnalytics = async (timeframe = "30d") => {
  const response = await apiClient.get("/dashboard/admin/sales-analytics", {
    params: { timeframe },
  });
  return response.data?.data;
};

// Fetch inventory health & stock status
export const fetchAdminInventoryHealth = async () => {
  const response = await apiClient.get("/dashboard/admin/inventory-health");
  return response.data?.data;
};

// Fetch customer insights
export const fetchAdminCustomerInsights = async () => {
  const response = await apiClient.get("/dashboard/admin/customer-insights");
  return response.data?.data;
};

// Fetch low stock alerts
export const fetchLowStockAlerts = async () => {
  const response = await apiClient.get("/products/admin/low-stock");
  return response.data?.data;
};

// Fetch all orders for admin with pagination and status filter
export const fetchAdminOrders = async (params = {}) => {
  const response = await apiClient.get("/orders/admin/all", { params });
  return response.data?.data;
};

// Update order status (PLACED, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
export const updateOrderStatus = async (orderId, status, notes = "") => {
  const response = await apiClient.patch(`/orders/admin/${orderId}/status`, {
    status,
    notes,
  });
  return response.data?.data;
};

// Fetch products with pagination & filters
export const fetchAdminProducts = async (params = {}) => {
  const response = await apiClient.get("/products", {
    params: { all: true, ...params },
  });
  return response.data?.data || { products: [], pagination: {} };
};

// Fetch filter metadata (categories with count, brands with count, price range)
export const fetchFilterMetadata = async () => {
  const response = await apiClient.get("/products/filters");
  return response.data?.data || {};
};

// Update product stock directly
export const updateProductStock = async (id, quantity, mode = "set") => {
  const response = await apiClient.patch(`/products/${id}/stock`, {
    quantity,
    mode,
  });
  return response.data?.data;
};

// Delete a product permanently
export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data?.data;
};

// ==========================================
// 📂 Categories Management APIs
// ==========================================

export const fetchAdminCategories = async (params = {}) => {
  const response = await apiClient.get("/categories", {
    params: { includeInactive: true, ...params },
  });
  return response.data?.data || { categories: [], pagination: {} };
};

export const createAdminCategory = async (formData) => {
  const response = await apiClient.post("/categories", formData);
  return response.data?.data;
};

export const updateAdminCategory = async (id, formData) => {
  const response = await apiClient.put(`/categories/${id}`, formData);
  return response.data?.data;
};

export const deleteAdminCategory = async (id) => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data?.data;
};

// ==========================================
// 🏷️ Brands Management APIs
// ==========================================

export const fetchAdminBrands = async (params = {}) => {
  const response = await apiClient.get("/brands", {
    params: { includeInactive: true, ...params },
  });
  return response.data?.data || { brands: [], pagination: {} };
};

export const createAdminBrand = async (formData) => {
  const response = await apiClient.post("/brands", formData);
  return response.data?.data;
};

export const updateAdminBrand = async (id, formData) => {
  const response = await apiClient.put(`/brands/${id}`, formData);
  return response.data?.data;
};

export const deleteAdminBrand = async (id) => {
  const response = await apiClient.delete(`/brands/${id}`);
  return response.data?.data;
};
