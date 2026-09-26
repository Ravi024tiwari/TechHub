import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { addressSchema } from "./address.schema.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [60, "Name cannot exceed 60 characters"],
      index: true
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address"
      ],
      index: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false // Excluded by default from database queries for security
    },
    role: {
      type: String,
      enum: {
        values: ["customer", "admin"],
        message: "Role must be either customer or admin"
      },
      default: "customer",
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    avatar: {
      url: {
        type: String,
        default: ""
      },
      public_id: {
        type: String,
        default: ""
      }
    },
    addresses: [addressSchema],
    isBlocked: {
      type: Boolean,
      default: false
    },
    refreshToken: {
      type: String,
      select: false
    },
    passwordChangedAt: {
      type: Date
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    loyalty: {
      tier: {
        type: String,
        enum: ["BRONZE", "SILVER", "GOLD", "TITANIUM"],
        default: "BRONZE",
        index: true
      },
      lifetimeSpent: {
        type: Number,
        default: 0,
        min: 0
      },
      loyaltyPoints: {
        type: Number,
        default: 0,
        min: 0
      },
      tierAchievedAt: {
        type: Date,
        default: Date.now
      }
    },
    badges: [
      {
        code: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: "" },
        badgeColor: { type: String, default: "emerald" },
        badgeIcon: { type: String, default: "award" },
        category: {
          type: String,
          enum: ["TIER", "PURCHASE", "ENGAGEMENT", "SPECIAL"],
          default: "SPECIAL"
        },
        awardedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.index({ name: "text", email: "text" }); 
userSchema.index({ role: 1, createdAt: -1 }); 



userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});


userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
      name: this.name
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
    }
  );
};


userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
    }
  );
};


userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// ==========================================
// Production-Grade VIP Loyalty & Badges Engine
// ==========================================

export const LOYALTY_TIERS = {
  BRONZE: {
    key: "BRONZE",
    name: "Bronze Member",
    minSpend: 0,
    targetSpend: 25000,
    nextTier: "Silver VIP",
    badgeColor: "slate",
    badgeIcon: "shield",
    pointsMultiplier: 1.0,
    benefits: [
      "Earn 1x Rewards Points on all purchases",
      "Standard order tracking & customer support",
      "Member-only flash sale notifications"
    ]
  },
  SILVER: {
    key: "SILVER",
    name: "Silver VIP",
    minSpend: 25000,
    targetSpend: 75000,
    nextTier: "Gold VIP",
    badgeColor: "sky",
    badgeIcon: "star",
    pointsMultiplier: 1.25,
    benefits: [
      "Earn 1.25x Rewards Points on all purchases",
      "Free Express Delivery on orders > ₹999",
      "Priority Email & Chat Support desk",
      "Early 2-hour access to Flash Deals"
    ]
  },
  GOLD: {
    key: "GOLD",
    name: "Gold VIP",
    minSpend: 75000,
    targetSpend: 150000,
    nextTier: "Titanium Elite",
    badgeColor: "amber",
    badgeIcon: "crown",
    pointsMultiplier: 1.5,
    benefits: [
      "Earn 1.5x Rewards Points on all purchases",
      "Guaranteed Free Express Shipping on all orders",
      "5% Extra VIP Member Discount at checkout",
      "Priority replacement coverage within 48 hours",
      "Direct 24/7 VIP Phone & WhatsApp Support"
    ]
  },
  TITANIUM: {
    key: "TITANIUM",
    name: "Titanium Elite",
    minSpend: 150000,
    targetSpend: 150000,
    nextTier: "Max Tier Achieved",
    badgeColor: "purple",
    badgeIcon: "gem",
    pointsMultiplier: 2.0,
    benefits: [
      "Earn 2.0x Double Points on all orders",
      "Dedicated Personal Tech Concierge",
      "Zero-questions-asked instant hardware replacement",
      "Free annual device health-check & accessory kits",
      "VIP invitations to exclusive flagship product launches"
    ]
  }
};

export const SYSTEM_BADGES = {
  FIRST_ORDER: {
    code: "FIRST_ORDER",
    title: "First Order Milestone",
    description: "Welcome to the family! Placed your first order.",
    badgeColor: "emerald",
    badgeIcon: "package",
    category: "PURCHASE"
  },
  LOYAL_SHOPPER: {
    code: "LOYAL_SHOPPER",
    title: "Frequent Shopper",
    description: "Placed 5 or more orders with TechHub.",
    badgeColor: "blue",
    badgeIcon: "repeat",
    category: "PURCHASE"
  },
  TECH_ENTHUSIAST: {
    code: "TECH_ENTHUSIAST",
    title: "Tech Connoisseur",
    description: "Unlocked Silver VIP or higher in our electronics store.",
    badgeColor: "violet",
    badgeIcon: "cpu",
    category: "TIER"
  },
  TITANIUM_LEGEND: {
    code: "TITANIUM_LEGEND",
    title: "Titanium Legend",
    description: "Reached our most prestigious Titanium Elite status.",
    badgeColor: "purple",
    badgeIcon: "award",
    category: "TIER"
  }
};

/**
 * Production-grade static helper: Computes tier, progression, badges, and perks given spend and points.
 * Callable on both User model and User instance without code duplication.
 */
userSchema.statics.computeLoyaltyTier = function (spent = 0, currentPoints = 0) {
  const roundedSpent = Math.round(Number(spent || 0) * 100) / 100;

  let tierKey = "BRONZE";
  if (roundedSpent >= LOYALTY_TIERS.TITANIUM.minSpend) {
    tierKey = "TITANIUM";
  } else if (roundedSpent >= LOYALTY_TIERS.GOLD.minSpend) {
    tierKey = "GOLD";
  } else if (roundedSpent >= LOYALTY_TIERS.SILVER.minSpend) {
    tierKey = "SILVER";
  } else {
    tierKey = "BRONZE";
  }

  const currentTierConfig = LOYALTY_TIERS[tierKey];
  let progressToNextTier = 100;
  let amountNeededForNextTier = 0;
  let nextTierDisplay = "Max Tier Achieved";

  if (tierKey === "BRONZE") {
    nextTierDisplay = `Silver VIP (₹${LOYALTY_TIERS.SILVER.minSpend.toLocaleString("en-IN")})`;
    progressToNextTier = Math.min(
      100,
      Math.round((roundedSpent / LOYALTY_TIERS.SILVER.minSpend) * 100)
    );
    amountNeededForNextTier = Math.max(0, LOYALTY_TIERS.SILVER.minSpend - roundedSpent);
  } else if (tierKey === "SILVER") {
    nextTierDisplay = `Gold VIP (₹${LOYALTY_TIERS.GOLD.minSpend.toLocaleString("en-IN")})`;
    const range = LOYALTY_TIERS.GOLD.minSpend - LOYALTY_TIERS.SILVER.minSpend;
    progressToNextTier = Math.min(
      100,
      Math.round(((roundedSpent - LOYALTY_TIERS.SILVER.minSpend) / range) * 100)
    );
    amountNeededForNextTier = Math.max(0, LOYALTY_TIERS.GOLD.minSpend - roundedSpent);
  } else if (tierKey === "GOLD") {
    nextTierDisplay = `Titanium Elite (₹${LOYALTY_TIERS.TITANIUM.minSpend.toLocaleString("en-IN")})`;
    const range = LOYALTY_TIERS.TITANIUM.minSpend - LOYALTY_TIERS.GOLD.minSpend;
    progressToNextTier = Math.min(
      100,
      Math.round(((roundedSpent - LOYALTY_TIERS.GOLD.minSpend) / range) * 100)
    );
    amountNeededForNextTier = Math.max(0, LOYALTY_TIERS.TITANIUM.minSpend - roundedSpent);
  } else {
    progressToNextTier = 100;
    amountNeededForNextTier = 0;
    nextTierDisplay = "Max Tier Achieved";
  }

  return {
    tier: currentTierConfig.name,
    tierKey,
    tierBadgeColor: currentTierConfig.badgeColor,
    tierBadgeIcon: currentTierConfig.badgeIcon,
    pointsMultiplier: currentTierConfig.pointsMultiplier,
    nextTier: nextTierDisplay,
    progressToNextTier,
    amountNeededForNextTier: Math.round(amountNeededForNextTier * 100) / 100,
    benefits: currentTierConfig.benefits,
    lifetimeSpent: roundedSpent,
    loyaltyPoints: currentPoints
  };
};

/**
 * Instance method: Computes loyalty progression for the active user instance.
 */
userSchema.methods.calculateLoyaltyProgression = function (reconciledSpend) {
  const spent =
    typeof reconciledSpend === "number"
      ? reconciledSpend
      : (this.loyalty?.lifetimeSpent || 0);
  const points = this.loyalty?.loyaltyPoints || 0;
  return this.constructor.computeLoyaltyTier(spent, points);
};

/**
 * Idempotently awards an achievement or milestone badge to the user.
 */
userSchema.methods.awardBadge = function (badgeCode, customMeta = {}) {
  this.badges = this.badges || [];
  const existing = this.badges.find((b) => b.code === badgeCode);
  if (existing) return false;

  const defaultMeta = SYSTEM_BADGES[badgeCode] || {};
  this.badges.push({
    code: badgeCode,
    title: customMeta.title || defaultMeta.title || badgeCode,
    description: customMeta.description || defaultMeta.description || "",
    badgeColor: customMeta.badgeColor || defaultMeta.badgeColor || "emerald",
    badgeIcon: customMeta.badgeIcon || defaultMeta.badgeIcon || "award",
    category: customMeta.category || defaultMeta.category || "SPECIAL",
    awardedAt: new Date()
  });
  return true;
};

/**
 * Event-driven handler when an order is paid. Atomically updates spend, tier, points & badges.
 */
userSchema.methods.recordOrderPayment = async function ({
  amount = 0,
  orderCount = 1,
  orderNumber = ""
}) {
  if (!this.loyalty) {
    this.loyalty = {
      tier: "BRONZE",
      lifetimeSpent: 0,
      loyaltyPoints: 0,
      tierAchievedAt: new Date()
    };
  }

  const prevSpent = this.loyalty.lifetimeSpent || 0;
  const newSpent = Math.round((prevSpent + Number(amount)) * 100) / 100;
  this.loyalty.lifetimeSpent = newSpent;

  // Compute progression based on new spend
  const prog = this.calculateLoyaltyProgression(newSpent);
  const prevTier = this.loyalty.tier;
  this.loyalty.tier = prog.tierKey;

  // Reward points with tier multiplier
  const pointsEarned = Math.floor((Number(amount) / 100) * prog.pointsMultiplier);
  this.loyalty.loyaltyPoints = (this.loyalty.loyaltyPoints || 0) + pointsEarned;

  // Award tier milestone badge if upgraded
  if (prevTier !== prog.tierKey) {
    this.loyalty.tierAchievedAt = new Date();
    if (prog.tierKey === "SILVER" || prog.tierKey === "GOLD") {
      this.awardBadge("TECH_ENTHUSIAST");
    } else if (prog.tierKey === "TITANIUM") {
      this.awardBadge("TITANIUM_LEGEND");
    }
  }

  // Milestone checks for order count
  if (orderCount === 1) {
    this.awardBadge("FIRST_ORDER");
  } else if (orderCount >= 5) {
    this.awardBadge("LOYAL_SHOPPER");
  }

  return await this.save();
};

export const User = mongoose.model("User", userSchema);
