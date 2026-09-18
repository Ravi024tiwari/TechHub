import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPaymentAndPlaceOrder,
  placeCodOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  updateOrderTrackingAdmin,
  cancelOrderAdmin
} from "../controllers/order.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const orderRouter = Router();

// Protect all order routes with JWT
orderRouter.use(verifyJWT);

// ==========================================
// Customer Order & Checkout Routes
// ==========================================
orderRouter.post("/checkout/razorpay", createRazorpayOrder);
orderRouter.post("/checkout/verify-payment", verifyPaymentAndPlaceOrder);
orderRouter.post("/checkout/cod", placeCodOrder);
orderRouter.get("/my-orders", getMyOrders);
orderRouter.get("/:orderId", getOrderById);
orderRouter.post("/:orderId/cancel", cancelOrder);

// ==========================================
// Admin Order & Fulfillment Routes
// ==========================================
orderRouter.get("/admin/all", authorizeRoles("admin"), getAllOrdersAdmin);
orderRouter.patch("/admin/:orderId/status", authorizeRoles("admin"), updateOrderStatusAdmin);
orderRouter.patch("/admin/:orderId/tracking", authorizeRoles("admin"), updateOrderTrackingAdmin);
orderRouter.post("/admin/:orderId/cancel", authorizeRoles("admin"), cancelOrderAdmin);

export default orderRouter;
