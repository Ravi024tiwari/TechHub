import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: [true, "Razorpay event ID is required"],
      unique: true,
      index: true
    },
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      index: true
    },
    razorpayOrderId: {
      type: String,
      default: "",
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: "",
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ["PROCESSED", "DUPLICATE", "FAILED", "IGNORED"],
        message: "Invalid webhook status"
      },
      default: "PROCESSED",
      index: true
    },
    errorReason: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// TTL index to automatically purge processed event logs after 90 days to keep database lean
webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);
