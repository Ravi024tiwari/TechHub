import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

  // either we pass our token through headers or the cookies it will fetch that from there

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "").trim();

  if (!token) {
    throw new ApiError(401, "Unauthorized request: Access token is missing");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token: User no longer exists");
    }

    if (user.isBlocked) {
      throw new ApiError(
        403,
        "Account suspended: Your access has been restricted by an administrator"
      );
    }

    if (user.changedPasswordAfter(decodedToken.iat)) {
      throw new ApiError(
        401,
        "Security update: Your password was recently changed. Please log in again"
      );
    }

    req.user = user; // added  the users data on the req object with that 

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired. Please refresh your token");
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "Invalid access token");
  }
});

/**
 * @param  {...string} allowedRoles - e.g. 'admin', 'customer'
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized: Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

/**
 * Optional Authentication: Populates req.user if a valid token is provided,
 * but allows guest requests to proceed without throwing 401.
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "").trim();

  if (!token) return next();

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (user && !user.isBlocked && !user.changedPasswordAfter(decodedToken.iat)) {
      req.user = user;
    }
  } catch (error) {
  }

  next();
});

