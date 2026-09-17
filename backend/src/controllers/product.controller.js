import fs from "fs";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { validateCategorySpecs } from "../utils/categorySpecsValidator.js";

/**
 * Helper to safely cleanup local temporary files
 */
const cleanupLocalFiles = (files = []) => {
  if (!Array.isArray(files)) return;
  for (const file of files) {
    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`⚠️ Failed to remove temp file: ${file.path}`, err.message);
      }
    }
  }
};

/**
 * Helper to parse multipart form fields that may arrive as JSON strings
 */
const parseJSONField = (field, fallback = {}) => {
  if (!field) return fallback;
  if (typeof field === "object") return field;
  try {
    return JSON.parse(field);
  } catch (error) {
    return fallback;
  }
};


export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    brand,
    category,
    description,
    regularPrice,
    salePrice,
    stock,
    lowStockThreshold,
    sku,
    isFeatured,
    isActive
  } = req.body;

  // Check required core fields
  if (!title || !brand || !category || !regularPrice || !description) {
    cleanupLocalFiles(req.files);
    throw new ApiError(
      400,
      "Title, brand, category, regularPrice, and description are required"
    );
  }

  // Price validation
  const numRegularPrice = Number(regularPrice);
  const numSalePrice = salePrice !== undefined && salePrice !== "" ? Number(salePrice) : null;

  if (numRegularPrice < 0) {
    cleanupLocalFiles(req.files);
    throw new ApiError(400, "Regular price cannot be negative");
  }

  if (numSalePrice !== null && numSalePrice > numRegularPrice) {
    cleanupLocalFiles(req.files);
    throw new ApiError(
      400,
      "Sale price cannot be greater than the regular price (MRP)"
    );
  }

  const specifications = parseJSONField(req.body.specifications, {});
  const keyFeatures = parseJSONField(req.body.keyFeatures, []);
  const boxContents = parseJSONField(req.body.boxContents, []);
  const warranty = parseJSONField(req.body.warranty, {
    durationMonths: 12,
    claimType: "Manufacturer Warranty"
  });

  // Dynamic Category Specifications Validation Engine
  const specsValidation = validateCategorySpecs(category, specifications);
  if (!specsValidation.isValid) {
    cleanupLocalFiles(req.files);
    throw new ApiError(
      400,
      `Validation Error: Missing required specifications for '${category}': ${specsValidation.missingFields.join(", ")}`
    );
  }

  // Verify at least one image was uploaded
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  // Upload images to Cloudinary in parallel
  let uploadedImages = [];
  try {
    const uploadPromises = req.files.map((file, index) =>
      uploadOnCloudinary(file.path, "electronicsshop/products").then((result) => ({
        url: result.url,
        public_id: result.public_id,
        isPrimary: index === 0 // Mark first image as primary thumbnail by default
      }))
    );

    uploadedImages = await Promise.all(uploadPromises);
  } catch (error) {
    cleanupLocalFiles(req.files);
    throw new ApiError(
      500,
      `Failed to upload product images to Cloudinary: ${error.message}`
    );
  }

  // Generate SKU if not provided
  let finalSku = sku?.trim();
  if (!finalSku) {
    const brandPrefix = brand.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
    const catPrefix = category.slice(0, 3).toUpperCase();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    finalSku = `${brandPrefix}-${catPrefix}-${Date.now().toString().slice(-4)}${randomCode}`;
  }

  try {
    // Create product in MongoDB
    const product = await Product.create({
      title: title.trim(),
      brand: brand.trim(),
      category: category.toLowerCase().trim(),
      sku: finalSku,
      description: description.trim(),
      regularPrice: numRegularPrice,
      salePrice: numSalePrice,
      stock: Number(stock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      images: uploadedImages,
      specifications,
      keyFeatures: Array.isArray(keyFeatures) ? keyFeatures : [],
      boxContents: Array.isArray(boxContents) ? boxContents : [],
      warranty,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isActive: isActive === undefined ? true : isActive === "true" || isActive === true
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, product, "Product created successfully with technical specifications")
      );
  } catch (dbError) {
    console.error("❌ DB Creation failed. Rolling back Cloudinary uploads...");
    for (const img of uploadedImages) {
      if (img.public_id) {
        await deleteFromCloudinary(img.public_id);
      }
    }

    if (dbError.code === 11000) {
      throw new ApiError(409, "A product with this title or SKU already exists");
    }

    throw new ApiError(500, `Database error: ${dbError.message}`);
  }
});


export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStock,
    isFeatured,
    sort,
    page = 1,
    limit = 12
  } = req.query;

  // Build query filter
  const filter = { isActive: true };

  // Full-text search on title, brand, description
  if (search) {
    filter.$text = { $search: search.trim() };
  }

  // Category filter
  if (category) {
    filter.category = category.toLowerCase().trim();
  }

  // Brand filter (Supports comma-separated brands: 'Apple,Samsung')
  if (brand) {
    const brandsArray = brand.split(",").map((b) => new RegExp(`^${b.trim()}$`, "i"));
    filter.brand = { $in: brandsArray };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.regularPrice = {};
    if (minPrice) filter.regularPrice.$gte = Number(minPrice);
    if (maxPrice) filter.regularPrice.$lte = Number(maxPrice);
  }

  // Minimum rating filter
  if (rating) {
    filter.averageRating = { $gte: Number(rating) };
  }

  // In-stock only filter
  if (inStock === "true" || inStock === true) {
    filter.stock = { $gt: 0 };
  }

  // Featured electronics showcase
  if (isFeatured === "true" || isFeatured === true) {
    filter.isFeatured = true;
  }

  // Sorting
  let sortOption = { createdAt: -1 }; // Default: Newest first
  if (sort === "price_asc") sortOption = { regularPrice: 1 };
  if (sort === "price_desc") sortOption = { regularPrice: -1 };
  if (sort === "rating") sortOption = { averageRating: -1 };
  if (sort === "popular") sortOption = { numReviews: -1, averageRating: -1 };

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean({ virtuals: true }),
    Product.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(
        200,
      {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      },
      "Products retrieved successfully"
    )
  );
});



// here we get the single product detials 
export const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  let product = null;

  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    product = await Product.findById(idOrSlug);
  }

  if (!product) {
    product = await Product.findOne({ slug: idOrSlug.toLowerCase() });
  }

  if (!product) {
    throw new ApiError(404, `Product not found with identifier '${idOrSlug}'`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product details fetched successfully"));
});


//update the product by the admin 
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    cleanupLocalFiles(req.files);
    throw new ApiError(404, "Product not found");
  }

  const {
    title,
    brand,
    category,
    description,
    regularPrice,
    salePrice,
    stock,
    lowStockThreshold,
    sku,
    isFeatured,
    isActive
  } = req.body;

  // Basic updates
  if (title) product.title = title.trim();
  if (brand) product.brand = brand.trim();
  if (category) product.category = category.toLowerCase().trim();
  if (description) product.description = description.trim();
  if (sku) product.sku = sku.trim();

  if (regularPrice !== undefined) product.regularPrice = Number(regularPrice);
  if (salePrice !== undefined) {
    product.salePrice = salePrice === "" || salePrice === null ? null : Number(salePrice);
  }
  if (stock !== undefined) product.stock = Number(stock);
  if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);

  if (isFeatured !== undefined) {
    product.isFeatured = isFeatured === "true" || isFeatured === true;
  }
  if (isActive !== undefined) {
    product.isActive = isActive === "true" || isActive === true;
  }

  // Update specs if provided
  if (req.body.specifications) {
    const updatedSpecs = parseJSONField(req.body.specifications, {});
    const targetCategory = product.category;
    const validation = validateCategorySpecs(targetCategory, updatedSpecs);

    if (!validation.isValid) {
      cleanupLocalFiles(req.files);
      throw new ApiError(
        400,
        `Validation Error: Missing required specs for '${targetCategory}': ${validation.missingFields.join(", ")}`
      );
    }
    product.specifications = updatedSpecs;
  }

  if (req.body.keyFeatures) {
    product.keyFeatures = parseJSONField(req.body.keyFeatures, product.keyFeatures);
  }
  if (req.body.boxContents) {
    product.boxContents = parseJSONField(req.body.boxContents, product.boxContents);
  }
  if (req.body.warranty) {
    product.warranty = parseJSONField(req.body.warranty, product.warranty);
  }

  // Handle new image uploads (if admin attached new images)
  if (req.files && req.files.length > 0) {
    try {
      const uploadPromises = req.files.map((file) =>
        uploadOnCloudinary(file.path, "electronicsshop/products").then((res) => ({
          url: res.url,
          public_id: res.public_id,
          isPrimary: false
        }))
      );

      const newImages = await Promise.all(uploadPromises);
      product.images = [...product.images, ...newImages];
    } catch (err) {
      cleanupLocalFiles(req.files);
      throw new ApiError(500, `Failed to upload new images: ${err.message}`);
    }
  }

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});


// delete the product by the admin

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Delete all associated media files from Cloudinary
  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      if (image.public_id) {
        await deleteFromCloudinary(image.public_id);
      }
    }
  }

  await Product.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product and associated media deleted successfully"));
});



export const updateProductStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, mode = "set" } = req.body; 

  if (quantity === undefined || isNaN(Number(quantity))) {
    throw new ApiError(400, "Valid numeric quantity is required");
  }

  const numQty = Number(quantity);

  let updateQuery = {};
  if (mode === "increment") {
    updateQuery = { $inc: { stock: numQty } };
  } else {
    if (numQty < 0) throw new ApiError(400, "Stock cannot be negative");
    updateQuery = { $set: { stock: numQty } };
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updateQuery, {
    new: true,
    runValidators: true
  });

  if (!updatedProduct) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: updatedProduct._id,
        title: updatedProduct.title,
        stock: updatedProduct.stock,
        inStock: updatedProduct.inStock
      },
      "Product inventory updated successfully"
    )
  );
});


// here we get the low stock alerts for the admin 

export const getLowStockAlerts = asyncHandler(async (req, res) => {
  const lowStockProducts = await Product.find({
    $expr: { $lte: ["$stock", "$lowStockThreshold"] }
  })
    .sort({ stock: 1 })
    .select("title brand category sku stock lowStockThreshold images regularPrice");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: lowStockProducts.length,
        products: lowStockProducts
      },
      "Low stock inventory alerts retrieved"
    )
  );
});
