import { Router } from "express";
import {
  getAllCustomersAdmin,
  getCustomerDetailsAdmin,
  toggleBlockCustomerAdmin
} from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Protect all user management routes with JWT and Admin Authorization
userRouter.use(verifyJWT, authorizeRoles("admin"));

// ==========================================
// Admin Customer Management Routes
// ==========================================

/**
 * @route   GET /api/v1/users/admin/customers
 * @desc    Get paginated customer list with instant search and status filtering
 * @access  Private (Admin only)
 */
userRouter.get("/admin/customers", getAllCustomersAdmin);

/**
 * @route   GET /api/v1/users/admin/customers/:userId
 * @desc    Get complete 360-degree customer details (profile, addresses, order metrics, recent orders)
 * @access  Private (Admin only)
 */
userRouter.get("/admin/customers/:userId", getCustomerDetailsAdmin);

/**
 * @route   PATCH /api/v1/users/admin/customers/:userId/block
 * @desc    Block or unblock a customer account
 * @access  Private (Admin only)
 */
userRouter.patch("/admin/customers/:userId/block", toggleBlockCustomerAdmin);

export default userRouter;
