import { Router } from "express";
import {
  getActiveBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners
} from "../controllers/banner.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadFields } from "../middlewares/upload.middleware.js";

const router = Router();

const bannerUpload = uploadFields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 }
]);

// Public route for storefront banners
router.get("/", getActiveBanners);

// Protected Admin Routes
router.use(verifyJWT, authorizeRoles("admin"));

router.get("/admin", getAllBannersAdmin);
router.post("/", bannerUpload, createBanner);
router.put("/:id", bannerUpload, updateBanner);
router.delete("/:id", deleteBanner);
router.patch("/reorder", reorderBanners);

export default router;
