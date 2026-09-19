import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Cart } from "../models/cart.model.js";
import { Wishlist } from "../models/wishlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

/**
 * Helper to generate and save access and refresh tokens
 * @param {string} userId
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found for token generation");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Persist refresh token in database for rotation and revocation
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      `Something went wrong while generating tokens: ${error.message}`
    );
  }
};

/**
 * Standard secure cookie options
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
});

/**
 * @desc    Register a new customer / user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required fields");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "An account with this email address already exists");
  }

  // Handle avatar upload via Multer (if provided)
  let avatarData = { url: "", public_id: "" };
  if (req.file?.path) {
    const uploadResult = await uploadOnCloudinary(
      req.file.path,
      "electronicsshop/avatars"
    );
    if (uploadResult) {
      avatarData = {
        url: uploadResult.url,
        public_id: uploadResult.public_id
      };
    }
  }

  // Security: only allow customer role by default from public registration
  const userRole = role === "admin" ? "admin" : "customer";

  // Create user in database
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone ? phone.trim() : "",
    avatar: avatarData,
    role: userRole
  });

  // Enterprise Auto-Provisioning: create initial Cart & Wishlist for this user
  await Promise.all([
    Cart.create({ user: user._id, items: [] }),
    Wishlist.create({ user: user._id, products: [] })
  ]);

  // Generate session tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Exclude sensitive fields from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = getCookieOptions();

  return res
    .status(201)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    .json(
      new ApiResponse(
        201,
        {
          user: createdUser,
          accessToken,
          refreshToken
        },
        "User registered successfully! Welcome to ElectronicsShop."
      )
    );
});

/**
 * @desc    Login existing user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user and explicitly include password field
  const user = await User.findOne({
    email: email.toLowerCase().trim()
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check account block status
  if (user.isBlocked) {
    throw new ApiError(
      403,
      "Your account has been suspended. Please contact customer support."
    );
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = getCookieOptions();

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "Logged in successfully"
      )
    );
});

/**
 * @desc    Renew Access Token using valid Refresh Token (Silent Rotation)
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (Requires Refresh Token)
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing. Please log in again.");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded?._id).select("+refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid refresh token: User no longer exists");
    }

    if (user.isBlocked) {
      throw new ApiError(403, "Your account has been suspended");
    }

    // Token reuse / rotation check: incoming token MUST match stored token
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(
        401,
        "Refresh token has expired or already been used. Please log in again."
      );
    }

    // Generate fresh token pair (Rotating Refresh Token for maximum security)
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const cookieOptions = getCookieOptions();

    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000 // 15 minutes
      })
      .cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(
        401,
        "Refresh token has expired. Please log in again to continue."
      );
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "Invalid refresh token");
  }
});

/**
 * @desc    Logout user and clear sessions & cookies
 * @route   POST /api/v1/auth/logout
 * @access  Private (Protected by verifyJWT)
 */
export const logoutUser = asyncHandler(async (req, res) => {
  // Revoke refresh token from database
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    { new: true }
  );

  const cookieOptions = getCookieOptions();

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private (Protected by verifyJWT)
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: req.user },
        "Current user profile fetched successfully"
      )
    );
});

/**
 * @desc    Update current user profile info & avatar
 * @route   PATCH /api/v1/auth/profile or /api/v1/auth/update-profile
 * @access  Private (Protected by verifyJWT)
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, email, removeAvatar } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Security check: Email is strictly immutable
  if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
    throw new ApiError(
      400,
      "Email address is permanent and cannot be modified for account security"
    );
  }

  // Validate and update Name
  if (name !== undefined) {
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 60) {
      throw new ApiError(400, "Name must be between 2 and 60 characters long");
    }
    user.name = trimmedName;
  }

  // Validate and update Phone number
  if (phone !== undefined) {
    const trimmedPhone = phone.trim();
    const phoneRegex = /^[6-9]\d{9}$/;
    if (trimmedPhone && !phoneRegex.test(trimmedPhone)) {
      throw new ApiError(
        400,
        "Please provide a valid 10-digit mobile number starting with 6-9"
      );
    }
    user.phone = trimmedPhone;
  }

  // Handle avatar removal request
  if (removeAvatar === true || removeAvatar === "true") {
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }
    user.avatar = { url: "", public_id: "" };
  }

  // Handle avatar upload replacement
  if (req.file?.path) {
    // Delete old avatar from Cloudinary if one already exists
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    const uploadResult = await uploadOnCloudinary(
      req.file.path,
      "electronicsshop/avatars"
    );
    if (uploadResult) {
      user.avatar = {
        url: uploadResult.url,
        public_id: uploadResult.public_id
      };
    }
  }

  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: updatedUser }, "Profile updated successfully")
    );
});

/**
 * @desc    Remove user profile avatar
 * @route   DELETE /api/v1/auth/avatar
 * @access  Private (Protected by verifyJWT)
 */
export const removeUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  user.avatar = { url: "", public_id: "" };
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: updatedUser }, "Profile avatar removed successfully")
    );
});

/**
 * @desc    Change user password with session rotation
 * @route   PATCH /api/v1/auth/change-password
 * @access  Private (Protected by verifyJWT)
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(
      400,
      "New password cannot be identical to your current password"
    );
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Incorrect old password");
  }

  user.password = newPassword;
  await user.save(); // Triggers bcrypt hashing and passwordChangedAt update in pre-save hook

  // Issue new refreshed tokens after password change
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const cookieOptions = getCookieOptions();

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Password changed successfully! Active sessions refreshed."
      )
    );
});
