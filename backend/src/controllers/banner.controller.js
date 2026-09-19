import mongoose from "mongoose";
import fs from "fs";
import { Banner } from "../models/banner.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Helper to safely cleanup local temporary files on error
 */
const cleanupLocalFiles = (files = {}) => {
  if (!files || typeof files !== "object") return;
  Object.values(files).forEach((fileArr) => {
    if (Array.isArray(fileArr)) {
      fileArr.forEach((file) => {
        if (file?.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error(`⚠️ Failed to remove temp file: ${file.path}`, err.message);
          }
        }
      });
    }
  });
};

/**
 * @desc    Get active banners for storefront (Hero slider, middle strip, promo)
 * @route   GET /api/v1/banners
 * @access  Public
 */
export const getActiveBanners = asyncHandler(async (req, res) => {
  const { position = "HERO_SLIDER" } = req.query;

  const validPositions = ["HERO_SLIDER", "MIDDLE_STRIP", "SIDEBAR_PROMO"];
  const targetPosition = validPositions.includes(position.toUpperCase())
    ? position.toUpperCase()
    : "HERO_SLIDER";

  const banners = await Banner.findActiveBanners(targetPosition);

  return res.status(200).json(
    new ApiResponse(
      200,
      banners,
      `Active ${targetPosition.toLowerCase().replace("_", " ")} banners retrieved successfully`
    )
  );
});

/**
 * @desc    Get all banners with pagination & filtering for admin management
 * @route   GET /api/v1/banners/admin
 * @access  Private (Admin only)
 */
export const getAllBannersAdmin = asyncHandler(async (req, res) => {
  const { position, isActive, page = 1, limit = 20 } = req.query;

  const query = {};
  if (position) {
    query.position = position.toUpperCase();
  }
  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  const pageNumber = Math.max(1, parseInt(page, 10));
  const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNumber - 1) * limitNumber;

  const [banners, totalBanners] = await Promise.all([
    Banner.find(query)
      .sort({ position: 1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Banner.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        banners,
        pagination: {
          totalBanners,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalBanners / limitNumber),
          limit: limitNumber
        }
      },
      "Banners retrieved for administration"
    )
  );
});

/**
 * @desc    Create a new banner with dual responsive assets (Desktop + Mobile)
 * @route   POST /api/v1/banners
 * @access  Private (Admin only)
 */
export const createBanner = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle = "",
    badgeText = "",
    linkType = "CUSTOM_URL",
    linkValue,
    position = "HERO_SLIDER",
    displayOrder = 0,
    isActive = true,
    startDate,
    endDate
  } = req.body;

  if (!title || !title.trim()) {
    cleanupLocalFiles(req.files);
    throw new ApiError(400, "Banner title is required");
  }

  if (!linkValue || !linkValue.trim()) {
    cleanupLocalFiles(req.files);
    throw new ApiError(400, "Banner target link or destination slug is required");
  }

  // Desktop image is mandatory
  const desktopFile = req.files?.desktopImage?.[0];
  if (!desktopFile) {
    cleanupLocalFiles(req.files);
    throw new ApiError(400, "Desktop banner image is required");
  }

  // Upload desktop image to Cloudinary
  const desktopUpload = await uploadOnCloudinary(
    desktopFile.path,
    "electronicsshop/banners/desktop"
  );

  // Optional mobile image upload
  let mobileImage = null;
  const mobileFile = req.files?.mobileImage?.[0];
  if (mobileFile) {
    const mobileUpload = await uploadOnCloudinary(
      mobileFile.path,
      "electronicsshop/banners/mobile"
    );
    mobileImage = {
      url: mobileUpload.url,
      public_id: mobileUpload.public_id
    };
  }

  const newBanner = await Banner.create({
    title: title.trim(),
    subtitle: subtitle.trim(),
    badgeText: badgeText.trim(),
    desktopImage: {
      url: desktopUpload.url,
      public_id: desktopUpload.public_id
    },
    mobileImage,
    linkType: linkType.toUpperCase(),
    linkValue: linkValue.trim(),
    position: position.toUpperCase(),
    displayOrder: Number(displayOrder) || 0,
    isActive: isActive === "true" || isActive === true,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null
  });

  return res.status(201).json(
    new ApiResponse(201, newBanner, "Banner created successfully")
  );
});

/**
 * @desc    Update an existing banner (Metadata and optional image replacement)
 * @route   PUT /api/v1/banners/:id
 * @access  Private (Admin only)
 */
export const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    cleanupLocalFiles(req.files);
    throw new ApiError(400, "Invalid banner ID format");
  }

  const banner = await Banner.findById(id);
  if (!banner) {
    cleanupLocalFiles(req.files);
    throw new ApiError(404, "Banner not found");
  }

  const {
    title,
    subtitle,
    badgeText,
    linkType,
    linkValue,
    position,
    displayOrder,
    isActive,
    startDate,
    endDate
  } = req.body;

  if (title !== undefined) banner.title = title.trim();
  if (subtitle !== undefined) banner.subtitle = subtitle.trim();
  if (badgeText !== undefined) banner.badgeText = badgeText.trim();
  if (linkType !== undefined) banner.linkType = linkType.toUpperCase();
  if (linkValue !== undefined) banner.linkValue = linkValue.trim();
  if (position !== undefined) banner.position = position.toUpperCase();
  if (displayOrder !== undefined) banner.displayOrder = Number(displayOrder);
  if (isActive !== undefined) banner.isActive = isActive === "true" || isActive === true;
  if (startDate !== undefined) banner.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) banner.endDate = endDate ? new Date(endDate) : null;

  // Handle Desktop image replacement
  if (req.files?.desktopImage?.[0]) {
    const desktopUpload = await uploadOnCloudinary(
      req.files.desktopImage[0].path,
      "electronicsshop/banners/desktop"
    );

    if (banner.desktopImage?.public_id) {
      await deleteFromCloudinary(banner.desktopImage.public_id);
    }

    banner.desktopImage = {
      url: desktopUpload.url,
      public_id: desktopUpload.public_id
    };
  }

  // Handle Mobile image replacement
  if (req.files?.mobileImage?.[0]) {
    const mobileUpload = await uploadOnCloudinary(
      req.files.mobileImage[0].path,
      "electronicsshop/banners/mobile"
    );

    if (banner.mobileImage?.public_id) {
      await deleteFromCloudinary(banner.mobileImage.public_id);
    }

    banner.mobileImage = {
      url: mobileUpload.url,
      public_id: mobileUpload.public_id
    };
  }

  await banner.save();

  return res.status(200).json(
    new ApiResponse(200, banner, "Banner updated successfully")
  );
});

/**
 * @desc    Delete banner and prune Cloudinary assets
 * @route   DELETE /api/v1/banners/:id
 * @access  Private (Admin only)
 */
export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid banner ID format");
  }

  const banner = await Banner.findById(id);
  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  // Clean up assets in Cloudinary
  if (banner.desktopImage?.public_id) {
    await deleteFromCloudinary(banner.desktopImage.public_id);
  }
  if (banner.mobileImage?.public_id) {
    await deleteFromCloudinary(banner.mobileImage.public_id);
  }

  await Banner.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, null, "Banner deleted and images pruned successfully")
  );
});

/**
 * @desc    Bulk reorder banners for priority display
 * @route   PATCH /api/v1/banners/reorder
 * @access  Private (Admin only)
 */
export const reorderBanners = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Items array with { id, displayOrder } required for reordering");
  }

  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { displayOrder: Number(item.displayOrder) || 0 } }
    }
  }));

  await Banner.bulkWrite(bulkOps);

  return res.status(200).json(
    new ApiResponse(200, null, "Banners reordered successfully")
  );
});
