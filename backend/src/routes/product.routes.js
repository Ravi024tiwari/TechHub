import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductByIdOrSlug,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getLowStockAlerts,
  getSearchSuggestions,
  getFilterMetadata,
  addColorVariant,
  updateColorVariant,
  deleteColorVariant
} from "../controllers/product.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadMultiple } from "../middlewares/upload.middleware.js";
import { searchLimiter } from "../middlewares/rateLimiter.middleware.js";

const productRouter = Router();

productRouter.get("/", getAllProducts);

// Fast search suggestions (Protected by Search Rate Limiter for debounced typing)
productRouter.get("/search/suggestions", searchLimiter, getSearchSuggestions);

// Dynamic categories & brands filter counts for sidebar
productRouter.get("/filters", getFilterMetadata);
productRouter.get("/filters/meta", getFilterMetadata);

// ==========================================
// 🛡️ Admin Inventory Alerts
// (Must precede /:idOrSlug route parameter)
// ==========================================
productRouter.get("/admin/low-stock", verifyJWT, authorizeRoles("admin"), getLowStockAlerts);

productRouter.get("/:idOrSlug", getProductByIdOrSlug);

productRouter.post("/", verifyJWT, authorizeRoles("admin"), uploadMultiple("images", 6), createProduct);

productRouter.patch("/:id", verifyJWT, authorizeRoles("admin"), uploadMultiple("images", 6), updateProduct);

productRouter.patch("/:id/stock", verifyJWT, authorizeRoles("admin"), updateProductStock);

productRouter.delete("/:id", verifyJWT, authorizeRoles("admin"), deleteProduct);

// ==========================================
// 🎨 Product Color Variants (Option B)
// ==========================================
productRouter.post("/:id/colors", verifyJWT, authorizeRoles("admin"), uploadMultiple("images", 6), addColorVariant);
productRouter.put("/:id/colors/:colorId", verifyJWT, authorizeRoles("admin"), uploadMultiple("images", 6), updateColorVariant);
productRouter.delete("/:id/colors/:colorId", verifyJWT, authorizeRoles("admin"), deleteColorVariant);

export default productRouter;
