import mongoose from "mongoose";
import slugify from "slugify";

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"]
    },
    public_id: {
      type: String,
      required: [true, "Cloudinary public_id is required"]
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const colorVariantSchema = new mongoose.Schema(
  {
    colorName: {
      type: String,
      required: [true, "Color name is required"],
      trim: true
    },
    colorCode: {
      type: String,
      required: [true, "Hex color code is required for UI swatch"],
      trim: true
    },
    images: {
      type: [productImageSchema],
      default: []
    },
    stock: {
      type: Number,
      required: [true, "Variant stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true
    },
    priceOverride: {
      type: Number,
      default: null,
      min: [0, "Price override cannot be negative"]
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { _id: true, timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [180, "Title cannot exceed 180 characters"],
      index: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    brand: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Brand",
      required: [true, "Product brand is required"],
      index: true
    },
    brandName: {
      type: String,
      trim: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Category",
      required: [true, "Product category is required"],
      index: true
    },
    categoryName: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    sku: {
      type: String,
      required: [true, "SKU (Stock Keeping Unit) is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true
    },
    regularPrice: {
      type: Number,
      required: [true, "Regular price is required"],
      min: [0, "Price cannot be negative"]
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
      default: null,
      validate: {
        validator: function (value) {
          if (value === null || value === undefined) return true;
          return value <= this.regularPrice;
        },
        message: "Sale price must be less than or equal to regular price"
      }
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, "Low stock threshold cannot be negative"]
    },
    images: {
      type: [productImageSchema],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: "At least one product image is required"
      }
    },
    // Dynamic Category Specifications (Key-Value Map adapted per electronics category)
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    // Quick highlights/badges (e.g., "Snapdragon 8 Gen 3", "120Hz AMOLED", "65W GaN")
    keyFeatures: {
      type: [String],
      default: []
    },
    // Standard warranty terms
    warranty: {
      durationMonths: {
        type: Number,
        default: 12,
        min: 0
      },
      claimType: {
        type: String,
        default: "Manufacturer Warranty",
        trim: true
      }
    },
    // Items included in the product box
    boxContents: {
      type: [String],
      default: []
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
      set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal place (e.g. 4.5)
      index: true
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    // Multiple Color Variants with dedicated images and inventory
    colors: [colorVariantSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// its fetch the discount % of that product
productSchema.virtual("discountPercentage").get(function () {
  if (this.salePrice && this.salePrice < this.regularPrice) {
    return Math.round(((this.regularPrice - this.salePrice) / this.regularPrice) * 100);
  }
  return 0;
});

// Virtual for stock availability
productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

// Virtual for primary image helper
productSchema.virtual("thumbnail").get(function () {
  if (!this.images || this.images.length === 0) {
    const firstColorImage = this.colors?.find((c) => c.images?.length > 0)?.images?.[0]?.url;
    return firstColorImage || "";
  }
  const primary = this.images.find((img) => img.isPrimary);
  return primary ? primary.url : this.images[0].url;
});

// Virtual for variant check
productSchema.virtual("hasVariants").get(function () {
  return Array.isArray(this.colors) && this.colors.length > 0;
});

// Virtual for active default color variant
productSchema.virtual("defaultColor").get(function () {
  if (!this.colors || this.colors.length === 0) return null;
  return this.colors.find((c) => c.isDefault) || this.colors[0];
});


// Auto-generate SEO slug before validation
productSchema.pre("validate", function (next) {
  if (this.title && (this.isModified("title") || !this.slug)) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true
    });
  }
  next();
});

// Production Indexes for Instant Searching, Catalog Filtering, and Admin Sorting
productSchema.index({
  title: "text",
  brand: "text",
  description: "text",
  keyFeatures: "text"
}); // Full-text search index for customer search bar

productSchema.index({ category: 1, brand: 1, salePrice: 1 }); // Catalog faceted filtering
productSchema.index({ category: 1, averageRating: -1 }); // Top-rated by category
productSchema.index({ isActive: 1, createdAt: -1 }); // New arrivals listing
productSchema.index({ stock: 1, lowStockThreshold: 1 }); // Admin low-stock inventory alerts

export const Product = mongoose.model("Product", productSchema);
