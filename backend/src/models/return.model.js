import mongoose from "mongoose";
import { addressSchema } from "./address.schema.js";

const evidenceImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    }
  },
  { _id: true }
);

const returnTimelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const returnSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order reference is required"],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer reference is required"],
      index: true
    },
    orderItem: {
      orderItemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      title: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      selectedSpecs: {
        color: { type: String, default: "" },
        storage: { type: String, default: "" },
        ram: { type: String, default: "" }
      }
    },
    requestType: {
      type: String,
      enum: {
        values: ["RETURN_AND_REFUND", "REPLACEMENT"],
        message: "Request type must be either RETURN_AND_REFUND or REPLACEMENT"
      },
      default: "RETURN_AND_REFUND",
      index: true
    },
    reason: {
      type: String,
      enum: {
        values: [
          "DEFECTIVE_OR_NOT_WORKING",
          "PHYSICAL_DAMAGE_ON_ARRIVAL",
          "WRONG_ITEM_DELIVERED",
          "MISSING_PARTS_OR_ACCESSORIES",
          "DIFFERENT_FROM_DESCRIPTION",
          "OTHER"
        ],
        message: "Invalid return reason"
      },
      required: [true, "Return reason is required"]
    },
    description: {
      type: String,
      required: [true, "Detailed explanation is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    serialNumber: {
      type: String,
      trim: true,
      default: ""
    },
    evidenceImages: [evidenceImageSchema],
    pickupAddress: {
      type: addressSchema,
      required: [true, "Pickup address is required"]
    },
    status: {
      type: String,
      enum: {
        values: [
          "REQUESTED",
          "APPROVED",
          "REJECTED",
          "PICKUP_SCHEDULED",
          "ITEM_RECEIVED",
          "REFUND_PROCESSED",
          "REPLACEMENT_DISPATCHED",
          "COMPLETED",
          "CANCELLED"
        ],
        message: "Invalid return status"
      },
      default: "REQUESTED",
      index: true
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: ""
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ""
    },
    refundDetails: {
      razorpayRefundId: {
        type: String,
        default: ""
      },
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      refundedAt: {
        type: Date
      },
      status: {
        type: String,
        default: "PENDING"
      }
    },
    replacementDetails: {
      courierPartner: {
        type: String,
        default: ""
      },
      trackingNumber: {
        type: String,
        default: ""
      },
      dispatchedAt: {
        type: Date
      }
    },
    statusTimeline: [returnTimelineEventSchema]
  },
  {
    timestamps: true
  }
);

// Auto-generate unique human-friendly return tracking number
returnSchema.pre("validate", function () {
  if (!this.returnNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.returnNumber = `RET-${timestamp}-${randomSuffix}`;
  }

  if (!this.statusTimeline || this.statusTimeline.length === 0) {
    this.statusTimeline = [
      {
        status: this.status || "REQUESTED",
        timestamp: new Date(),
        note: "Return/Replacement request submitted by customer."
      }
    ];
  }
});

// Production Indexes
returnSchema.index({ user: 1, createdAt: -1 });
returnSchema.index({ order: 1, "orderItem.orderItemId": 1 });
returnSchema.index({ status: 1, createdAt: -1 });

export const ReturnRequest = mongoose.model("ReturnRequest", returnSchema);
