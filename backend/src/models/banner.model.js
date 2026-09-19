import mongoose from "mongoose";

const bannerImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Banner image URL is required"]
    },
    public_id: {
      type: String,
      required: [true, "Cloudinary public_id is required"]
    }
  },
  { _id: false }
);

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true
    },
    subtitle: {
      type: String,
      default: "",
      trim: true
    },
    badgeText: {
      type: String,
      default: "",
      trim: true
    },
    desktopImage: {
      type: bannerImageSchema,
      required: [true, "Desktop banner image is required"]
    },
    mobileImage: {
      type: bannerImageSchema,
      default: null
    },
    linkType: {
      type: String,
      enum: {
        values: ["CATEGORY", "BRAND", "PRODUCT", "CUSTOM_URL"],
        message: "{VALUE} is not a valid link type"
      },
      default: "CUSTOM_URL"
    },
    linkValue: {
      type: String,
      required: [true, "Banner target link or slug is required"],
      trim: true
    },
    position: {
      type: String,
      enum: {
        values: ["HERO_SLIDER", "MIDDLE_STRIP", "SIDEBAR_PROMO"],
        message: "{VALUE} is not a valid banner position"
      },
      default: "HERO_SLIDER",
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Compound index for high performance storefront querying
bannerSchema.index({ position: 1, isActive: 1, displayOrder: 1 });


bannerSchema.statics.findActiveBanners = function (position = "HERO_SLIDER") {
  const now = new Date();
  const query = {
    position,
    isActive: true,
    $and: [
      {
        $or: [{ startDate: null }, { startDate: { $lte: now } }]
      },
      {
        $or: [{ endDate: null }, { endDate: { $gte: now } }]
      }
    ]
  };

  return this.find(query).sort({ displayOrder: 1, createdAt: -1 });
};

export const Banner = mongoose.model("Banner", bannerSchema);
