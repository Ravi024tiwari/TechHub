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
  getFilterMetadata
} from "../controllers/product.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadMultiple } from "../middlewares/upload.middleware.js";

const productRouter = Router();

productRouter.get("/", getAllProducts);

// Fast search suggestions (optimized for debounced live search bar)
productRouter.get("/search/suggestions", getSearchSuggestions);

// Dynamic categories & brands filter counts for sidebar
productRouter.get("/filters/meta", getFilterMetadata);

// ==========================================
// 🛡️ Admin Inventory Alerts
// (Must precede /:idOrSlug route parameter)
// ==========================================
productRouter.get("/admin/low-stock", verifyJWT, authorizeRoles("admin"), getLowStockAlerts);

productRouter.get("/:idOrSlug", getProductByIdOrSlug);

productRouter.post("/",verifyJWT,authorizeRoles("admin"),uploadMultiple("images", 6),createProduct );

productRouter.patch("/:id",verifyJWT,authorizeRoles("admin"),uploadMultiple("images", 6),updateProduct );

productRouter.patch("/:id/stock",verifyJWT,authorizeRoles("admin"),updateProductStock );

productRouter.delete("/:id",verifyJWT,authorizeRoles("admin"),deleteProduct );

export default productRouter;
