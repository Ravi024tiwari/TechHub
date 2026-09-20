import { apiClient } from "./client";

/**
 * Authentication API Endpoints:
 * Pure network calls returning promise responses.
 */

// Register new user
export const registerUserApi = async (userData) => {
  const response = await apiClient.post("/auth/register", userData);
  return response.data; // { statusCode, data: { user, accessToken, refreshToken }, message }
};

// Login user
export const loginUserApi = async (credentials) => {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data; // { statusCode, data: { user, accessToken, refreshToken }, message }
};

// Logout user
export const logoutUserApi = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

// Fetch current user profile
export const getCurrentUserApi = async () => {
  const response = await apiClient.get("/auth/me");
  return response.data?.data?.user || response.data?.data;
};
