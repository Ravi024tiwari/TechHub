import mongoose from "mongoose";
import { ReturnRequest } from "../models/return.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { razorpayInstance } from "../config/razorpay.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const RETURN_POLICY_DAYS = 7;

/**
 * @desc    Submit a return or replacement request for an order item
 * @route   POST /api/v1/returns
 * @access  Private (Customer only)
 */
export const requestOrderReturn = asyncHandler(async (req, res) => {
  const {
    orderId,
    orderItemId,
    requestType = "RETURN_AND_REFUND",
    reason,
    description,
    serialNumber = "",
    pickupAddressId
  } = req.body;

  if (!orderId || !orderItemId || !reason || !description) {
    throw new ApiError(
      400,
      "Order ID, Order Item ID, reason, and detailed description are required"
    );
  }

  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(orderItemId)) {
    throw new ApiError(400, "Invalid Order ID or Order Item ID format");
  }

  // 1. Fetch Order and verify ownership
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized: You do not have permission to return items from this order");
  }

  // 2. Policy Check: Order must be DELIVERED
  if (order.orderStatus !== "DELIVERED") {
    throw new ApiError(
      400,
      `Return requests are only permitted for delivered orders. Current order status: '${order.orderStatus}'`
    );
  }

  // 3. Policy Check: 7-Day Window from delivery date
  const deliveryDate = order.trackingInfo?.deliveredAt || order.updatedAt;
  const diffTimeMs = Date.now() - new Date(deliveryDate).getTime();
  const diffDays = diffTimeMs / (1000 * 60 * 60 * 24);

  if (diffDays > RETURN_POLICY_DAYS) {
    throw new ApiError(
      400,
      `The return/replacement window has expired. Electronics items are eligible for returns within ${RETURN_POLICY_DAYS} days of delivery.`
    );
  }

  // 4. Locate the specific order item
  const itemToReturn = order.orderItems.id(orderItemId);
  if (!itemToReturn) {
    throw new ApiError(404, "Selected item not found in this order");
  }

  // 5. Prevent duplicate active return requests on the exact same item
  const existingActiveReturn = await ReturnRequest.findOne({
    order: orderId,
    "orderItem.orderItemId": orderItemId,
    status: { $nin: ["CANCELLED", "REJECTED"] }
  });

  if (existingActiveReturn) {
    throw new ApiError(
      400,
      `An active return request (${existingActiveReturn.returnNumber}) already exists for this item. Current status: '${existingActiveReturn.status}'`
    );
  }

  // 6. Upload any attached evidence images to Cloudinary
  const evidenceImages = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await uploadOnCloudinary(file.path, "electronicsshop/returns");
      if (uploadResult) {
        evidenceImages.push({
          url: uploadResult.url,
          public_id: uploadResult.public_id
        });
      }
    }
  }

  // 7. Resolve Reverse Pickup Address
  let pickupAddress = order.shippingAddress;
  if (pickupAddressId && mongoose.Types.ObjectId.isValid(pickupAddressId)) {
    const userDoc = await User.findById(req.user._id);
    const savedAddr = userDoc?.addresses?.id(pickupAddressId);
    if (savedAddr) {
      pickupAddress = {
        fullName: savedAddr.fullName,
        phone: savedAddr.phone,
        street: savedAddr.street,
        landmark: savedAddr.landmark || "",
        city: savedAddr.city,
        state: savedAddr.state,
        pincode: savedAddr.pincode,
        addressType: savedAddr.addressType || "home"
      };
    }
  }

  // 8. Create Return Request Record
  const newReturn = await ReturnRequest.create({
    order: order._id,
    user: req.user._id,
    orderItem: {
      orderItemId: itemToReturn._id,
      product: itemToReturn.product,
      title: itemToReturn.title,
      image: itemToReturn.image,
      price: itemToReturn.price,
      quantity: itemToReturn.quantity,
      selectedSpecs: itemToReturn.selectedSpecs || {}
    },
    requestType,
    reason,
    description: description.trim(),
    serialNumber: serialNumber.trim(),
    evidenceImages,
    pickupAddress,
    status: "REQUESTED",
    refundDetails: {
      amount: itemToReturn.price * itemToReturn.quantity,
      status: "PENDING"
    }
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      newReturn,
      "Return/replacement request submitted successfully. Our team will review your request shortly."
    )
  );
});

/**
 * @desc    Get all return requests submitted by the current authenticated user
 * @route   GET /api/v1/returns/my-returns
 * @access  Private (Customer only)
 */
export const getMyReturnRequests = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const query = { user: req.user._id };

  const [totalReturns, returns] = await Promise.all([
    ReturnRequest.countDocuments(query),
    ReturnRequest.find(query)
      .populate("order", "orderNumber orderStatus createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
  ]);

  const totalPages = Math.ceil(totalReturns / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        returns,
        pagination: {
          totalReturns,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      "Customer return requests retrieved successfully"
    )
  );
});

/**
 * @desc    Get details of a specific return request by its ID
 * @route   GET /api/v1/returns/:returnId
 * @access  Private (Customer & Admin)
 */
export const getReturnDetails = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return request ID format");
  }

  const returnRequest = await ReturnRequest.findById(returnId)
    .populate("user", "name email phone avatar")
    .populate("order", "orderNumber paymentInfo trackingInfo pricing createdAt")
    .lean();

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  // Authorization check: User can only access their own return unless they are an admin
  if (
    req.user.role !== "admin" &&
    returnRequest.user._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Access forbidden: You do not have permission to view this return request");
  }

  return res.status(200).json(
    new ApiResponse(200, returnRequest, "Return request details retrieved successfully")
  );
});

/**
 * @desc    Cancel a pending return request
 * @route   PATCH /api/v1/returns/:returnId/cancel
 * @access  Private (Customer only)
 */
export const cancelReturnRequest = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return request ID format");
  }

  const returnRequest = await ReturnRequest.findById(returnId);
  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  if (returnRequest.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized: You can only cancel your own return requests");
  }

  if (returnRequest.status !== "REQUESTED") {
    throw new ApiError(
      400,
      `Cannot cancel request in '${returnRequest.status}' status. Only pending requests can be cancelled directly.`
    );
  }

  returnRequest.status = "CANCELLED";
  returnRequest.statusTimeline.push({
    status: "CANCELLED",
    timestamp: new Date(),
    note: "Return request cancelled by customer."
  });

  await returnRequest.save();

  return res.status(200).json(
    new ApiResponse(200, returnRequest, "Return request cancelled successfully")
  );
});

// ==========================================
// ADMIN RETURN & REFUND CONTROLLERS
// ==========================================

/**
 * @desc    Get all return requests with pagination and status filters
 * @route   GET /api/v1/returns/admin/all
 * @access  Private (Admin only)
 */
export const getAllReturnRequestsAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { status, requestType, search } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (requestType) {
    query.requestType = requestType;
  }

  if (search && search.trim()) {
    query.returnNumber = new RegExp(search.trim(), "i");
  }

  const [totalReturns, returns] = await Promise.all([
    ReturnRequest.countDocuments(query),
    ReturnRequest.find(query)
      .populate("user", "name email phone")
      .populate("order", "orderNumber paymentInfo.method orderStatus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
  ]);

  const totalPages = Math.ceil(totalReturns / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        returns,
        pagination: {
          totalReturns,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      "Admin return requests retrieved successfully"
    )
  );
});

/**
 * @desc    Review, Approve, Reject, or advance Return Request status
 * @route   PATCH /api/v1/returns/admin/:returnId/status
 * @access  Private (Admin only)
 */
export const reviewReturnRequestAdmin = asyncHandler(async (req, res) => {
  const { returnId } = req.params;
  const { status, adminRemarks = "", rejectionReason = "" } = req.body;

  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return request ID format");
  }

  const allowedStatuses = [
    "APPROVED",
    "REJECTED",
    "PICKUP_SCHEDULED",
    "ITEM_RECEIVED",
    "REPLACEMENT_DISPATCHED",
    "COMPLETED"
  ];

  if (!status || !allowedStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Valid status is required. Allowed values: ${allowedStatuses.join(", ")}`
    );
  }

  if (status === "REJECTED" && (!rejectionReason || !rejectionReason.trim())) {
    throw new ApiError(400, "A specific rejectionReason is required when rejecting a return request");
  }

  const returnRequest = await ReturnRequest.findById(returnId);
  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  returnRequest.status = status;
  if (adminRemarks) returnRequest.adminRemarks = adminRemarks.trim();
  if (rejectionReason) returnRequest.rejectionReason = rejectionReason.trim();

  let timelineNote = `Status updated to ${status} by administrator.`;
  if (status === "REJECTED") timelineNote = `Return rejected: ${rejectionReason.trim()}`;
  if (adminRemarks) timelineNote += ` Note: ${adminRemarks.trim()}`;

  returnRequest.statusTimeline.push({
    status,
    timestamp: new Date(),
    note: timelineNote
  });

  await returnRequest.save();

  return res.status(200).json(
    new ApiResponse(200, returnRequest, `Return request status updated to '${status}' successfully`)
  );
});

/**
 * @desc    Process Programmatic Razorpay Refund and Inventory Restocking
 * @route   POST /api/v1/returns/admin/:returnId/refund
 * @access  Private (Admin only)
 */
export const processReturnRefundAdmin = asyncHandler(async (req, res) => {
  const { returnId } = req.params;
  const { customAmount, restockItem = true, notes = "" } = req.body;

  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return request ID format");
  }

  const returnRequest = await ReturnRequest.findById(returnId);
  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  if (returnRequest.requestType !== "RETURN_AND_REFUND") {
    throw new ApiError(
      400,
      `Cannot process refund for request type '${returnRequest.requestType}'. This request is for REPLACEMENT.`
    );
  }

  if (!["APPROVED", "ITEM_RECEIVED"].includes(returnRequest.status)) {
    throw new ApiError(
      400,
      `Refund can only be initiated for returns that are APPROVED or ITEM_RECEIVED. Current status: '${returnRequest.status}'`
    );
  }

  if (returnRequest.refundDetails?.status === "COMPLETED") {
    throw new ApiError(400, "Refund has already been processed for this return request");
  }

  const order = await Order.findById(returnRequest.order);
  if (!order) {
    throw new ApiError(404, "Associated order not found");
  }

  // Calculate refund amount: default to item total or custom amount entered by admin
  const refundAmount =
    typeof customAmount === "number" && customAmount > 0
      ? customAmount
      : returnRequest.orderItem.price * returnRequest.orderItem.quantity;

  let razorpayRefundId = "";

  // 1. If original payment was Razorpay, trigger automated programmatic refund via Razorpay API
  if (
    order.paymentInfo?.method === "RAZORPAY" &&
    order.paymentInfo?.razorpayPaymentId
  ) {
    try {
      const amountInPaise = Math.round(refundAmount * 100);

      const razorpayRefund = await razorpayInstance.payments.refund(
        order.paymentInfo.razorpayPaymentId,
        {
          amount: amountInPaise,
          notes: {
            returnNumber: returnRequest.returnNumber,
            orderNumber: order.orderNumber,
            reason: returnRequest.reason
          }
        }
      );

      razorpayRefundId = razorpayRefund.id;
    } catch (razorpayError) {
      console.error("💥 Razorpay Refund API Error:", razorpayError);
      throw new ApiError(
        500,
        `Razorpay Refund Failed: ${razorpayError.error?.description || razorpayError.message}`
      );
    }
  } else {
    // COD orders or manual bank transfers
    razorpayRefundId = `MANUAL_REF_${Date.now()}`;
  }

  // 2. Update Return Request Record
  returnRequest.status = "REFUND_PROCESSED";
  returnRequest.refundDetails = {
    razorpayRefundId,
    amount: refundAmount,
    status: "COMPLETED",
    refundedAt: new Date()
  };

  returnRequest.statusTimeline.push({
    status: "REFUND_PROCESSED",
    timestamp: new Date(),
    note: `Refund of ₹${refundAmount} processed successfully. Reference: ${razorpayRefundId}. ${notes}`
  });

  await returnRequest.save();

  // 3. Update Order financial ledger & timeline
  order.paymentInfo.status = "REFUNDED";
  order.statusTimeline.push({
    status: order.orderStatus,
    timestamp: new Date(),
    note: `Refund of ₹${refundAmount} issued for returned item '${returnRequest.orderItem.title}' (${razorpayRefundId}).`
  });
  await order.save();

  // 4. Restock inventory if item is verified in acceptable restockable condition
  if (restockItem && returnRequest.orderItem.product) {
    await Product.findByIdAndUpdate(returnRequest.orderItem.product, {
      $inc: { stock: returnRequest.orderItem.quantity }
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        returnNumber: returnRequest.returnNumber,
        refundAmount,
        refundId: razorpayRefundId,
        status: returnRequest.status,
        restocked: Boolean(restockItem)
      },
      `Refund of ₹${refundAmount} processed successfully to customer's account`
    )
  );
});
