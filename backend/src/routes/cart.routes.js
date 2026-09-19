import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getAvailableCoupons,
  syncCart
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { couponLimiter } from "../middlewares/rateLimiter.middleware.js";

const cartRouter = Router();

// Secure all cart endpoints (Requires authenticated customer)
cartRouter.use(verifyJWT);

// Cart management
cartRouter.get("/", getCart);
cartRouter.post("/add", addToCart);
cartRouter.patch("/items/:itemId", updateCartItemQuantity);
cartRouter.delete("/items/:itemId", removeItemFromCart);
cartRouter.delete("/clear", clearCart);

// Guest to customer cart synchronization
cartRouter.post("/sync", syncCart);

// Promotional coupon operations (Protected by Coupon Brute-Force Limiter)
cartRouter.get("/coupons", getAvailableCoupons);
cartRouter.post("/coupon/apply", couponLimiter, applyCoupon);
cartRouter.delete("/coupon/remove", removeCoupon);

export default cartRouter;
