import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";

const apiRouter = Router();

// Mount feature route modules
apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productRoutes);

export default apiRouter;
