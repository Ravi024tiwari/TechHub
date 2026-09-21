import mongoose from "mongoose";
import { Brand } from "../models/brand.model.js";
import { Product } from "../models/product.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get all active brands with product counts
 * @route   GET /api/v1/brands
 * @access  Public
 */
export const getAllBrands = asyncHandler(async (req, res) => {
  const { isFeatured, includeInactive, search, page, limit } = req.query;

  const query = {};
  if (isFeatured === "true") {
    query.isFeatured = true;
  }
  if (includeInactive !== "true") {
    query.isActive = true;
  }
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { name: searchRegex },
      { slug: searchRegex },
      { description: searchRegex }
    ];
  }

  // Aggregate product count per brand
  const productCounts = await Product.aggregate([
    {
      $group: {
        _id: "$brand",
        count: { $sum: 1 }
      }
    }
  ]);

  const countMap = productCounts.reduce((acc, curr) => {
    if (curr._id) acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  // Pagination support
  if (page) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [brands, total] = await Promise.all([
      Brand.find(query).sort({ name: 1 }).skip(skip).limit(limitNum).lean(),
      Brand.countDocuments(query)
    ]);

    const formattedBrands = brands.map((b) => ({
      ...b,
      productCount: countMap[b._id.toString()] || 0
    }));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          brands: formattedBrands,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum) || 1,
            hasNextPage: skip + brands.length < total
          }
        },
        "Brands retrieved successfully"
      )
    );
  }

  const brands = await Brand.find(query).sort({ name: 1 }).lean();

  const formattedBrands = brands.map((b) => ({
    ...b,
    productCount: countMap[b._id.toString()] || 0
  }));

  return res.status(200).json(
    new ApiResponse(200, formattedBrands, "Brands retrieved successfully")
  );
});

/**
 * @desc    Get featured brands with logos for homepage brand carousel
 * @route   GET /api/v1/brands/featured
 * @access  Public
 */
export const getFeaturedBrands = asyncHandler(async (req, res) => {
  const featuredBrands = await Brand.find({ isFeatured: true, isActive: true })
    .select("name slug logo website")
    .sort({ name: 1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, featuredBrands, "Featured brands retrieved successfully")
  );
});

/**
 * @desc    Get single brand by slug
 * @route   GET /api/v1/brands/:slug
 * @access  Public
 */
export const getBrandBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const brand = await Brand.findOne({ slug, isActive: true }).lean();
  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  const productCount = await Product.countDocuments({
    $or: [{ brand: brand._id }, { brandName: brand.name }],
    isActive: true
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { ...brand, productCount },
      "Brand details retrieved successfully"
    )
  );
});

/**
 * @desc    Create a new Brand (with logo and optional banner uploads)
 * @route   POST /api/v1/brands
 * @access  Private (Admin only)
 */
export const createBrand = asyncHandler(async (req, res) => {
  const {
    name,
    description = "",
    website = "",
    isFeatured = false,
    isActive = true
  } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Brand name is required");
  }

  const existingBrand = await Brand.findOne({
    name: new RegExp(`^${name.trim()}$`, "i")
  });
  if (existingBrand) {
    throw new ApiError(400, `Brand with name '${name}' already exists`);
  }

  let logoData = { url: "", public_id: "" };
  if (req.files?.logo?.[0]?.path) {
    const logoUpload = await uploadOnCloudinary(
      req.files.logo[0].path,
      "electronicsshop/brands/logos"
    );
    if (logoUpload) logoData = logoUpload;
  }

  let bannerData = { url: "", public_id: "" };
  if (req.files?.banner?.[0]?.path) {
    const bannerUpload = await uploadOnCloudinary(
      req.files.banner[0].path,
      "electronicsshop/brands/banners"
    );
    if (bannerUpload) bannerData = bannerUpload;
  }

  const brand = await Brand.create({
    name: name.trim(),
    description: description.trim(),
    website: website.trim(),
    logo: logoData,
    banner: bannerData,
    isFeatured: Boolean(isFeatured === true || isFeatured === "true"),
    isActive: Boolean(isActive)
  });

  return res.status(201).json(
    new ApiResponse(201, brand, "Brand created successfully")
  );
});

/**
 * @desc    Update an existing Brand
 * @route   PUT /api/v1/brands/:id
 * @access  Private (Admin only)
 */
export const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, website, isFeatured, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid brand ID format");
  }

  const brand = await Brand.findById(id);
  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  // Check name uniqueness if updated
  if (name && name.trim().toLowerCase() !== brand.name.toLowerCase()) {
    const duplicate = await Brand.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
      _id: { $ne: id }
    });
    if (duplicate) {
      throw new ApiError(400, `Brand with name '${name}' already exists`);
    }
    brand.name = name.trim();
  }

  if (description !== undefined) brand.description = description.trim();
  if (website !== undefined) brand.website = website.trim();
  if (isFeatured !== undefined) brand.isFeatured = Boolean(isFeatured === true || isFeatured === "true");
  if (isActive !== undefined) brand.isActive = Boolean(isActive);

  // Handle logo replacement
  if (req.files?.logo?.[0]?.path) {
    if (brand.logo?.public_id) {
      await deleteFromCloudinary(brand.logo.public_id);
    }
    const logoUpload = await uploadOnCloudinary(
      req.files.logo[0].path,
      "electronicsshop/brands/logos"
    );
    if (logoUpload) brand.logo = logoUpload;
  }

  // Handle banner replacement
  if (req.files?.banner?.[0]?.path) {
    if (brand.banner?.public_id) {
      await deleteFromCloudinary(brand.banner.public_id);
    }
    const bannerUpload = await uploadOnCloudinary(
      req.files.banner[0].path,
      "electronicsshop/brands/banners"
    );
    if (bannerUpload) brand.banner = bannerUpload;
  }

  await brand.save();

  return res.status(200).json(
    new ApiResponse(200, brand, "Brand updated successfully")
  );
});

/**
 * @desc    Delete a Brand (with safety check against assigned products)
 * @route   DELETE /api/v1/brands/:id
 * @access  Private (Admin only)
 */
export const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid brand ID format");
  }

  const brand = await Brand.findById(id);
  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  // Safety check: Prevent deletion if products reference this brand
  const productCount = await Product.countDocuments({
    $or: [{ brand: id }, { brandName: brand.name }]
  });
  if (productCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete brand. There are ${productCount} products currently assigned to '${brand.name}'. Please reassign or delete the products first.`
    );
  }

  if (brand.logo?.public_id) {
    await deleteFromCloudinary(brand.logo.public_id);
  }
  if (brand.banner?.public_id) {
    await deleteFromCloudinary(brand.banner.public_id);
  }

  await Brand.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, { deletedId: id }, "Brand deleted successfully")
  );
});
