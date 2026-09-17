import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// Load environment variables early
dotenv.config();

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 [Server] ElectronicsShop API running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`💥 Failed to bootstrap server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`💥 UNHANDLED REJECTION: ${err.name} - ${err.message}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught synchronous exceptions
process.on("uncaughtException", (err) => {
  console.error(`💥 UNCAUGHT EXCEPTION: ${err.name} - ${err.message}`);
  process.exit(1);
});

// Graceful shutdown on SIGTERM / SIGINT
const handleShutdown = (signal) => {
  console.log(`🛑 Received ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(() => {
      console.log("💤 Process terminated cleanly.");
      process.exit(0);
    });
  }
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
