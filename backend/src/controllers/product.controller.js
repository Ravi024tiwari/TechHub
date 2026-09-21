import fs from "fs";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { Brand } from "../models/brand.model.js";
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
    // Resolve Dynamic Category and Brand references
    let resolvedCategory = category;
    let resolvedCategoryName = typeof category === "string" ? category.toLowerCase().trim() : "";
    let resolvedBrand = brand;
    let resolvedBrandName = typeof brand === "string" ? brand.trim() : "";

    if (mongoose.Types.ObjectId.isValid(category)) {
      const catDoc = await Category.findById(category);
      if (catDoc) {
        resolvedCategory = catDoc._id;
        resolvedCategoryName = catDoc.name;
      }
    } else if (typeof category === "string") {
      const catDoc = await Category.findOne({
        $or: [{ slug: category.toLowerCase().trim() }, { name: new RegExp(`^${category.trim()}$`, "i") }]
      });
      if (catDoc) {
        resolvedCategory = catDoc._id;
        resolvedCategoryName = catDoc.name;
      }
    }

    if (mongoose.Types.ObjectId.isValid(brand)) {
      const brandDoc = await Brand.findById(brand);
      if (brandDoc) {
        resolvedBrand = brandDoc._id;
        resolvedBrandName = brandDoc.name;
      }
    } else if (typeof brand === "string") {
      const brandDoc = await Brand.findOne({
        $or: [{ slug: brand.toLowerCase().trim() }, { name: new RegExp(`^${brand.trim()}$`, "i") }]
      });
      if (brandDoc) {
        resolvedBrand = brandDoc._id;
        resolvedBrandName = brandDoc.name;
      }
    }

    // Create product in MongoDB
    const product = await Product.create({
      title: title.trim(),
      brand: resolvedBrand,
      brandName: resolvedBrandName,
      category: resolvedCategory,
      categoryName: resolvedCategoryName,
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

  // Build query filter (defaults to active products for public storefront, allows all for admin)
  const filter = {};
  if (req.query.includeInactive === "true" || req.query.all === "true") {
    if (req.query.status === "active") filter.isActive = true;
    else if (req.query.status === "inactive") filter.isActive = false;
  } else if (req.query.status === "inactive") {
    filter.isActive = false;
  } else {
    filter.isActive = true;
  }

  // Hybrid Search: matches title, brand, description, tags, or processor
  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [
      { title: searchRegex },
      { brand: searchRegex },
      { description: searchRegex },
      { keyFeatures: searchRegex },
      { "specifications.processor": searchRegex }
    ];
  }

  // Category filter (supports comma-separated slugs, names, or ObjectIds)
  if (category) {
    const rawCategories = category.split(",").map((c) => c.trim()).filter(Boolean);
    const categoryConditions = [];

    for (const cat of rawCategories) {
      if (mongoose.Types.ObjectId.isValid(cat)) {
        categoryConditions.push({ category: new mongoose.Types.ObjectId(cat) });
      } else {
        const catDoc = await Category.findOne({
          $or: [
            { slug: cat.toLowerCase() },
            { name: new RegExp(`^${cat}$`, "i") }
          ]
        });
        if (catDoc) {
          categoryConditions.push({ category: catDoc._id });
        }
        categoryConditions.push({ category: cat.toLowerCase() });
        categoryConditions.push({ categoryName: new RegExp(`^${cat}$`, "i") });
      }
    }

    if (categoryConditions.length > 0) {
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: categoryConditions });
    }
  }

  // Dynamic Electronics Specifications Filters
  if (req.query.ram) {
    filter["specifications.ram"] = new RegExp(`^${req.query.ram.trim()}$`, "i");
  }
  if (req.query.storage) {
    filter["specifications.storage"] = new RegExp(`^${req.query.storage.trim()}$`, "i");
  }
  if (req.query.processor) {
    filter["specifications.processor"] = new RegExp(req.query.processor.trim(), "i");
  }
  if (req.query.wattage) {
    filter["specifications.wattage"] = new RegExp(req.query.wattage.trim(), "i");
  }

  // Color variant filter (supports comma-separated color names)
  if (req.query.color) {
    const colorsArray = req.query.color.split(",").map((c) => new RegExp(`^${c.trim()}$`, "i"));
    filter["colors.colorName"] = { $in: colorsArray };
  }

  // Brand filter (supports comma-separated slugs, names, or ObjectIds)
  if (brand) {
    const rawBrands = brand.split(",").map((b) => b.trim()).filter(Boolean);
    const brandConditions = [];

    for (const b of rawBrands) {
      if (mongoose.Types.ObjectId.isValid(b)) {
        brandConditions.push({ brand: new mongoose.Types.ObjectId(b) });
      } else {
        const brandDoc = await Brand.findOne({
          $or: [
            { slug: b.toLowerCase() },
            { name: new RegExp(`^${b}$`, "i") }
          ]
        });
        if (brandDoc) {
          brandConditions.push({ brand: brandDoc._id });
        }
        brandConditions.push({ brand: new RegExp(`^${b}$`, "i") });
        brandConditions.push({ brandName: new RegExp(`^${b}$`, "i") });
      }
    }

    if (brandConditions.length > 0) {
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: brandConditions });
    }
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

  // Out of stock filter
  if (req.query.outOfStock === "true" || req.query.outOfStock === true) {
    filter.stock = { $lte: 0 };
  } else if (req.query.maxStock !== undefined && req.query.maxStock !== "") {
    filter.stock = { $lte: Number(req.query.maxStock) };
  } else if (req.query.lowStock === "true" || req.query.lowStock === true) {
    filter.stock = { $gt: 0, $lte: 5 };
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
  if (sort === "stock_asc" || (req.query.maxStock && !sort) || (req.query.lowStock && !sort)) {
    sortOption = { stock: 1, createdAt: -1 };
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug icon")
      .populate("brand", "name slug logo")
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
    product = await Product.findById(idOrSlug)
      .populate("category", "name slug icon specificationsTemplate parent")
      .populate("brand", "name slug logo website");
  }

  if (!product) {
    product = await Product.findOne({ slug: idOrSlug.toLowerCase() })
      .populate("category", "name slug icon specificationsTemplate parent")
      .populate("brand", "name slug logo website");
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

/**
 * @desc    Live Search / Typeahead Auto-Suggestions (Optimized for Debounced Search Bars)
 * @route   GET /api/v1/products/search/suggestions
 * @access  Public
 */
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const q = req.query.q || req.query.query || req.query.search;

  if (!q || q.trim().length < 1) {
    return res.status(200).json(
      new ApiResponse(200, [], "Query too short for suggestions")
    );
  }

  const searchRegex = new RegExp(q.trim(), "i");

  // Lightweight projection for fast response and minimal DB load
  const suggestions = await Product.find({
    isActive: true,
    $or: [{ title: searchRegex }, { brand: searchRegex }]
  })
    .select("title slug brand category salePrice regularPrice images averageRating")
    .limit(8)
    .lean({ virtuals: true });

  return res.status(200).json(
    new ApiResponse(200, suggestions, "Search suggestions retrieved")
  );
});

/**
 * @desc    Get Filter Facets & Metadata (Enriched Categories, Brands, Price Range, Specs, and Colors)
 * @route   GET /api/v1/products/filters/meta and GET /api/v1/products/filters
 * @access  Public
 */
export const getFilterMetadata = asyncHandler(async (req, res) => {
  const { category, brand, search } = req.query;

  const matchFilter = { isActive: true };

  // Contextual Search query scoping
  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    matchFilter.$or = [
      { title: searchRegex },
      { brand: searchRegex },
      { description: searchRegex },
      { keyFeatures: searchRegex },
      { "specifications.processor": searchRegex }
    ];
  }

  // Contextual Category scoping
  if (category) {
    const rawCategories = category.split(",").map((c) => c.trim()).filter(Boolean);
    const categoryConditions = [];
    for (const cat of rawCategories) {
      if (mongoose.Types.ObjectId.isValid(cat)) {
        categoryConditions.push({ category: new mongoose.Types.ObjectId(cat) });
      } else {
        const catDoc = await Category.findOne({
          $or: [{ slug: cat.toLowerCase() }, { name: new RegExp(`^${cat}$`, "i") }]
        });
        if (catDoc) categoryConditions.push({ category: catDoc._id });
        categoryConditions.push({ category: cat.toLowerCase() });
        categoryConditions.push({ categoryName: new RegExp(`^${cat}$`, "i") });
      }
    }
    if (categoryConditions.length > 0) {
      matchFilter.$and = matchFilter.$and || [];
      matchFilter.$and.push({ $or: categoryConditions });
    }
  }

  // Contextual Brand scoping
  if (brand) {
    const rawBrands = brand.split(",").map((b) => b.trim()).filter(Boolean);
    const brandConditions = [];
    for (const b of rawBrands) {
      if (mongoose.Types.ObjectId.isValid(b)) {
        brandConditions.push({ brand: new mongoose.Types.ObjectId(b) });
      } else {
        const brandDoc = await Brand.findOne({
          $or: [{ slug: b.toLowerCase() }, { name: new RegExp(`^${b}$`, "i") }]
        });
        if (brandDoc) brandConditions.push({ brand: brandDoc._id });
        brandConditions.push({ brand: new RegExp(`^${b}$`, "i") });
        brandConditions.push({ brandName: new RegExp(`^${b}$`, "i") });
      }
    }
    if (brandConditions.length > 0) {
      matchFilter.$and = matchFilter.$and || [];
      matchFilter.$and.push({ $or: brandConditions });
    }
  }

  const [metadata] = await Product.aggregate([
    { $match: matchFilter },
    {
      $facet: {
        rawBrands: [
          { $group: { _id: "$brand", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        rawCategories: [
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        priceRange: [
          {
            $group: {
              _id: null,
              minPrice: { $min: "$regularPrice" },
              maxPrice: { $max: "$regularPrice" }
            }
          }
        ],
        rams: [
          { $match: { "specifications.ram": { $exists: true, $ne: "" } } },
          { $group: { _id: "$specifications.ram", count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ],
        storages: [
          { $match: { "specifications.storage": { $exists: true, $ne: "" } } },
          { $group: { _id: "$specifications.storage", count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ],
        processors: [
          { $match: { "specifications.processor": { $exists: true, $ne: "" } } },
          { $group: { _id: "$specifications.processor", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        colors: [
          { $unwind: "$colors" },
          {
            $group: {
              _id: {
                colorName: "$colors.colorName",
                colorCode: "$colors.colorCode"
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]
      }
    }
  ]);

  // Enrich Brands with relational document info
  const rawBrandList = metadata?.rawBrands || [];
  const brandObjectIds = rawBrandList
    .filter((b) => b._id && mongoose.Types.ObjectId.isValid(b._id))
    .map((b) => b._id);
  const brandNames = rawBrandList
    .filter((b) => b._id && !mongoose.Types.ObjectId.isValid(b._id))
    .map((b) => b._id);

  const brandDocs = await Brand.find({
    $or: [{ _id: { $in: brandObjectIds } }, { name: { $in: brandNames } }]
  }).select("name slug logo");

  const brandDocMap = {};
  for (const doc of brandDocs) {
    brandDocMap[doc._id.toString()] = doc;
    brandDocMap[doc.name.toLowerCase()] = doc;
    brandDocMap[doc.slug.toLowerCase()] = doc;
  }

  const enrichedBrands = rawBrandList.map((item) => {
    const key = item._id ? item._id.toString() : "";
    const matchedDoc = brandDocMap[key] || brandDocMap[key.toLowerCase()];
    return {
      _id: matchedDoc?._id || item._id,
      name: matchedDoc?.name || item._id,
      slug: matchedDoc?.slug || (typeof item._id === "string" ? item._id.toLowerCase() : ""),
      logo: matchedDoc?.logo?.url || null,
      count: item.count
    };
  });

  // Enrich Categories with relational document info
  const rawCatList = metadata?.rawCategories || [];
  const catObjectIds = rawCatList
    .filter((c) => c._id && mongoose.Types.ObjectId.isValid(c._id))
    .map((c) => c._id);
  const catSlugs = rawCatList
    .filter((c) => c._id && !mongoose.Types.ObjectId.isValid(c._id))
    .map((c) => c._id);

  const catDocs = await Category.find({
    $or: [
      { _id: { $in: catObjectIds } },
      { slug: { $in: catSlugs } },
      { name: { $in: catSlugs } }
    ]
  }).select("name slug icon");

  const catDocMap = {};
  for (const doc of catDocs) {
    catDocMap[doc._id.toString()] = doc;
    catDocMap[doc.slug.toLowerCase()] = doc;
    catDocMap[doc.name.toLowerCase()] = doc;
  }

  const enrichedCategories = rawCatList.map((item) => {
    const key = item._id ? item._id.toString() : "";
    const matchedDoc = catDocMap[key] || catDocMap[key.toLowerCase()];
    return {
      _id: matchedDoc?._id || item._id,
      name: matchedDoc?.name || item._id,
      slug: matchedDoc?.slug || (typeof item._id === "string" ? item._id.toLowerCase() : ""),
      icon: matchedDoc?.icon?.url || null,
      count: item.count
    };
  });

  // Format Colors
  const formattedColors = (metadata?.colors || []).map((c) => ({
    colorName: c._id?.colorName || "",
    colorCode: c._id?.colorCode || "",
    count: c.count
  }));

  // Format Dynamic Specifications
  const availableSpecs = {
    ram: (metadata?.rams || []).map((r) => r._id),
    storage: (metadata?.storages || []).map((s) => s._id),
    processors: (metadata?.processors || []).map((p) => p._id)
  };

  const priceRange = metadata?.priceRange?.[0]
    ? {
        minPrice: metadata.priceRange[0].minPrice || 0,
        maxPrice: metadata.priceRange[0].maxPrice || 0
      }
    : { minPrice: 0, maxPrice: 0 };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        categories: enrichedCategories,
        brands: enrichedBrands,
        priceRange,
        availableSpecs,
        colors: formattedColors
      },
      "Filter facets metadata retrieved successfully"
    )
  );
});

// ==========================================
// COLOR VARIANTS MANAGEMENT (OPTION B)
// ==========================================

const HEX_COLOR_REGEX = /^#([0-9A-F]{3}){1,2}$/i;

/**
 * @desc    Add a new color variant with its own images and stock to a product
 * @route   POST /api/v1/products/:id/colors
 * @access  Private (Admin only)
 */
export const addColorVariant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    colorName,
    colorCode,
    stock = 0,
    sku,
    priceOverride,
    isDefault = false
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    cleanupLocalFiles(req.files);
    throw new ApiError(400, "Invalid product ID format");
  }

  if (!colorName || !colorName.trim()) {
    cleanupLocalFiles(req.files);
    throw new ApiError(400, "Color name is required (e.g. 'Space Gray', 'Midnight Blue')");
  }

  if (!colorCode || !HEX_COLOR_REGEX.test(colorCode.trim())) {
    cleanupLocalFiles(req.files);
    throw new ApiError(400, "Valid Hex color code is required (e.g. '#1C2A39', '#FFFFFF')");
  }

  const product = await Product.findById(id);
  if (!product) {
    cleanupLocalFiles(req.files);
    throw new ApiError(404, "Product not found");
  }

  // Prevent duplicate color names on the same product
  const existingColor = (product.colors || []).find(
    (c) => c.colorName.toLowerCase() === colorName.trim().toLowerCase()
  );
  if (existingColor) {
    cleanupLocalFiles(req.files);
    throw new ApiError(400, `Color variant '${colorName}' already exists on this product`);
  }

  // Upload color-specific images to Cloudinary
  let variantImages = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    try {
      const uploadPromises = req.files.map((file, index) =>
        uploadOnCloudinary(file.path, "electronicsshop/products/variants").then((res) => ({
          url: res.url,
          public_id: res.public_id,
          isPrimary: index === 0
        }))
      );
      variantImages = await Promise.all(uploadPromises);
    } catch (uploadErr) {
      cleanupLocalFiles(req.files);
      throw new ApiError(500, `Failed to upload color variant images: ${uploadErr.message}`);
    }
  }

  // Generate variant SKU if not provided
  let variantSku = sku?.trim();
  if (!variantSku) {
    const colorCodeClean = colorName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
    variantSku = `${product.sku}-${colorCodeClean}`;
  }

  const shouldBeDefault =
    product.colors.length === 0 ? true : Boolean(isDefault === true || isDefault === "true");

  if (shouldBeDefault) {
    product.colors.forEach((c) => {
      c.isDefault = false;
    });
  }

  const numStock = Math.max(0, Number(stock) || 0);
  const numPriceOverride =
    priceOverride !== undefined && priceOverride !== "" ? Number(priceOverride) : null;

  product.colors.push({
    colorName: colorName.trim(),
    colorCode: colorCode.trim(),
    images: variantImages,
    stock: numStock,
    sku: variantSku,
    priceOverride: numPriceOverride,
    isDefault: shouldBeDefault
  });

  // Re-sync overall product stock with sum of all variant stocks
  product.stock = product.colors.reduce((sum, c) => sum + (c.stock || 0), 0);

  await product.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      product,
      `Color variant '${colorName}' added successfully to product`
    )
  );
});

/**
 * @desc    Update an existing color variant on a product
 * @route   PUT /api/v1/products/:id/colors/:colorId
 * @access  Private (Admin only)
 */
export const updateColorVariant = asyncHandler(async (req, res) => {
  const { id, colorId } = req.params;
  const {
    colorName,
    colorCode,
    stock,
    sku,
    priceOverride,
    isDefault
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(colorId)) {
    cleanupLocalFiles(req.files);
    throw new ApiError(400, "Invalid product ID or color variant ID format");
  }

  const product = await Product.findById(id);
  if (!product) {
    cleanupLocalFiles(req.files);
    throw new ApiError(404, "Product not found");
  }

  const variant = product.colors.id(colorId);
  if (!variant) {
    cleanupLocalFiles(req.files);
    throw new ApiError(404, "Color variant not found on this product");
  }

  if (colorName !== undefined) {
    const trimmed = colorName.trim();
    if (!trimmed) throw new ApiError(400, "Color name cannot be empty");
    variant.colorName = trimmed;
  }

  if (colorCode !== undefined) {
    const trimmedHex = colorCode.trim();
    if (!HEX_COLOR_REGEX.test(trimmedHex)) {
      throw new ApiError(400, "Valid Hex color code is required");
    }
    variant.colorCode = trimmedHex;
  }

  if (stock !== undefined) {
    variant.stock = Math.max(0, Number(stock) || 0);
  }

  if (sku !== undefined) {
    variant.sku = sku.trim();
  }

  if (priceOverride !== undefined) {
    variant.priceOverride = priceOverride === null || priceOverride === "" ? null : Number(priceOverride);
  }

  if (isDefault === true || isDefault === "true") {
    product.colors.forEach((c) => {
      c.isDefault = c._id.toString() === colorId.toString();
    });
  }

  // If new images uploaded, append them to this variant's image gallery
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    try {
      const uploadPromises = req.files.map((file) =>
        uploadOnCloudinary(file.path, "electronicsshop/products/variants").then((res) => ({
          url: res.url,
          public_id: res.public_id,
          isPrimary: false
        }))
      );
      const newImages = await Promise.all(uploadPromises);
      variant.images.push(...newImages);
    } catch (uploadErr) {
      cleanupLocalFiles(req.files);
      throw new ApiError(500, `Failed to upload new variant images: ${uploadErr.message}`);
    }
  }

  // Recalculate total product stock
  product.stock = product.colors.reduce((sum, c) => sum + (c.stock || 0), 0);

  await product.save();

  return res.status(200).json(
    new ApiResponse(200, product, "Color variant updated successfully")
  );
});

/**
 * @desc    Delete a color variant and clean up its Cloudinary images
 * @route   DELETE /api/v1/products/:id/colors/:colorId
 * @access  Private (Admin only)
 */
export const deleteColorVariant = asyncHandler(async (req, res) => {
  const { id, colorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(colorId)) {
    throw new ApiError(400, "Invalid product ID or color variant ID format");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const variant = product.colors.id(colorId);
  if (!variant) {
    throw new ApiError(404, "Color variant not found on this product");
  }

  const wasDefault = variant.isDefault;

  // Clean up all Cloudinary assets associated with this variant
  for (const img of variant.images || []) {
    if (img.public_id) {
      await deleteFromCloudinary(img.public_id);
    }
  }

  // Remove subdocument
  product.colors.pull({ _id: colorId });

  // If deleted variant was default and remaining variants exist, promote the first remaining
  if (wasDefault && product.colors.length > 0) {
    product.colors[0].isDefault = true;
  }

  // Recalculate total product stock
  product.stock = product.colors.reduce((sum, c) => sum + (c.stock || 0), 0);

  await product.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deletedVariantId: colorId,
        remainingVariantsCount: product.colors.length,
        product
      },
      "Color variant deleted successfully"
    )
  );
});
