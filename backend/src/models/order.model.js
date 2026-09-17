import mongoose from "mongoose";
import { addressSchema } from "./address.schema.js";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"]
    },
    title: {
      type: String,
      required: [true, "Product title snapshot is required"],
      trim: true
    },
    image: {
      type: String,
      required: [true, "Product image snapshot is required"]
    },
    price: {
      type: Number,
      required: [true, "Product purchase price is required"],
      min: [0, "Price cannot be negative"]
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"]
    },
    selectedSpecs: {
      color: { type: String, default: "" },
      storage: { type: String, default: "" },
      ram: { type: String, default: "" }
    }
  },
  { _id: true }
);

const timelineEventSchema = new mongoose.Schema(
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

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
      index: true
    },
    orderItems: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "An order must have at least one order item"
      }
    },
    shippingAddress: {
      type: addressSchema,
      required: [true, "Shipping address is required"]
    },
    paymentInfo: {
      method: {
        type: String,
        enum: {
          values: ["RAZORPAY", "COD"],
          message: "Payment method must be either RAZORPAY or COD"
        },
        default: "RAZORPAY"
      },
      status: {
        type: String,
        enum: {
          values: ["PENDING", "PAID", "FAILED", "REFUNDED"],
          message: "Payment status must be PENDING, PAID, FAILED, or REFUNDED"
        },
        default: "PENDING"
      },
      razorpayOrderId: {
        type: String,
        default: ""
      },
      razorpayPaymentId: {
        type: String,
        default: ""
      },
      razorpaySignature: {
        type: String,
        default: ""
      },
      paidAt: {
        type: Date
      }
    },
    pricing: {
      itemsTotal: {
        type: Number,
        required: true,
        min: 0
      },
      shippingFee: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      taxAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      discountAmount: {
        type: Number,
        default: 0,
        min: 0
      },
      grandTotal: {
        type: Number,
        required: true,
        min: 0
      }
    },
    orderStatus: {
      type: String,
      enum: {
        values: [
          "PLACED",
          "CONFIRMED",
          "PROCESSING",
          "SHIPPED",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "CANCELLED",
          "RETURNED"
        ],
        message: "Invalid order status value"
      },
      default: "PLACED",
      index: true
    },
    statusTimeline: [timelineEventSchema],
    trackingInfo: {
      courierPartner: {
        type: String,
        trim: true,
        default: ""
      },
      trackingNumber: {
        type: String,
        trim: true,
        default: ""
      },
      trackingUrl: {
        type: String,
        trim: true,
        default: ""
      },
      estimatedDelivery: {
        type: Date
      },
      deliveredAt: {
        type: Date
      }
    },
    cancellation: {
      reason: {
        type: String,
        trim: true,
        default: ""
      },
      cancelledAt: {
        type: Date
      },
      cancelledBy: {
        type: String,
        enum: ["CUSTOMER", "ADMIN"],
        default: "CUSTOMER"
      }
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate human-friendly unique order number before validation
orderSchema.pre("validate", function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${timestamp}-${randomDigits}`;
  }

  // Ensure initial timeline entry exists
  if (!this.statusTimeline || this.statusTimeline.length === 0) {
    this.statusTimeline = [
      {
        status: this.orderStatus || "PLACED",
        timestamp: new Date(),
        note: "Order has been placed successfully."
      }
    ];
  }

  next();
});

// Production Indexes for customer order history and admin dispatch management
orderSchema.index({ user: 1, createdAt: -1 }); // Customer order history query
orderSchema.index({ orderStatus: 1, createdAt: -1 }); // Admin order pipeline management
orderSchema.index({ "paymentInfo.status": 1 }); // Admin payment verification query

export const Order = mongoose.model("Order", orderSchema);
