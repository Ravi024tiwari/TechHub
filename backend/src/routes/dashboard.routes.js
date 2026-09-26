import { Router } from "express";
import {
  getCustomerDashboardSummary,
  getAdminDashboardOverview,
  getAdminSalesAnalytics,
  getAdminInventoryHealth,
  getAdminCustomerInsights
} from "../controllers/dashboard.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const dashboardRouter = Router();

// Protect all dashboard endpoints with JWT authentication
dashboardRouter.use(verifyJWT);

// ==========================================
// Customer Dashboard Routes
// ==========================================

/**
 * @route   GET /api/v1/dashboard/customer/summary
 * @desc    Get 360-degree customer dashboard overview (orders, spent, cart, wishlist, reviews)
 * @access  Private (Customer & Admin)
 */
dashboardRouter.get("/customer/summary", getCustomerDashboardSummary);
dashboardRouter.get("/customer", getCustomerDashboardSummary);

// ==========================================
// Admin Operations & Analytics Routes
// ==========================================

/**
 * @route   GET /api/v1/dashboard/admin/overview
 * @desc    Headline revenue, orders, catalog counts, and recent store activity
 * @access  Private (Admin only)
 */
dashboardRouter.get(
  "/admin/overview",
  authorizeRoles("admin"),
  getAdminDashboardOverview
);

/**
 * @route   GET /api/v1/dashboard/admin/sales-analytics
 * @desc    Time-series sales trends, category distribution, and payment breakdowns
 * @access  Private (Admin only)
 */
dashboardRouter.get(
  "/admin/sales-analytics",
  authorizeRoles("admin"),
  getAdminSalesAnalytics
);

/**
 * @route   GET /api/v1/dashboard/admin/inventory-health
 * @desc    Stock status, low-stock warnings, and top-selling electronics
 * @access  Private (Admin only)
 */
dashboardRouter.get(
  "/admin/inventory-health",
  authorizeRoles("admin"),
  getAdminInventoryHealth
);

/**
 * @route   GET /api/v1/dashboard/admin/customer-insights
 * @desc    Customer lifetime value (LTV) rankings and retention ratios
 * @access  Private (Admin only)
 */
dashboardRouter.get(
  "/admin/customer-insights",
  authorizeRoles("admin"),
  getAdminCustomerInsights
);

export default dashboardRouter;
