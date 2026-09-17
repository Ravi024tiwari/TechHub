import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const addressSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ name: "text", email: "text" }); 
userSchema.index({ role: 1, createdAt: -1 }); 



userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();// if not modified by the user

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
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

export const User = mongoose.model("User", userSchema);
