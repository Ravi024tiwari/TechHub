import { apiClient } from "./client";

/**
 * Customer Address Book API Service:
 * Pure network calls returning promise responses.
 */

// Fetch all saved addresses
export const fetchAddressesApi = async () => {
  const response = await apiClient.get("/addresses");
  return response.data?.data?.addresses || [];
};

// Add a new address
export const addAddressApi = async (addressData) => {
  const response = await apiClient.post("/addresses", addressData);
  return response.data; // { statusCode, data: newAddress, message }
};

// Update an existing address
export const updateAddressApi = async ({ addressId, ...addressData }) => {
  const response = await apiClient.put(`/addresses/${addressId}`, addressData);
  return response.data;
};

// Delete an address
export const deleteAddressApi = async (addressId) => {
  const response = await apiClient.delete(`/addresses/${addressId}`);
  return response.data;
};

// Set an address as default shipping address
export const setDefaultAddressApi = async (addressId) => {
  const response = await apiClient.patch(`/addresses/${addressId}/default`);
  return response.data;
};
