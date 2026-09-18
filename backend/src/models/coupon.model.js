import mongoose from "mongoose";

const couponUsageRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    usedCount: {
      type: Number,
      default: 1,
      min: 1
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters long"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
      index: true
    },
    description: {
      type: String,
      required: [true, "Coupon description is required"],
      trim: true,
      maxlength: [250, "Description cannot exceed 250 characters"]
    },
    discountType: {
      type: String,
      enum: {
        values: ["PERCENTAGE", "FLAT"],
        message: "Discount type must be either PERCENTAGE or FLAT"
      },
      required: [true, "Discount type is required"],
      default: "PERCENTAGE"
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [1, "Discount value must be greater than 0"],
      validate: {
        validator: function (value) {
          if (this.discountType === "PERCENTAGE") {
            return value > 0 && value <= 100;
          }
          return value > 0;
        },
        message: "Percentage discount must be between 1 and 100"
      }
    },
    // Upper cap for percentage discounts (e.g. 10% off up to ₹1,000)
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: [0, "Maximum discount amount cannot be negative"]
    },
    // Minimum cart subtotal required to qualify
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value cannot be negative"]
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
      index: true,
      validate: {
        validator: function (value) {
          return !this.startDate || value > this.startDate;
        },
        message: "Expiry date must be after the start date"
      }
    },
    // Total global usage limit across the entire store (null = unlimited)
    usageLimit: {
      type: Number,
      default: null,
      min: [1, "Usage limit must be at least 1"]
    },
    // Total redemptions so far
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    // Max redemptions allowed per individual customer
    usageLimitPerUser: {
      type: Number,
      default: 1,
      min: [1, "Per-user usage limit must be at least 1"]
    },
    // Track each user's redemption count
    usersUsed: [couponUsageRecordSchema],
    // Optional category restrictions (empty means applicable store-wide)
    applicableCategories: {
      type: [String],
      lowercase: true,
      trim: true,
      default: []
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

// Production indexes for rapid validation and promo listings
couponSchema.index({ isActive: 1, expiryDate: 1, startDate: 1 });
couponSchema.index({ code: 1, isActive: 1 });



couponSchema.methods.validateCouponEligibility = function (userId, cartSubtotal) {
  const now = new Date();

  if (!this.isActive) {
    return { valid: false, message: "This coupon is currently inactive" };
  }

  if (this.startDate && now < this.startDate) {
    return { valid: false, message: "This coupon campaign has not started yet" };
  }

  if (this.expiryDate && now > this.expiryDate) {
    return { valid: false, message: "This coupon has expired" };
  }

  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: "This coupon has reached its total usage limit" };
  }

  if (cartSubtotal < this.minOrderValue) {
    return {
      valid: false,
      message: `Minimum order value of ₹${this.minOrderValue.toLocaleString("en-IN")} required to use this coupon`
    };
  }

  if (userId) {
    const userRecord = this.usersUsed.find(
      (record) => record.user.toString() === userId.toString()
    );

    if (userRecord && userRecord.usedCount >= this.usageLimitPerUser) {
      return {
        valid: false,
        message: `You have already used this coupon the maximum allowed times (${this.usageLimitPerUser})`
      };
    }
  }

  return { valid: true };
};

/**
 * Calculate the exact discount amount in rupees
 */
couponSchema.methods.calculateDiscount = function (subtotal) {
  if (subtotal <= 0) return 0;

  let calculatedDiscount = 0;

  if (this.discountType === "PERCENTAGE") {
    calculatedDiscount = Math.round((subtotal * this.discountValue) / 100);
    if (this.maxDiscountAmount && calculatedDiscount > this.maxDiscountAmount) {
      calculatedDiscount = this.maxDiscountAmount;
    }
  } else {
    // FLAT discount
    calculatedDiscount = this.discountValue;
  }

  // Discount cannot exceed the subtotal itself
  return Math.min(calculatedDiscount, subtotal);
};

export const Coupon = mongoose.model("Coupon", couponSchema);
