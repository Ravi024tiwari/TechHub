import mongoose from "mongoose";
import slugify from "slugify";

const flashDealProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"]
    },
    dealPrice: {
      type: Number,
      required: [true, "Deal price is required"],
      min: [0, "Deal price cannot be negative"]
    },
    dealStock: {
      type: Number,
      required: [true, "Allocated deal stock is required"],
      min: [1, "Deal stock must be at least 1 unit"]
    },
    claimedCount: {
      type: Number,
      default: 0,
      min: [0, "Claimed count cannot be negative"]
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  { _id: true }
);

const flashDealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Flash deal title is required"],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    bannerImage: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" }
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"]
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"]
    },
    status: {
      type: String,
      enum: {
        values: ["DRAFT", "ACTIVE", "PAUSED", "ENDED"],
        message: "{VALUE} is not a valid flash deal status"
      },
      default: "ACTIVE",
      index: true
    },
    products: [flashDealProductSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Slugify title before validation
flashDealSchema.pre("validate", function () {
  if (this.isModified("title") && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

// Computed dynamic status
flashDealSchema.virtual("computedStatus").get(function () {
  const now = new Date();
  if (this.status === "DRAFT" || this.status === "PAUSED" || this.status === "ENDED") {
    return this.status;
  }
  if (now < this.startTime) {
    return "UPCOMING";
  }
  if (now >= this.startTime && now <= this.endTime) {
    return "ACTIVE";
  }
  return "EXPIRED";
});

// Real-time live boolean indicator
flashDealSchema.virtual("isLive").get(function () {
  const now = new Date();
  return (
    this.status === "ACTIVE" &&
    now >= this.startTime &&
    now <= this.endTime
  );
});

// Milliseconds remaining for countdown timer
flashDealSchema.virtual("remainingTimeMs").get(function () {
  const now = new Date();
  if (now > this.endTime) return 0;
  return Math.max(0, this.endTime.getTime() - now.getTime());
});

// Index for high performance scheduling lookups
flashDealSchema.index({ status: 1, startTime: 1, endTime: 1 });

export const FlashDeal = mongoose.model("FlashDeal", flashDealSchema);
