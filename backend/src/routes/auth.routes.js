import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  removeUserAvatar,
  changePassword
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";

const authRouter = Router();

// Public Authentication Routes
authRouter.post("/register", uploadSingle("avatar"), registerUser);   
authRouter.post("/login", loginUser);
authRouter.post("/refresh-token", refreshAccessToken);

// Protected Authentication & Profile Routes (Require valid JWT Access Token)
authRouter.post("/logout", verifyJWT, logoutUser);
authRouter.get("/me", verifyJWT, getCurrentUser);
authRouter.get("/profile", verifyJWT, getCurrentUser);

// Profile and Avatar Management
authRouter.patch("/profile", verifyJWT, uploadSingle("avatar"), updateUserProfile);
authRouter.patch("/update-profile", verifyJWT, uploadSingle("avatar"), updateUserProfile); // Legacy alias
authRouter.delete("/avatar", verifyJWT, removeUserAvatar);

// Password Management
authRouter.patch("/change-password", verifyJWT, changePassword);

export default authRouter;
