import { Router } from "express";
import {
  getOrderInvoiceData,
  downloadOrderInvoicePDF
} from "../controllers/invoice.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const invoiceRouter = Router();

// All invoice endpoints require authentication (Customer or Admin)
invoiceRouter.use(verifyJWT);

/**
 * @route   GET /api/v1/invoices/:orderId
 * @desc    Get structured JSON tax invoice metadata for web views
 * @access  Private (Customer & Admin)
 */
invoiceRouter.get("/:orderId", getOrderInvoiceData);

/**
 * @route   GET /api/v1/invoices/:orderId/download
 * @desc    Download printable tax invoice as streaming PDF
 * @access  Private (Customer & Admin)
 */
invoiceRouter.get("/:orderId/download", downloadOrderInvoicePDF);

export default invoiceRouter;
