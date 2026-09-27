import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Share2,
  Printer,
  ChevronRight,
  TrendingDown,
  Check,
  Package,
  Loader2,
} from "lucide-react";

/**
 * Production-Grade Professional E-Commerce Wishlist Header:
 * - Clean, high-contrast, premium e-commerce card surface.
 * - Unified brand color system (Solid Cyber Orange & Emerald savings).
 * - Live Financial Telemetry (Estimated Vault Value, Net Savings, Discount Percentage).
 * - Real-Time Stock Availability Indicator (In-Stock Ready to Ship vs Backordered).
 * - High-Impact Solid CTA: "Move All In-Stock to Bag" with tactile feedback & loading states.
 * - Share Wishlist with 1-click clipboard copy feedback.
 * - Export / Print Quotation capability.
 * - Fully responsive across mobile, tablet, and desktop viewports.
 */
export default function WishlistHeader({
  items = [],
  totalValue = 0,
  totalSavings = 0,
  inStockCount = 0,
  outOfStockCount = 0,
  onMoveAllToCart,
  onClearClick,
  isMoving = false,
  onlyInStock = false,
  setOnlyInStock,
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  // Currency formatter for INR
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Calculate overall discount percentage
  const totalRegular = totalValue + totalSavings;
  const overallDiscountPercent =
    totalRegular > 0 ? Math.round((totalSavings / totalRegular) * 100) : 0;

  // Handle Share / Copy Wishlist URL
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        const input = document.createElement("input");
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(false);
    }
  };

  // Handle Print / Export summary
  const handlePrintVault = () => {
    window.print();
  };

  return (
    <div className="mb-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-sm p-5 sm:p-7 lg:p-8 transition-all duration-300">
      {/* Top Bar: Clean Breadcrumbs & Action Utilities */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 sm:gap-2 text-xs font-sans text-slate-500 dark:text-slate-400"
        >
          <Link
            to="/"
            className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <Link
            to="/products"
            className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            Catalog
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="text-slate-900 dark:text-white font-semibold truncate">
            My Wishlist
          </span>
        </nav>

        {/* Quick Sharing & Print Actions Bar */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-sans font-medium transition-all active:scale-95 cursor-pointer border border-slate-200 dark:border-white/10"
              title="Copy shareable wishlist link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Link Copied!
                  </span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="hidden xs:inline">Share Wishlist</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintVault}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-sans font-medium transition-all active:scale-95 cursor-pointer border border-slate-200 dark:border-white/10"
              title="Print wishlist summary"
            >
              <Printer className="h-3.5 w-3.5 text-slate-400" />
              <span>Print Summary</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Header Content */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
        {/* Left Column: Title, Description, and Live Inventory Indicators */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Saved Wishlist
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-sans font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              {items.length} {items.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed font-sans">
            Review your saved products, monitor real-time stock availability, and seamlessly transfer ready-to-dispatch items directly into your shopping cart.
          </p>

          {/* Real-time Inventory & Filter Chips */}
          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
              {/* In Stock Metric Chip */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-sans font-semibold border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{inStockCount} Ready to Ship</span>
              </div>

              {/* Out of Stock / Backorder Chip if any */}
              {outOfStockCount > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-sans font-semibold border border-amber-500/30">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>{outOfStockCount} Backordered</span>
                </div>
              )}

              {/* Instant In-Stock Toggle Filter Button */}
              {setOnlyInStock && outOfStockCount > 0 && (
                <button
                  type="button"
                  onClick={() => setOnlyInStock(!onlyInStock)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans transition-all cursor-pointer border ${
                    onlyInStock
                      ? "bg-orange-500 text-white border-orange-600 font-semibold shadow-xs"
                      : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <span>{onlyInStock ? "✓ Showing In-Stock Only" : "Filter: In-Stock Only"}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Financial Telemetry & Solid Action Controls */}
        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-end xl:items-center gap-4 shrink-0">
            {/* Financial Telemetry Card */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-between sm:justify-start gap-5 sm:gap-6 min-w-[240px]">
              {/* Estimated Total Value */}
              <div>
                <div className="text-[11px] font-sans uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Estimated Value
                </div>
                <div className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {formatINR(totalValue)}
                </div>
              </div>

              {/* Net Savings & Discount Badge */}
              {totalSavings > 0 && (
                <div className="pl-5 sm:pl-6 border-l border-slate-200 dark:border-white/10">
                  <div className="text-[11px] font-sans uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span>Savings</span>
                    {overallDiscountPercent > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-[10px] font-mono font-bold">
                        -{overallDiscountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="font-sans font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatINR(totalSavings)}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: Move All In-Stock (Solid Orange) & Clear Wishlist */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onMoveAllToCart}
                disabled={isMoving || inStockCount === 0}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-heading font-bold uppercase tracking-wider bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shrink-0"
                title={
                  inStockCount === 0
                    ? "No in-stock items available to move"
                    : `Move ${inStockCount} in-stock items directly to your shopping bag`
                }
              >
                {isMoving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingBag className="h-4 w-4" />
                )}
                <span>Move All In-Stock ({inStockCount})</span>
              </button>

              <button
                type="button"
                onClick={onClearClick}
                className="p-3.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/10 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Clear entire wishlist"
                aria-label="Clear entire wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
