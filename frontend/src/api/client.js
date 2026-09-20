import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

/**
 * Centralized Production Axios Client:
 * - Configured with API base URL and credentials for HTTP-only cookies.
 * - Request Interceptor: Injects Bearer token from Zustand store.
 * - Response Interceptor: Formats API errors cleanly and handles unauthorized 401 flows.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Access Token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages & handle session expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Standardize error message extraction from backend ApiResponse/ApiError
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected network error occurred.";

    // If 401 Unauthorized occurs on protected routes (not on initial login/register)
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // In production, token refresh or clean logout is triggered
      useAuthStore.getState().logout();
    }

    // Attach human-readable message to error object for consumption in components
    error.userMessage = message;
    return Promise.reject(error);
  }
);
