import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import cartRoutes from "./cart.routes.js";
import couponRoutes from "./coupon.routes.js";
import orderRoutes from "./order.routes.js";
import reviewRoutes from "./review.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import webhookRoutes from "./webhook.routes.js";
import addressRoutes from "./address.routes.js";
import userRoutes from "./user.routes.js";
import returnRoutes from "./return.routes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productRoutes);
apiRouter.use("/wishlist", wishlistRoutes);
apiRouter.use("/cart", cartRoutes);
apiRouter.use("/coupons", couponRoutes);
apiRouter.use("/orders", orderRoutes);
apiRouter.use("/reviews", reviewRoutes);
apiRouter.use("/dashboard", dashboardRoutes);
apiRouter.use("/webhooks", webhookRoutes);
apiRouter.use("/addresses", addressRoutes);
apiRouter.use("/users/addresses", addressRoutes); // Alias for RESTful convention
apiRouter.use("/users", userRoutes);
apiRouter.use("/returns", returnRoutes);

export default apiRouter;

