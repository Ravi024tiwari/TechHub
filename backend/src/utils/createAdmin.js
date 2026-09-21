import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";
import readline from "readline";
import { User } from "../models/user.model.js";
import { Cart } from "../models/cart.model.js";
import { Wishlist } from "../models/wishlist.model.js";

// Load environment variables
dotenv.config({ path: "./.env" });

// Configure DNS for MongoDB SRV resolution on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
};

async function run() {
  console.log("\n========================================");
  console.log("🛠️  TechHub Admin Account Provisioner");
  console.log("========================================\n");

  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not set in backend/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB Atlas\n");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }

  // Check command line arguments: node src/utils/createAdmin.js <email> <password> <name>
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage:");
    console.log("  npm run create-admin");
    console.log("  node src/utils/createAdmin.js <email> <password> [name]\n");
    console.log("Examples:");
    console.log("  npm run create-admin");
    console.log("  node src/utils/createAdmin.js admin@techhub.com Admin@123 \"TechHub Admin\"\n");
    process.exit(0);
  }

  let email = args[0];
  let password = args[1];
  let name = args[2];

  // Interactive prompts if arguments are not fully provided
  if (!email) {
    email = await askQuestion("📧 Enter Admin Email: ");
  }
  if (!email || !email.includes("@")) {
    console.error("❌ A valid email address is required.");
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    console.log(`\n🔍 Found existing user with email: ${normalizedEmail}`);
    console.log(`   Current Role: "${existingUser.role}"`);

    if (existingUser.role === "admin") {
      console.log("✨ This account already has the 'admin' role!");
    } else {
      existingUser.role = "admin";
      await existingUser.save({ validateBeforeSave: false });
      console.log(`🎉 Successfully promoted ${existingUser.name} (${normalizedEmail}) to role: "admin"!`);
    }

    if (!password && !args[0]) {
      const resetPwd = await askQuestion("\n🔑 Do you want to update the password for this admin? (y/N): ");
      if (resetPwd.toLowerCase() === "y") {
        password = await askQuestion("Enter new password (min 6 characters): ");
        if (password && password.length >= 6) {
          existingUser.password = password;
          await existingUser.save();
          console.log("✅ Admin password updated successfully!");
        } else {
          console.log("⚠️ Password unchanged (must be at least 6 characters).");
        }
      }
    }

    console.log("\n========================================");
    console.log("🚀 Admin setup completed!");
    console.log(`   Email: ${normalizedEmail}`);
    console.log(`   Role : admin`);
    console.log("========================================\n");
    process.exit(0);
  }

  // If user does not exist, ask for details to create a new admin
  if (!password) {
    password = await askQuestion("🔑 Enter Admin Password (min 6 chars): ");
  }
  if (!password || password.length < 6) {
    console.error("❌ Password must be at least 6 characters long.");
    process.exit(1);
  }

  if (!name) {
    name = await askQuestion("👤 Enter Admin Name (Default: Super Admin): ");
    if (!name) name = "Super Admin";
  }

  console.log("\n⏳ Creating new admin account...");

  const newAdmin = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: password,
    role: "admin"
  });

  // Provision cart and wishlist for enterprise model consistency
  await Promise.all([
    Cart.create({ user: newAdmin._id, items: [] }).catch(() => null),
    Wishlist.create({ user: newAdmin._id, products: [] }).catch(() => null)
  ]);

  console.log("\n========================================");
  console.log("🎉 New Admin Account Created Successfully!");
  console.log(`   Name : ${newAdmin.name}`);
  console.log(`   Email: ${newAdmin.email}`);
  console.log(`   Role : ${newAdmin.role}`);
  console.log("========================================\n");

  process.exit(0);
}

run();
