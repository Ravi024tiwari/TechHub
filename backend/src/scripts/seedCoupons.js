import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { Coupon } from "../models/coupon.model.js";

const DEFAULT_COUPONS = [
  {
    code: "WELCOME500",
    description: "Welcome Offer: Flat ₹500 off on your first purchase above ₹2,000",
    discountType: "FLAT",
    discountValue: 500,
    minOrderValue: 2000,
    icon: "gift",
    badgeText: "FIRST ORDER",
    startDate: new Date(),
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    usageLimit: 5000,
    usageLimitPerUser: 1,
    isActive: true
  },
  {
    code: "TECH10",
    description: "10% Instant Tech Discount (Save up to ₹4,000) on orders above ₹15,000",
    discountType: "PERCENTAGE",
    discountValue: 10,
    maxDiscountAmount: 4000,
    minOrderValue: 15000,
    icon: "sparkles",
    badgeText: "MOST POPULAR",
    startDate: new Date(),
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    usageLimit: 2500,
    usageLimitPerUser: 2,
    isActive: true
  },
  {
    code: "FLASH15",
    description: "Flash Deal: 15% Instant Savings up to ₹2,500 on orders above ₹8,000",
    discountType: "PERCENTAGE",
    discountValue: 15,
    maxDiscountAmount: 2500,
    minOrderValue: 8000,
    icon: "zap",
    badgeText: "LIGHTNING DEAL",
    startDate: new Date(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    usageLimit: 1500,
    usageLimitPerUser: 1,
    isActive: true
  },
  {
    code: "PRO2000",
    description: "Pro Hardware Voucher: Flat ₹2,000 off on high-end hardware above ₹30,000",
    discountType: "FLAT",
    discountValue: 2000,
    minOrderValue: 30000,
    icon: "crown",
    badgeText: "PRO HARDWARE",
    startDate: new Date(),
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    usageLimit: 1000,
    usageLimitPerUser: 1,
    isActive: true
  }
];

async function seedCoupons() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB!");

    for (const data of DEFAULT_COUPONS) {
      await Coupon.findOneAndUpdate(
        { code: data.code },
        { $set: data },
        { upsert: true, new: true }
      );
      console.log(` Updated/Seeded coupon: [${data.icon}] ${data.code} (${data.badgeText})`);
    }

    const total = await Coupon.countDocuments();
    console.log(`Total coupons in database: ${total}`);

    await mongoose.disconnect();
    console.log("Database disconnected successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed coupons:", error);
    process.exit(1);
  }
}

seedCoupons();
