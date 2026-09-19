import { Router } from "express";
import {
  getAllBrands,
  getFeaturedBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand
} from "../controllers/brand.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadFields } from "../middlewares/upload.middleware.js";

const brandRouter = Router();

const brandUpload = uploadFields([
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 }
]);

// ==========================================
// Public Brand Routes
// ==========================================

/**
 * @route   GET /api/v1/brands
 * @desc    Get all active brands with product counts
 * @access  Public
 */
brandRouter.get("/", getAllBrands);

/**
 * @route   GET /api/v1/brands/featured
 * @desc    Get featured brands with logos for homepage carousel
 * @access  Public
 */
brandRouter.get("/featured", getFeaturedBrands);

/**
 * @route   GET /api/v1/brands/:slug
 * @desc    Get single brand by slug with product count
 * @access  Public
 */
brandRouter.get("/:slug", getBrandBySlug);

// ==========================================
// Admin Brand Management Routes
// ==========================================

/**
 * @route   POST /api/v1/brands
 * @desc    Create a new brand with logo and optional banner
 * @access  Private (Admin only)
 */
brandRouter.post(
  "/",
  verifyJWT,
  authorizeRoles("admin"),
  brandUpload,
  createBrand
);

/**
 * @route   PUT /api/v1/brands/:id
 * @desc    Update an existing brand
 * @access  Private (Admin only)
 */
brandRouter.put(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  brandUpload,
  updateBrand
);

/**
 * @route   DELETE /api/v1/brands/:id
 * @desc    Delete a brand (with product association safety checks)
 * @access  Private (Admin only)
 */
brandRouter.delete(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  deleteBrand
);

export default brandRouter;
