import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get complete hierarchical Category Tree (Root categories + Children) for Mega Menu
 * @route   GET /api/v1/categories/tree
 * @access  Public
 */
export const getCategoryTree = asyncHandler(async (req, res) => {
  // Find all active parent categories (parent === null)
  const rootCategories = await Category.find({ parent: null, isActive: true })
    .populate({
      path: "children",
      match: { isActive: true },
      select: "name slug icon description displayOrder",
      options: { sort: { displayOrder: 1, name: 1 } }
    })
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      rootCategories,
      "Category tree retrieved successfully"
    )
  );
});

/**
 * @desc    Get flat list of categories with product counts and optional parent filter
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const { rootsOnly, includeInactive } = req.query;

  const query = {};
  if (rootsOnly === "true") {
    query.parent = null;
  }
  if (includeInactive !== "true") {
    query.isActive = true;
  }

  const categories = await Category.find(query)
    .populate("parent", "name slug")
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  // Get product counts per category in a single aggregation pass
  const productCounts = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 }
      }
    }
  ]);

  const countMap = productCounts.reduce((acc, curr) => {
    if (curr._id) acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  const formattedCategories = categories.map((cat) => ({
    ...cat,
    productCount: countMap[cat._id.toString()] || 0
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      formattedCategories,
      "Categories retrieved successfully"
    )
  );
});

/**
 * @desc    Get detailed category info by slug with its children & specifications template
 * @route   GET /api/v1/categories/:slug
 * @access  Public
 */
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug, isActive: true })
    .populate("parent", "name slug icon")
    .populate({
      path: "children",
      match: { isActive: true },
      select: "name slug icon banner description"
    })
    .lean();

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const productCount = await Product.countDocuments({
    $or: [
      { category: category._id },
      { categoryName: category.slug }
    ],
    isActive: true
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { ...category, productCount },
      "Category details retrieved successfully"
    )
  );
});

/**
 * @desc    Create a new Category or Sub-Category (with icon and banner uploads)
 * @route   POST /api/v1/categories
 * @access  Private (Admin only)
 */
export const createCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description = "",
    parent,
    specificationsTemplate,
    displayOrder = 0,
    isActive = true
  } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Category name is required");
  }

  // Check name uniqueness
  const existingCategory = await Category.findOne({
    name: new RegExp(`^${name.trim()}$`, "i")
  });
  if (existingCategory) {
    throw new ApiError(400, `Category with name '${name}' already exists`);
  }

  // If parent specified, verify it exists and is not a child itself (max 2-level hierarchy for clean UX)
  let parentId = null;
  if (parent) {
    if (!mongoose.Types.ObjectId.isValid(parent)) {
      throw new ApiError(400, "Invalid parent category ID format");
    }
    const parentDoc = await Category.findById(parent);
    if (!parentDoc) {
      throw new ApiError(404, "Parent category not found");
    }
    parentId = parentDoc._id;
  }

  // Handle Cloudinary uploads for icon and banner
  let iconData = { url: "", public_id: "" };
  let bannerData = { url: "", public_id: "" };

  if (req.files?.icon?.[0]?.path) {
    const iconUpload = await uploadOnCloudinary(
      req.files.icon[0].path,
      "electronicsshop/categories/icons"
    );
    if (iconUpload) iconData = iconUpload;
  }

  if (req.files?.banner?.[0]?.path) {
    const bannerUpload = await uploadOnCloudinary(
      req.files.banner[0].path,
      "electronicsshop/categories/banners"
    );
    if (bannerUpload) bannerData = bannerUpload;
  }

  // Parse specifications template
  let specsTemplate = [];
  if (Array.isArray(specificationsTemplate)) {
    specsTemplate = specificationsTemplate.filter(Boolean);
  } else if (typeof specificationsTemplate === "string" && specificationsTemplate.trim()) {
    specsTemplate = specificationsTemplate.split(",").map((s) => s.trim()).filter(Boolean);
  }

  const category = await Category.create({
    name: name.trim(),
    description: description.trim(),
    parent: parentId,
    icon: iconData,
    banner: bannerData,
    specificationsTemplate: specsTemplate,
    displayOrder: Number(displayOrder) || 0,
    isActive: Boolean(isActive)
  });

  return res.status(201).json(
    new ApiResponse(201, category, "Category created successfully")
  );
});

/**
 * @desc    Update an existing Category
 * @route   PUT /api/v1/categories/:id
 * @access  Private (Admin only)
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    parent,
    specificationsTemplate,
    displayOrder,
    isActive
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID format");
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check name uniqueness if changed
  if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const duplicate = await Category.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
      _id: { $ne: id }
    });
    if (duplicate) {
      throw new ApiError(400, `Category with name '${name}' already exists`);
    }
    category.name = name.trim();
  }

  // Validate parent (cannot be itself)
  if (parent !== undefined) {
    if (parent === "" || parent === null || parent === "null") {
      category.parent = null;
    } else if (parent.toString() === id.toString()) {
      throw new ApiError(400, "A category cannot be its own parent");
    } else if (mongoose.Types.ObjectId.isValid(parent)) {
      const parentDoc = await Category.findById(parent);
      if (!parentDoc) throw new ApiError(404, "Parent category not found");
      category.parent = parentDoc._id;
    }
  }

  if (description !== undefined) category.description = description.trim();
  if (displayOrder !== undefined) category.displayOrder = Number(displayOrder) || 0;
  if (isActive !== undefined) category.isActive = Boolean(isActive);

  if (specificationsTemplate !== undefined) {
    if (Array.isArray(specificationsTemplate)) {
      category.specificationsTemplate = specificationsTemplate.filter(Boolean);
    } else if (typeof specificationsTemplate === "string") {
      category.specificationsTemplate = specificationsTemplate.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  // Handle icon replacement
  if (req.files?.icon?.[0]?.path) {
    if (category.icon?.public_id) {
      await deleteFromCloudinary(category.icon.public_id);
    }
    const iconUpload = await uploadOnCloudinary(
      req.files.icon[0].path,
      "electronicsshop/categories/icons"
    );
    if (iconUpload) category.icon = iconUpload;
  }

  // Handle banner replacement
  if (req.files?.banner?.[0]?.path) {
    if (category.banner?.public_id) {
      await deleteFromCloudinary(category.banner.public_id);
    }
    const bannerUpload = await uploadOnCloudinary(
      req.files.banner[0].path,
      "electronicsshop/categories/banners"
    );
    if (bannerUpload) category.banner = bannerUpload;
  }

  await category.save();

  return res.status(200).json(
    new ApiResponse(200, category, "Category updated successfully")
  );
});

/**
 * @desc    Delete a Category (with safety checks against orphaned subcategories & products)
 * @route   DELETE /api/v1/categories/:id
 * @access  Private (Admin only)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID format");
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Safety Check 1: Check if subcategories exist under this category
  const childCount = await Category.countDocuments({ parent: id });
  if (childCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category. There are ${childCount} sub-categories under this category. Please reassign or delete them first.`
    );
  }

  // Safety Check 2: Check if active products are assigned to this category
  const productCount = await Product.countDocuments({
    $or: [{ category: id }, { categoryName: category.slug }]
  });
  if (productCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category. There are ${productCount} products currently assigned to this category. Please reassign products first.`
    );
  }

  // Clean up Cloudinary assets
  if (category.icon?.public_id) {
    await deleteFromCloudinary(category.icon.public_id);
  }
  if (category.banner?.public_id) {
    await deleteFromCloudinary(category.banner.public_id);
  }

  await Category.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, { deletedId: id }, "Category deleted successfully")
  );
});
