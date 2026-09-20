import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"]
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      max: [5, "Maximum 5 units per electronic gadget allowed"],
      default: 1
    },
    // Snapshot of the active price (salePrice if available, else regularPrice)
    price: {
      type: Number,
      required: [true, "Item price is required"],
      min: [0, "Price cannot be negative"]
    },
    // Optional variant choices (e.g. Color: Space Gray, Storage: 256GB)
    selectedSpecs: {
      color: { type: String, default: "" },
      storage: { type: String, default: "" },
      ram: { type: String, default: "" }
    }
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required for cart"],
      unique: true,
      index: true
    },
    items: [cartItemSchema],
    coupon: {
      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        default: null
      },
      code: {
        type: String,
        uppercase: true,
        trim: true,
        default: null
      },
      discountAmount: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    // Aggregated Price Summary
    pricing: {
      totalItems: {
        type: Number,
        default: 0,
        min: 0
      },
      subtotal: {
        type: Number,
        default: 0,
        min: 0
      },
      shippingFee: {
        type: Number,
        default: 0,
        min: 0
      },
      taxAmount: {
        type: Number,
        default: 0,
        min: 0
      },
      discountTotal: {
        type: Number,
        default: 0,
        min: 0
      },
      grandTotal: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  {
    timestamps: true
  }
);

cartSchema.methods.recalculateTotals = function () {
  let itemsCount = 0;
  let itemsSubtotal = 0;

  for (const item of this.items) {
    itemsCount += item.quantity;
    itemsSubtotal += item.price * item.quantity;
  }

  const discount = this.coupon?.discountAmount || 0;
  const taxableAmount = Math.max(0, itemsSubtotal - discount);

  // Free shipping threshold for electronics: ₹999
  const shipping = itemsSubtotal === 0 || itemsSubtotal >= 999 ? 0 : 99;

  // 18% GST on electronics
  const tax = Math.round(taxableAmount * 0.18);

  const grand = taxableAmount + shipping + tax;

  this.pricing = {
    totalItems: itemsCount,
    subtotal: Math.round(itemsSubtotal),
    discountTotal: Math.round(discount),
    shippingFee: shipping,
    taxAmount: tax,
    grandTotal: Math.round(grand)
  };

  return this.pricing;
};

// Auto-run total calculations before saving cart
cartSchema.pre("save", function () {
  this.recalculateTotals();
});

export const Cart = mongoose.model("Cart", cartSchema);
