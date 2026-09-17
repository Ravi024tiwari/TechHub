import { Router } from "express";
import {
  toggleWishlistProduct,
  getUserWishlist,
  checkWishlistStatus,
  moveWishlistItemToCart,
  clearWishlist
} from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const wishlistRouter = Router();

// Secure all wishlist endpoints (Requires authenticated customer)
wishlistRouter.use(verifyJWT);

wishlistRouter.get("/", getUserWishlist);
wishlistRouter.post("/toggle/:productId", toggleWishlistProduct);
wishlistRouter.get("/check/:productId", checkWishlistStatus);
wishlistRouter.post("/move-to-cart/:productId", moveWishlistItemToCart);
wishlistRouter.delete("/clear", clearWishlist);

export default wishlistRouter;
