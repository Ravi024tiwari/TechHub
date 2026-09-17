import mongoose from "mongoose";

export const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Recipient full name is required"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Contact phone number is required"],
      trim: true
    },
    street: {
      type: String,
      required: [true, "Street address / House number is required"],
      trim: true
    },
    landmark: {
      type: String,
      trim: true,
      default: ""
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, "Pincode / Postal code is required"],
      trim: true
    },
    addressType: {
      type: String,
      enum: {
        values: ["home", "work", "other"],
        message: "Address type must be home, work, or other"
      },
      default: "home"
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { _id: true, timestamps: true }
);
