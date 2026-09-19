import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import {
  generateInvoicePDF,
  COMPANY_DETAILS,
  getHsnCode
} from "../utils/invoice.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Helper: Authorize access to order invoice (Customer must own order, or be an admin)
 */
const getAuthorizedOrder = async (orderId, requestingUser) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID format");
  }

  const order = await Order.findById(orderId)
    .populate("user", "name email phone")
    .populate("orderItems.product", "category sku brand");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Authorization check
  const isOwner = order.user._id.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      403,
      "Access forbidden: You do not have permission to access the tax invoice for this order"
    );
  }

  return order;
};

/**
 * @desc    Get structured JSON tax invoice metadata for web-based invoice views
 * @route   GET /api/v1/invoices/:orderId
 * @access  Private (Customer & Admin)
 */
export const getOrderInvoiceData = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await getAuthorizedOrder(orderId, req.user);

  const taxableSubtotal = Math.max(
    0,
    order.pricing.itemsTotal - (order.pricing.discountAmount || 0)
  );
  const cgst = Math.round(taxableSubtotal * 0.09 * 100) / 100;
  const sgst = Math.round(taxableSubtotal * 0.09 * 100) / 100;

  const invoiceItems = order.orderItems.map((item, index) => ({
    itemIndex: index + 1,
    title: item.title,
    hsnCode: getHsnCode(item.product?.category),
    quantity: item.quantity,
    unitPrice: item.price,
    totalPrice: item.price * item.quantity,
    selectedSpecs: item.selectedSpecs || {}
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        invoiceNumber: `INV-${order.orderNumber}`,
        invoiceDate: order.createdAt,
        company: COMPANY_DETAILS,
        orderNumber: order.orderNumber,
        customer: {
          name: order.shippingAddress?.fullName || order.user?.name,
          phone: order.shippingAddress?.phone || order.user?.phone,
          email: order.user?.email,
          shippingAddress: order.shippingAddress
        },
        items: invoiceItems,
        pricing: {
          itemsTotal: order.pricing.itemsTotal,
          discountAmount: order.pricing.discountAmount || 0,
          cgstAmount: cgst,
          sgstAmount: sgst,
          totalTaxAmount: order.pricing.taxAmount || cgst + sgst,
          shippingFee: order.pricing.shippingFee || 0,
          grandTotal: order.pricing.grandTotal
        },
        payment: {
          method: order.paymentInfo?.method,
          status: order.paymentInfo?.status,
          transactionId: order.paymentInfo?.razorpayPaymentId || "",
          paidAt: order.paymentInfo?.paidAt || null
        }
      },
      "Tax invoice data retrieved successfully"
    )
  );
});

/**
 * @desc    Generate and stream printable Tax Invoice PDF directly to client browser
 * @route   GET /api/v1/invoices/:orderId/download
 * @access  Private (Customer & Admin)
 */
export const downloadOrderInvoicePDF = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await getAuthorizedOrder(orderId, req.user);

  const filename = `Invoice-${order.orderNumber}.pdf`;

  // Set HTTP headers for streaming binary PDF
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  // Generate and stream PDF directly to client response
  generateInvoicePDF(order, res);
});
