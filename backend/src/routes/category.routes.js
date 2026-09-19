import { Router } from "express";
import {
  getCategoryTree,
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadFields } from "../middlewares/upload.middleware.js";

const categoryRouter = Router();

const categoryUpload = uploadFields([
  { name: "icon", maxCount: 1 },
  { name: "banner", maxCount: 1 }
]);

// ==========================================
// Public Category Routes
// ==========================================

/**
 * @route   GET /api/v1/categories/tree
 * @desc    Get nested category tree (Root + Children) for Mega Menu
 * @access  Public
 */
categoryRouter.get("/tree", getCategoryTree);

/**
 * @route   GET /api/v1/categories
 * @desc    Get flat categories list with product counts
 * @access  Public
 */
categoryRouter.get("/", getAllCategories);

/**
 * @route   GET /api/v1/categories/:slug
 * @desc    Get category details by slug with subcategories and specs template
 * @access  Public
 */
categoryRouter.get("/:slug", getCategoryBySlug);

// ==========================================
// Admin Category Management Routes
// ==========================================

/**
 * @route   POST /api/v1/categories
 * @desc    Create category or subcategory with icon and banner
 * @access  Private (Admin only)
 */
categoryRouter.post(
  "/",
  verifyJWT,
  authorizeRoles("admin"),
  categoryUpload,
  createCategory
);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update category info, icon, or banner
 * @access  Private (Admin only)
 */
categoryRouter.put(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  categoryUpload,
  updateCategory
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category (with safety checks against child categories & products)
 * @access  Private (Admin only)
 */
categoryRouter.delete(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  deleteCategory
);

export default categoryRouter;
