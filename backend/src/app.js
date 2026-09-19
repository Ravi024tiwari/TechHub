import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import apiRouter from "./routes/index.js";

const app = express();

app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or from allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS policy"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// Logging in development/production
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(
  express.json({
    limit: "16kb",
    verify: (req, res, buf) => {
      // Store the raw byte stream buffer as a string for webhook signature verification
      req.rawBody = buf.toString();
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/public", express.static("public"));

app.get("/api/v1/health", (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: `${process.uptime().toFixed(2)}s`,
      service: "ElectronicsShop API"
    }, "Electronics E-Commerce Backend Service is operational")
  );
});

// Primary API V1 Routes
app.use("/api/v1", apiRouter);

// 404 handler for unrecognized routes
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

export default app;
