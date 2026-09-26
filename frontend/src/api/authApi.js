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

// Update user profile (Name, Phone, Avatar file)
export const updateProfileApi = async (formDataOrData) => {
  const isFormData = formDataOrData instanceof FormData;
  const response = await apiClient.patch("/auth/profile", formDataOrData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data; // { statusCode, data: updatedUser, message }
};

// Change user password
export const changePasswordApi = async (passwordData) => {
  const response = await apiClient.patch("/auth/change-password", passwordData);
  return response.data;
};
