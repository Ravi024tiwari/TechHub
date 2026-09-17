import mongoose from "mongoose";
import dns from "dns"
/**
 * Connect to MongoDB Atlas
 */

dns.setServers(["8.8.8.8", "8.8.4.4"])
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const connectionInstance = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log(`✅ [MongoDB Atlas] Connected successfully! Host: ${connectionInstance.connection.host}`);
    return connectionInstance;
  } catch (error) {
    console.error(`❌ [MongoDB Atlas] Connection Error: ${error.message}`);
    // Do not crash the entire node server immediately during local setup, allow developer to review .env
    console.warn("⚠️ Continuing with unestablished DB connection. Please verify your Atlas MONGODB_URI in .env");
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ [MongoDB] Disconnected from database");
});

mongoose.connection.on("error", (err) => {
  console.error(`❌ [MongoDB] Runtime Error: ${err.message}`);
});
