import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const MAX_ADDRESSES_PER_USER = 10;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Validation helper for address payloads
 */
const validateAddressPayload = (payload, isPartial = false) => {
  const { fullName, phone, street, city, state, pincode, addressType } = payload;
  const errors = [];

  if (!isPartial || fullName !== undefined) {
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      errors.push("Full name is required and must be at least 2 characters");
    }
  }

  if (!isPartial || phone !== undefined) {
    if (!phone || !PHONE_REGEX.test(phone.trim())) {
      errors.push("Valid 10-digit mobile number starting with 6-9 is required");
    }
  }

  if (!isPartial || street !== undefined) {
    if (!street || typeof street !== "string" || street.trim().length < 5) {
      errors.push("Street address / house number is required (min 5 characters)");
    }
  }

  if (!isPartial || city !== undefined) {
    if (!city || typeof city !== "string" || city.trim().length < 2) {
      errors.push("City name is required");
    }
  }

  if (!isPartial || state !== undefined) {
    if (!state || typeof state !== "string" || state.trim().length < 2) {
      errors.push("State name is required");
    }
  }

  if (!isPartial || pincode !== undefined) {
    if (!pincode || !PINCODE_REGEX.test(pincode.toString().trim())) {
      errors.push("Valid 6-digit postal PIN code is required");
    }
  }

  if (addressType !== undefined) {
    const validTypes = ["home", "work", "other"];
    if (!validTypes.includes(addressType.toLowerCase())) {
      errors.push("Address type must be one of: home, work, other");
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors.join("; "));
  }
};

/**
 * @desc    Get all saved addresses for the authenticated user
 * @route   GET /api/v1/addresses
 * @access  Private
 */
export const getUserAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("addresses");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Sort addresses so the default address appears first
  const sortedAddresses = [...(user.addresses || [])].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: sortedAddresses.length,
        addresses: sortedAddresses
      },
      "Addresses retrieved successfully"
    )
  );
});

/**
 * @desc    Get a single address by its ID
 * @route   GET /api/v1/addresses/:addressId
 * @access  Private
 */
export const getAddressById = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "Invalid address ID format");
  }

  const user = await User.findById(req.user._id).select("addresses");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found in your saved address book");
  }

  return res.status(200).json(
    new ApiResponse(200, address, "Address retrieved successfully")
  );
});

/**
 * @desc    Add a new address to the user's address book
 * @route   POST /api/v1/addresses
 * @access  Private
 */
export const addNewAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    street,
    landmark = "",
    city,
    state,
    pincode,
    addressType = "home",
    isDefault = false
  } = req.body;

  validateAddressPayload(req.body, false);

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.addresses.length >= MAX_ADDRESSES_PER_USER) {
    throw new ApiError(
      400,
      `Maximum address limit reached (${MAX_ADDRESSES_PER_USER}). Please delete an unused address before adding a new one.`
    );
  }

  // If this is the user's first address, it MUST be default
  const isFirstAddress = user.addresses.length === 0;
  const shouldBeDefault = isFirstAddress ? true : Boolean(isDefault);

  // If new address is marked as default, unset default on all existing addresses
  if (shouldBeDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  const newAddressData = {
    fullName: fullName.trim(),
    phone: phone.trim(),
    street: street.trim(),
    landmark: landmark.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: pincode.toString().trim(),
    addressType: addressType.toLowerCase(),
    isDefault: shouldBeDefault
  };

  user.addresses.push(newAddressData);
  await user.save();

  // Retrieve newly created subdocument (the last item in the array)
  const createdAddress = user.addresses[user.addresses.length - 1];

  return res.status(201).json(
    new ApiResponse(201, createdAddress, "New address added successfully")
  );
});

/**
 * @desc    Update an existing address
 * @route   PUT /api/v1/addresses/:addressId
 * @access  Private
 */
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const {
    fullName,
    phone,
    street,
    landmark,
    city,
    state,
    pincode,
    addressType,
    isDefault
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "Invalid address ID format");
  }

  validateAddressPayload(req.body, true);

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const targetAddress = user.addresses.id(addressId);
  if (!targetAddress) {
    throw new ApiError(404, "Address not found in your saved address book");
  }

  // Handle default toggle logic
  if (isDefault === true && !targetAddress.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    targetAddress.isDefault = true;
  } else if (isDefault === false && targetAddress.isDefault) {
    // If unsetting default and there are other addresses, promote another address to default
    if (user.addresses.length > 1) {
      targetAddress.isDefault = false;
      const alternative = user.addresses.find(
        (a) => a._id.toString() !== addressId.toString()
      );
      if (alternative) alternative.isDefault = true;
    }
  }

  // Apply updates
  if (fullName !== undefined) targetAddress.fullName = fullName.trim();
  if (phone !== undefined) targetAddress.phone = phone.trim();
  if (street !== undefined) targetAddress.street = street.trim();
  if (landmark !== undefined) targetAddress.landmark = landmark.trim();
  if (city !== undefined) targetAddress.city = city.trim();
  if (state !== undefined) targetAddress.state = state.trim();
  if (pincode !== undefined) targetAddress.pincode = pincode.toString().trim();
  if (addressType !== undefined) targetAddress.addressType = addressType.toLowerCase();

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, targetAddress, "Address updated successfully")
  );
});

/**
 * @desc    Delete an address from the user's address book
 * @route   DELETE /api/v1/addresses/:addressId
 * @access  Private
 */
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "Invalid address ID format");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const targetAddress = user.addresses.id(addressId);
  if (!targetAddress) {
    throw new ApiError(404, "Address not found in your saved address book");
  }

  const wasDefault = targetAddress.isDefault;

  // Remove the subdocument
  user.addresses.pull({ _id: addressId });

  // If deleted address was default and user still has addresses, promote the first remaining one to default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deletedAddressId: addressId,
        remainingAddressesCount: user.addresses.length,
        newDefaultAddressId: user.addresses.find((a) => a.isDefault)?._id || null
      },
      "Address deleted successfully"
    )
  );
});

/**
 * @desc    Set a specific address as the default shipping address
 * @route   PATCH /api/v1/addresses/:addressId/default
 * @access  Private
 */
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "Invalid address ID format");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const targetAddress = user.addresses.id(addressId);
  if (!targetAddress) {
    throw new ApiError(404, "Address not found in your saved address book");
  }

  // Set all to false, then target to true
  user.addresses.forEach((addr) => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      targetAddress,
      "Address set as default shipping address successfully"
    )
  );
});
