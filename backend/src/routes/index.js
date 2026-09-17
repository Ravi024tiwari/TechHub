import { Router } from "express";
import authRoutes from "./auth.routes.js";

const apiRouter = Router();

// Mount feature route modules
apiRouter.use("/auth", authRoutes);

export default apiRouter;
