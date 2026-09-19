import { Router } from "express";
import {
  getActiveFlashDeal,
  getUpcomingFlashDeals,
  getFlashDealById,
  getAllFlashDealsAdmin,
  createFlashDeal,
  updateFlashDeal,
  deleteFlashDeal,
  toggleFlashDealStatus
} from "../controllers/flashDeal.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";

const router = Router();

// Public Storefront Endpoints
router.get("/active", getActiveFlashDeal);
router.get("/upcoming", getUpcomingFlashDeals);
router.get("/:id", getFlashDealById);

// Protected Admin Endpoints
router.use(verifyJWT, authorizeRoles("admin"));

router.get("/admin/all", getAllFlashDealsAdmin);
router.post("/", uploadSingle("bannerImage"), createFlashDeal);
router.put("/:id", uploadSingle("bannerImage"), updateFlashDeal);
router.delete("/:id", deleteFlashDeal);
router.patch("/:id/status", toggleFlashDealStatus);

export default router;
