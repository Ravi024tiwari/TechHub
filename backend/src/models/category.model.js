import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [60, "Category name cannot exceed 60 characters"],
      index: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    icon: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" }
    },
    banner: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" }
    },
    // Self-referencing: null indicates a Root/Parent category, ObjectId indicates Subcategory
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true
    },
    // Dynamic specifications schema template (e.g., ["RAM", "Storage", "Processor", "GPU"])
    specificationsTemplate: {
      type: [String],
      default: []
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for child subcategories
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent"
});

// Auto-generate SEO slug before validation
categorySchema.pre("validate", function () {
  if (this.name && (this.isModified("name") || !this.slug)) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true
    });
  }
});

export const Category = mongoose.model("Category", categorySchema);
