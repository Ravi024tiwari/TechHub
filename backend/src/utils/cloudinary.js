import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { ApiError } from "./ApiError.js";

/**
 * Upload a local file from disk to Cloudinary and safely clean up local storage
 * @param {string} localFilePath - Path of the file saved temporarily on local disk
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export const uploadOnCloudinary = async (
  localFilePath,
  folder = "electronicsshop/products"
) => {
  try {
    if (!localFilePath) {
      throw new ApiError(400, "Local file path is required for upload");
    }

    // Upload the file to Cloudinary with automatic optimization
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: "auto",
      quality: "auto",
      fetch_format: "auto"
    });

    // File uploaded successfully, remove it from local disk
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      url: response.secure_url,
      public_id: response.public_id
    };
  } catch (error) {
    // Clean up temporary local file if upload failed so disk doesn't fill up
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    console.error("❌ Cloudinary Upload Error:", error.message);
    throw new ApiError(
      500,
      `Failed to upload image to Cloudinary: ${error.message}`
    );
  }
};

/**
 * Delete an asset from Cloudinary using its public_id
 * @param {string} public_id - Cloudinary public ID
 * @returns {Promise<any>}
 */
export const deleteFromCloudinary = async (public_id) => {
  try {
    if (!public_id) return null;
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.error(
      `⚠️ Failed to delete asset from Cloudinary (${public_id}):`,
      error.message
    );
    return null;
  }
};
