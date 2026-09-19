import mongoose from "mongoose";
import fs from "fs";
import { FlashDeal } from "../models/flashDeal.model.js";
import { Product } from "../models/product.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Helper to safely cleanup local temporary files
 */
const cleanupLocalFile = (file) => {
  if (file?.path && fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error(`⚠️ Failed to remove temp file: ${file.path}`, err.message);
    }
  }
};

/**
 * Helper to parse JSON fields safely
 */
const parseJSON = (field, fallback = []) => {
  if (!field) return fallback;
  if (typeof field === "object") return field;
  try {
    return JSON.parse(field);
  } catch (err) {
    return fallback;
  }
};

/**
 * Helper to format milliseconds into human-readable countdown
 */
const formatCountdown = (ms) => {
  if (ms <= 0) return { hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, totalMs: ms };
};

/**
 * @desc    Get currently live Flash Deal event for storefront with live countdown & progress
 * @route   GET /api/v1/flash-deals/active
 * @access  Public
 */
export const getActiveFlashDeal = asyncHandler(async (req, res) => {
  const now = new Date();

  const activeDeal = await FlashDeal.findOne({
    status: "ACTIVE",
    startTime: { $lte: now },
    endTime: { $gte: now }
  }).populate({
    path: "products.product",
    select: "title slug brand category regularPrice salePrice stock thumbnail images colors isActive"
  });

  if (!activeDeal) {
    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "No active flash deal running at the moment"
      )
    );
  }

  // Calculate live countdown timer and product-level claim metrics
  const remainingMs = Math.max(0, activeDeal.endTime.getTime() - now.getTime());
  const countdown = formatCountdown(remainingMs);

  const enrichedProducts = activeDeal.products
    .filter((item) => item.product && item.product.isActive)
    .map((item) => {
      const claimedPercentage = Math.min(
        100,
        Math.round((item.claimedCount / item.dealStock) * 100)
      );
      const isSoldOut = item.claimedCount >= item.dealStock;
      const remainingDealStock = Math.max(0, item.dealStock - item.claimedCount);

      return {
        _id: item._id,
        product: item.product,
        dealPrice: item.dealPrice,
        dealStock: item.dealStock,
        claimedCount: item.claimedCount,
        claimedPercentage,
        isSoldOut,
        remainingDealStock,
        discountPercentage: item.discountPercentage
      };
    });

  const responseData = {
    _id: activeDeal._id,
    title: activeDeal.title,
    slug: activeDeal.slug,
    description: activeDeal.description,
    bannerImage: activeDeal.bannerImage,
    startTime: activeDeal.startTime,
    endTime: activeDeal.endTime,
    isLive: true,
    countdown,
    products: enrichedProducts
  };

  return res.status(200).json(
    new ApiResponse(200, responseData, "Active flash deal retrieved successfully")
  );
});

/**
 * @desc    Get upcoming scheduled flash deals for teaser banners
 * @route   GET /api/v1/flash-deals/upcoming
 * @access  Public
 */
export const getUpcomingFlashDeals = asyncHandler(async (req, res) => {
  const now = new Date();

  const upcomingDeals = await FlashDeal.find({
    status: "ACTIVE",
    startTime: { $gt: now }
  })
    .sort({ startTime: 1 })
    .populate({
      path: "products.product",
      select: "title slug regularPrice thumbnail images"
    })
    .limit(5);

  return res.status(200).json(
    new ApiResponse(
      200,
      upcomingDeals,
      "Upcoming flash deals retrieved successfully"
    )
  );
});

/**
 * @desc    Get single flash deal by ID or slug
 * @route   GET /api/v1/flash-deals/:id
 * @access  Public
 */
export const getFlashDealById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id }
    : { slug: id.toLowerCase() };

  const deal = await FlashDeal.findOne(query).populate({
    path: "products.product",
    select: "title slug brand category regularPrice salePrice stock thumbnail images colors"
  });

  if (!deal) {
    throw new ApiError(404, "Flash deal not found");
  }

  return res.status(200).json(
    new ApiResponse(200, deal, "Flash deal details retrieved successfully")
  );
});

/**
 * @desc    Get all flash deals with pagination for admin
 * @route   GET /api/v1/flash-deals/admin/all
 * @access  Private (Admin only)
 */
export const getAllFlashDealsAdmin = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) {
    query.status = status.toUpperCase();
  }

  const pageNumber = Math.max(1, parseInt(page, 10));
  const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNumber - 1) * limitNumber;

  const [deals, totalDeals] = await Promise.all([
    FlashDeal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("products.product", "title regularPrice thumbnail")
      .lean(),
    FlashDeal.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deals,
        pagination: {
          totalDeals,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalDeals / limitNumber),
          limit: limitNumber
        }
      },
      "Flash deals retrieved for admin"
    )
  );
});

/**
 * @desc    Create a new Flash Deal event with products and quotas
 * @route   POST /api/v1/flash-deals
 * @access  Private (Admin only)
 */
export const createFlashDeal = asyncHandler(async (req, res) => {
  const {
    title,
    description = "",
    startTime,
    endTime,
    status = "ACTIVE"
  } = req.body;

  if (!title || !title.trim()) {
    cleanupLocalFile(req.file);
    throw new ApiError(400, "Flash deal title is required");
  }

  if (!startTime || !endTime) {
    cleanupLocalFile(req.file);
    throw new ApiError(400, "Start time and end time are required");
  }

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    cleanupLocalFile(req.file);
    throw new ApiError(400, "Invalid start or end time format");
  }

  if (startDate >= endDate) {
    cleanupLocalFile(req.file);
    throw new ApiError(400, "End time must be after start time");
  }

  const rawProducts = parseJSON(req.body.products, []);
  if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
    cleanupLocalFile(req.file);
    throw new ApiError(400, "At least one product is required for a flash deal");
  }

  // Validate products and compute discount percentages
  const validatedProducts = [];
  for (const item of rawProducts) {
    if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
      cleanupLocalFile(req.file);
      throw new ApiError(400, `Invalid product ID: ${item.product}`);
    }

    const numDealPrice = Number(item.dealPrice);
    const numDealStock = Number(item.dealStock);

    if (isNaN(numDealPrice) || numDealPrice < 0) {
      cleanupLocalFile(req.file);
      throw new ApiError(400, "Valid dealPrice is required for each product");
    }

    if (isNaN(numDealStock) || numDealStock < 1) {
      cleanupLocalFile(req.file);
      throw new ApiError(400, "Allocated dealStock must be at least 1 unit");
    }

    const productDoc = await Product.findById(item.product);
    if (!productDoc) {
      cleanupLocalFile(req.file);
      throw new ApiError(404, `Product with ID ${item.product} not found`);
    }

    if (numDealPrice >= productDoc.regularPrice) {
      cleanupLocalFile(req.file);
      throw new ApiError(
        400,
        `Deal price (${numDealPrice}) for '${productDoc.title}' must be lower than its regular price (${productDoc.regularPrice})`
      );
    }

    const discountPercentage = Math.round(
      ((productDoc.regularPrice - numDealPrice) / productDoc.regularPrice) * 100
    );

    validatedProducts.push({
      product: productDoc._id,
      dealPrice: numDealPrice,
      dealStock: numDealStock,
      claimedCount: 0,
      discountPercentage
    });
  }

  // Upload optional banner image to Cloudinary
  let bannerImageData = { url: "", public_id: "" };
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(
      req.file.path,
      "electronicsshop/flash-deals"
    );
    bannerImageData = {
      url: uploadResult.url,
      public_id: uploadResult.public_id
    };
  }

  const newDeal = await FlashDeal.create({
    title: title.trim(),
    description: description.trim(),
    bannerImage: bannerImageData,
    startTime: startDate,
    endTime: endDate,
    status: status.toUpperCase(),
    products: validatedProducts
  });

  return res.status(201).json(
    new ApiResponse(201, newDeal, "Flash deal created successfully")
  );
});

/**
 * @desc    Update an existing Flash Deal event
 * @route   PUT /api/v1/flash-deals/:id
 * @access  Private (Admin only)
 */
export const updateFlashDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    cleanupLocalFile(req.file);
    throw new ApiError(400, "Invalid flash deal ID format");
  }

  const deal = await FlashDeal.findById(id);
  if (!deal) {
    cleanupLocalFile(req.file);
    throw new ApiError(404, "Flash deal not found");
  }

  const { title, description, startTime, endTime, status } = req.body;

  if (title !== undefined) deal.title = title.trim();
  if (description !== undefined) deal.description = description.trim();
  if (startTime !== undefined) deal.startTime = new Date(startTime);
  if (endTime !== undefined) deal.endTime = new Date(endTime);
  if (status !== undefined) deal.status = status.toUpperCase();

  if (deal.startTime >= deal.endTime) {
    cleanupLocalFile(req.file);
    throw new ApiError(400, "End time must be after start time");
  }

  // If products are being replaced / updated
  if (req.body.products) {
    const rawProducts = parseJSON(req.body.products, []);
    if (Array.isArray(rawProducts) && rawProducts.length > 0) {
      const validatedProducts = [];
      for (const item of rawProducts) {
        const productDoc = await Product.findById(item.product);
        if (!productDoc) continue;

        const numDealPrice = Number(item.dealPrice);
        const numDealStock = Number(item.dealStock);
        const discountPercentage = Math.round(
          ((productDoc.regularPrice - numDealPrice) / productDoc.regularPrice) * 100
        );

        // Preserve previous claimedCount if product was already in this deal
        const existingItem = deal.products.find(
          (p) => p.product.toString() === item.product.toString()
        );
        const claimedCount = existingItem ? existingItem.claimedCount : 0;

        validatedProducts.push({
          product: productDoc._id,
          dealPrice: numDealPrice,
          dealStock: numDealStock,
          claimedCount,
          discountPercentage
        });
      }
      deal.products = validatedProducts;
    }
  }

  // Handle banner image update
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(
      req.file.path,
      "electronicsshop/flash-deals"
    );

    if (deal.bannerImage?.public_id) {
      await deleteFromCloudinary(deal.bannerImage.public_id);
    }

    deal.bannerImage = {
      url: uploadResult.url,
      public_id: uploadResult.public_id
    };
  }

  await deal.save();

  return res.status(200).json(
    new ApiResponse(200, deal, "Flash deal updated successfully")
  );
});

/**
 * @desc    Delete flash deal and clean up Cloudinary assets
 * @route   DELETE /api/v1/flash-deals/:id
 * @access  Private (Admin only)
 */
export const deleteFlashDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid flash deal ID format");
  }

  const deal = await FlashDeal.findById(id);
  if (!deal) {
    throw new ApiError(404, "Flash deal not found");
  }

  if (deal.bannerImage?.public_id) {
    await deleteFromCloudinary(deal.bannerImage.public_id);
  }

  await FlashDeal.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, null, "Flash deal deleted successfully")
  );
});

/**
 * @desc    Toggle or override status of flash deal (ACTIVE, PAUSED, ENDED, DRAFT)
 * @route   PATCH /api/v1/flash-deals/:id/status
 * @access  Private (Admin only)
 */
export const toggleFlashDealStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["DRAFT", "ACTIVE", "PAUSED", "ENDED"];
  if (!status || !validStatuses.includes(status.toUpperCase())) {
    throw new ApiError(400, `Invalid status. Allowed: ${validStatuses.join(", ")}`);
  }

  const deal = await FlashDeal.findById(id);
  if (!deal) {
    throw new ApiError(404, "Flash deal not found");
  }

  deal.status = status.toUpperCase();
  await deal.save();

  return res.status(200).json(
    new ApiResponse(200, deal, `Flash deal status updated to '${deal.status}'`)
  );
});
