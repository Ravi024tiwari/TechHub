import mongoose from "mongoose";

const reservedItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    title: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: ""
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const stockReservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    items: {
      type: [reservedItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Reservation must contain at least one item"
      }
    },
    status: {
      type: String,
      enum: {
        values: ["RESERVED", "COMPLETED", "RELEASED", "EXPIRED"],
        message: "Status must be RESERVED, COMPLETED, RELEASED, or EXPIRED"
      },
      default: "RESERVED",
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    releasedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for lightning queries during checkout verification & background cleanup
stockReservationSchema.index({ status: 1, expiresAt: 1 });
stockReservationSchema.index({ user: 1, status: 1 });

export const StockReservation = mongoose.model(
  "StockReservation",
  stockReservationSchema
);
