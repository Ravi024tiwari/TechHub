import { Router } from "express";
import {
  requestOrderReturn,
  getMyReturnRequests,
  getReturnDetails,
  cancelReturnRequest,
  getAllReturnRequestsAdmin,
  reviewReturnRequestAdmin,
  processReturnRefundAdmin
} from "../controllers/return.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadMultiple } from "../middlewares/upload.middleware.js";

const returnRouter = Router();

// Protect all return endpoints with JWT authentication
returnRouter.use(verifyJWT);

// ==========================================
// Customer Return & Replacement Routes
// ==========================================

/**
 * @route   POST /api/v1/returns
 * @desc    Submit a return or replacement request with defect evidence images
 * @access  Private (Customer)
 */
returnRouter.post("/", uploadMultiple("images", 5), requestOrderReturn);

/**
 * @route   GET /api/v1/returns/my-returns
 * @desc    Get paginated return requests for the current customer
 * @access  Private (Customer)
 */
returnRouter.get("/my-returns", getMyReturnRequests);

/**
 * @route   GET /api/v1/returns/:returnId
 * @desc    Get detailed view of a specific return request
 * @access  Private (Customer & Admin)
 */
returnRouter.get("/:returnId", getReturnDetails);

/**
 * @route   PATCH /api/v1/returns/:returnId/cancel
 * @desc    Cancel a pending return request
 * @access  Private (Customer)
 */
returnRouter.patch("/:returnId/cancel", cancelReturnRequest);

// ==========================================
// Admin Return & Refund Operations Routes
// ==========================================

/**
 * @route   GET /api/v1/returns/admin/all
 * @desc    Get all return requests with filters and search
 * @access  Private (Admin only)
 */
returnRouter.get(
  "/admin/all",
  authorizeRoles("admin"),
  getAllReturnRequestsAdmin
);

/**
 * @route   PATCH /api/v1/returns/admin/:returnId/status
 * @desc    Approve, Reject, or advance Return Request status
 * @access  Private (Admin only)
 */
returnRouter.patch(
  "/admin/:returnId/status",
  authorizeRoles("admin"),
  reviewReturnRequestAdmin
);

/**
 * @route   POST /api/v1/returns/admin/:returnId/refund
 * @desc    Initiate programmatic Razorpay refund and inventory restock
 * @access  Private (Admin only)
 */
returnRouter.post(
  "/admin/:returnId/refund",
  authorizeRoles("admin"),
  processReturnRefundAdmin
);

export default returnRouter;
