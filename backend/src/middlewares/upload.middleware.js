import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

// Ensure destination temp directory exists
const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Disk Storage configuration: Saves incoming file to local disk temp folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Strict image MIME-type validator
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "image/avif"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file format '${file.mimetype}'. Only JPG, PNG, WEBP, and AVIF images are permitted.`
      ),
      false
    );
  }
};

// 5MB maximum file size limit per image
const limits = {
  fileSize: 5 * 1024 * 1024 // 5 MB
};

export const upload = multer({
  storage,
  fileFilter,
  limits
});

// Reusable helper upload middlewares
export const uploadSingle = (fieldName = "image") => upload.single(fieldName);
export const uploadMultiple = (fieldName = "images", maxCount = 6) =>
  upload.array(fieldName, maxCount);
export const uploadFields = (fieldsArray) => upload.fields(fieldsArray);
