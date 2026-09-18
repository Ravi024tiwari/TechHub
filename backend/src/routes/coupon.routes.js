import { Router } from "express";
import {
  createCoupon,
  getAllCouponsAdmin,
  getCouponByIdAdmin,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  getActiveCouponsForCustomer
} from "../controllers/coupon.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const couponRouter = Router();

// Secure all coupon endpoints with JWT
couponRouter.use(verifyJWT);

// Customer endpoints
couponRouter.get("/active", getActiveCouponsForCustomer);

// Admin-only management endpoints
couponRouter.post("/admin", authorizeRoles("admin"), createCoupon);
couponRouter.get("/admin/all", authorizeRoles("admin"), getAllCouponsAdmin);
couponRouter.get("/admin/:couponId", authorizeRoles("admin"), getCouponByIdAdmin);
couponRouter.put("/admin/:couponId", authorizeRoles("admin"), updateCoupon);
couponRouter.patch("/admin/:couponId/toggle", authorizeRoles("admin"), toggleCouponStatus);
couponRouter.delete("/admin/:couponId", authorizeRoles("admin"), deleteCoupon);

export default couponRouter;
