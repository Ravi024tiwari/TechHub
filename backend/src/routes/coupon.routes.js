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
import {
  verifyJWT,
  authorizeRoles,
  optionalAuth
} from "../middlewares/auth.middleware.js";

const couponRouter = Router();

// Customer endpoints (Optional authentication: shows active coupons to guests, checks per-user limit if logged in)
couponRouter.get("/active", optionalAuth, getActiveCouponsForCustomer);

// Admin-only management endpoints (Strictly protected with JWT and Admin role)
couponRouter.use("/admin", verifyJWT, authorizeRoles("admin"));

couponRouter.post("/admin", createCoupon);
couponRouter.get("/admin/all", getAllCouponsAdmin);
couponRouter.get("/admin/:couponId", getCouponByIdAdmin);
couponRouter.put("/admin/:couponId", updateCoupon);
couponRouter.patch("/admin/:couponId/toggle", toggleCouponStatus);
couponRouter.delete("/admin/:couponId", deleteCoupon);

export default couponRouter;
