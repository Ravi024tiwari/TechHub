import mongoose from "mongoose";
import { StockReservation } from "../models/stockReservation.model.js";
import { Product } from "../models/product.model.js";

/**
 * Release reserved stock for an array of reserved items back into available inventory
 * @param {Array} items - List of reserved items
 * @param {mongoose.ClientSession|null} session - Optional MongoDB transaction session
 */
export const restoreReservedItemsStock = async (items, session = null) => {
  for (const item of items) {
    const productId = item.product?._id || item.product;
    const quantity = item.quantity;
    const chosenColor = item.color;

    if (!productId || !quantity || quantity <= 0) continue;

    try {
      let variantRestored = false;

      // 1. If color variant was specified, restore variant-level stock & reservedStock
      if (chosenColor) {
        const prod = await Product.findById(productId).session(session);
        const hasVariant = prod?.colors?.some(
          (c) => c.colorName.toLowerCase() === chosenColor.toLowerCase()
        );

        if (hasVariant) {
          await Product.findOneAndUpdate(
            {
              _id: productId,
              "colors.colorName": new RegExp(`^${chosenColor.trim()}$`, "i")
            },
            {
              $inc: {
                "colors.$.stock": quantity,
                "colors.$.reservedStock": -quantity,
                stock: quantity,
                reservedStock: -quantity
              }
            },
            { session }
          );
          variantRestored = true;
        }
      }

      // 2. Base product stock restore
      if (!variantRestored) {
        await Product.findByIdAndUpdate(
          productId,
          {
            $inc: {
              stock: quantity,
              reservedStock: -quantity
            }
          },
          { session }
        );
      }
    } catch (err) {
      console.error(
        `❌ Error restoring stock for product ${productId} (qty: ${quantity}):`,
        err.message
      );
    }
  }
};

/**
 * Sweeper: Identifies and releases expired stock reservations
 */
export const cleanupExpiredStockReservations = async () => {
  try {
    const now = new Date();
    const expiredReservations = await StockReservation.find({
      status: "RESERVED",
      expiresAt: { $lte: now }
    }).limit(50); // Process in manageable batches

    if (!expiredReservations || expiredReservations.length === 0) {
      return 0;
    }

    let processedCount = 0;

    for (const reservation of expiredReservations) {
      // Use transaction if supported (replica set), fallback to atomic updates if standalone
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          // Double-check status inside transaction
          const lockedDoc = await StockReservation.findById(
            reservation._id
          ).session(session);

          if (!lockedDoc || lockedDoc.status !== "RESERVED") return;

          // Restore inventory
          await restoreReservedItemsStock(lockedDoc.items, session);

          // Mark reservation as EXPIRED
          lockedDoc.status = "EXPIRED";
          lockedDoc.releasedAt = new Date();
          await lockedDoc.save({ session });

          processedCount++;
        });
      } catch (transErr) {
        // Fallback for standalone MongoDB environments without replica set
        if (transErr.message?.includes("Transaction numbers are only allowed")) {
          const freshDoc = await StockReservation.findById(reservation._id);
          if (freshDoc && freshDoc.status === "RESERVED") {
            await restoreReservedItemsStock(freshDoc.items);
            freshDoc.status = "EXPIRED";
            freshDoc.releasedAt = new Date();
            await freshDoc.save();
            processedCount++;
          }
        } else {
          console.error(
            `❌ Failed to release expired reservation ${reservation.razorpayOrderId}:`,
            transErr.message
          );
        }
      } finally {
        await session.endSession();
      }
    }

    if (processedCount > 0) {
      console.log(
        `🧹 [Stock Guard] Released ${processedCount} expired stock reservation(s) back into available inventory.`
      );
    }

    return processedCount;
  } catch (error) {
    console.error("❌ Stock reservation cleanup worker error:", error);
    return 0;
  }
};

/**
 * Start periodic stock reservation watchdog
 * Runs every 30 seconds
 */
export const startStockReservationWorker = (intervalMs = 30000) => {
  // Run once immediately on server startup to catch any unreleased items from previous downtime
  cleanupExpiredStockReservations();

  const timer = setInterval(() => {
    cleanupExpiredStockReservations();
  }, intervalMs);

  return timer;
};
