import mongoose from "mongoose";
import { Coupon } from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * =====================================================================
 * ADMIN CONTROLLER ENDPOINTS
 * =====================================================================
 */

export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    maxDiscountAmount,
    minOrderValue = 0,
    startDate,
    expiryDate,
    usageLimit,
    usageLimitPerUser = 1,
    applicableCategories = [],
    isActive = true
  } = req.body;

  if (!code || !description || !discountType || discountValue === undefined || !expiryDate) {
    throw new ApiError(
      400,
      "Required fields: code, description, discountType, discountValue, expiryDate"
    );
  }

  const normalizedCode = code.trim().toUpperCase();

  // Check code uniqueness
  const existingCoupon = await Coupon.findOne({ code: normalizedCode });
  if (existingCoupon) {
    throw new ApiError(409, `Coupon with code '${normalizedCode}' already exists`);
  }

  const parsedStartDate = startDate ? new Date(startDate) : new Date();
  const parsedExpiryDate = new Date(expiryDate);

  if (isNaN(parsedExpiryDate.getTime())) {
    throw new ApiError(400, "Invalid expiry date format");
  }

  if (parsedExpiryDate <= parsedStartDate) {
    throw new ApiError(400, "Expiry date must be later than the start date");
  }

  if (discountType === "PERCENTAGE" && (discountValue <= 0 || discountValue > 100)) {
    throw new ApiError(400, "Percentage discount must be between 1% and 100%");
  }

  if (discountType === "FLAT" && discountValue <= 0) {
    throw new ApiError(400, "Flat discount amount must be greater than 0");
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    description: description.trim(),
    discountType,
    discountValue: Number(discountValue),
    maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
    minOrderValue: Number(minOrderValue) || 0,
    startDate: parsedStartDate,
    expiryDate: parsedExpiryDate,
    usageLimit: usageLimit ? Number(usageLimit) : null,
    usageLimitPerUser: Number(usageLimitPerUser) || 1,
    applicableCategories: Array.isArray(applicableCategories)
      ? applicableCategories.map((cat) => cat.toLowerCase().trim())
      : [],
    isActive: Boolean(isActive),
    createdBy: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(201, { coupon }, `Coupon '${coupon.code}' created successfully`)
  );
});

/**
 * @desc    Get all coupons with filtering, pagination, and usage statistics
 * @route   GET /api/v1/coupons/admin/all
 * @access  Private (Admin)
 */
export const getAllCouponsAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status = "all", // "all", "active", "expired", "upcoming"
    search = ""
  } = req.query;

  const query = {};
  const now = new Date();

  // Status filtering
  if (status === "active") {
    query.isActive = true;
    query.startDate = { $lte: now };
    query.expiryDate = { $gt: now };
  } else if (status === "expired") {
    query.expiryDate = { $lte: now };
  } else if (status === "upcoming") {
    query.startDate = { $gt: now };
  }

  // Text search on code or description
  if (search.trim()) {
    query.$or = [
      { code: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } }
    ];
  }

  const pageNumber = Math.max(1, parseInt(page, 10));
  const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNumber - 1) * limitNumber;

  const [coupons, totalCoupons] = await Promise.all([
    Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("createdBy", "name email"),
    Coupon.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        coupons,
        pagination: {
          totalCoupons,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCoupons / limitNumber),
          limit: limitNumber
        }
      },
      "Coupons list retrieved successfully"
    )
  );
});



export const getCouponByIdAdmin = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new ApiError(400, "Invalid coupon ID");
  }

  const coupon = await Coupon.findById(couponId)
    .populate("createdBy", "name email")
    .populate("usersUsed.user", "name email");

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { coupon }, "Coupon details retrieved successfully")
  );
});



export const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const updateData = { ...req.body };

  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new ApiError(400, "Invalid coupon ID");
  }

  const existingCoupon = await Coupon.findById(couponId);
  if (!existingCoupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // Prevent code conflicts if updating code
  if (updateData.code) {
    const normalizedCode = updateData.code.trim().toUpperCase();
    if (normalizedCode !== existingCoupon.code) {
      const codeConflict = await Coupon.findOne({ code: normalizedCode });
      if (codeConflict) {
        throw new ApiError(409, `Coupon code '${normalizedCode}' already exists`);
      }
      updateData.code = normalizedCode;
    }
  }

  // Validate dates if updated
  const startDate = updateData.startDate ? new Date(updateData.startDate) : existingCoupon.startDate;
  const expiryDate = updateData.expiryDate ? new Date(updateData.expiryDate) : existingCoupon.expiryDate;

  if (expiryDate <= startDate) {
    throw new ApiError(400, "Expiry date must be after the start date");
  }

  // Prevent updates to critical fields that would corrupt accounting
  delete updateData.usedCount;
  delete updateData.usersUsed;
  delete updateData.createdBy;

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { coupon: updatedCoupon }, "Coupon updated successfully")
  );
});




export const toggleCouponStatus = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new ApiError(400, "Invalid coupon ID");
  }

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { couponId: coupon._id, isActive: coupon.isActive },
      `Coupon '${coupon.code}' is now ${coupon.isActive ? "ACTIVE" : "INACTIVE"}`
    )
  );
});



export const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new ApiError(400, "Invalid coupon ID");
  }

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // If coupon was already redeemed, do not hard-delete to protect audit records
  if (coupon.usedCount > 0) {
    coupon.isActive = false;
    await coupon.save();
    return res.status(200).json(
      new ApiResponse(
        200,
        { couponId: coupon._id, isDeactivated: true },
        "Coupon has previous order redemptions. Deactivated safely instead of deletion."
      )
    );
  }

  await Coupon.findByIdAndDelete(couponId);

  return res.status(200).json(
    new ApiResponse(200, { couponId }, "Coupon deleted permanently")
  );
});

/**
 * =====================================================================
 * CUSTOMER CONTROLLER ENDPOINTS
 * =====================================================================
 */


export const getActiveCouponsForCustomer = asyncHandler(async (req, res) => {
  const now = new Date();
  const userId = req.user._id;

  // Find all coupons currently running
  const coupons = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    expiryDate: { $gt: now }
  }).sort({ minOrderValue: 1 });

  // Filter only those where global limit and user per-customer limits aren't exceeded
  const eligibleCoupons = coupons
    .filter((coupon) => {
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return false;
      }
      const userRecord = coupon.usersUsed.find(
        (record) => record.user.toString() === userId.toString()
      );
      if (userRecord && userRecord.usedCount >= coupon.usageLimitPerUser) {
        return false;
      }
      return true;
    })
    .map((coupon) => ({
      _id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minOrderValue: coupon.minOrderValue,
      expiryDate: coupon.expiryDate
    }));

  return res.status(200).json(
    new ApiResponse(
      200,
      { coupons: eligibleCoupons },
      "Active coupons retrieved successfully"
    )
  );
});
