import { Router } from "express";
import {
  getUserAddresses,
  getAddressById,
  addNewAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from "../controllers/address.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const addressRouter = Router();

// Protect all address routes with JWT authentication
addressRouter.use(verifyJWT);

// ==========================================
// User Address Book Routes
// ==========================================

/**
 * @route   GET /api/v1/addresses
 * @desc    Get all saved addresses for current user
 * @access  Private
 */
addressRouter.get("/", getUserAddresses);

/**
 * @route   POST /api/v1/addresses
 * @desc    Add a new address to address book
 * @access  Private
 */
addressRouter.post("/", addNewAddress);

/**
 * @route   GET /api/v1/addresses/:addressId
 * @desc    Get a specific address by ID
 * @access  Private
 */
addressRouter.get("/:addressId", getAddressById);

/**
 * @route   PUT /api/v1/addresses/:addressId
 * @desc    Update an existing address
 * @access  Private
 */
addressRouter.put("/:addressId", updateAddress);

/**
 * @route   DELETE /api/v1/addresses/:addressId
 * @desc    Delete an address from address book
 * @access  Private
 */
addressRouter.delete("/:addressId", deleteAddress);

/**
 * @route   PATCH /api/v1/addresses/:addressId/default
 * @desc    Set an address as the default shipping address
 * @access  Private
 */
addressRouter.patch("/:addressId/default", setDefaultAddress);

export default addressRouter;
