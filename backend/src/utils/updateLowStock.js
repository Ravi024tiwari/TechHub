import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

dotenv.config({ path: "./.env" });

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

async function updateLowStock() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    if (!mongoUri) {
      throw new Error("MONGODB_URI or MONGODB_URL is missing in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to DB");

    await Product.updateOne({ title: /Odyssey/i }, { $set: { stock: 2 } });
    await Product.updateOne({ title: /ROG Strix/i }, { $set: { stock: 3 } });
    await Product.updateOne({ title: /PlayStation/i }, { $set: { stock: 4 } });
    await Product.updateOne({ title: /MacBook/i }, { $set: { stock: 5 } });

    const lowStockItems = await Product.find({ stock: { $lte: 5 } }, "title stock regularPrice salePrice slug images").lean();
    console.log(`Found ${lowStockItems.length} products with stock <= 5:`);
    lowStockItems.forEach(p => console.log(`- [Stock: ${p.stock}] ${p.title}`));

    process.exit(0);
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }
}

updateLowStock();
