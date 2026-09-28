import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { useCompareStore } from "@/store/useCompareStore";

/**
 * Production-Grade Floating Compare Dock:
 * - Slides in from the bottom when >= 1 items are in comparison.
 * - Auto-hidden when already viewing the /compare page.
 * - Allows 1-click individual removal, total clear, and quick drawer collapse.
 * - Displays subtle warning banner when comparing mismatched categories.
 */
export default function CompareFloatingBar() {
  const location = useLocation();
  const {
    items,
    maxItems,
    isDockOpen,
    toggleDock,
    removeFromCompare,
    clearCompare,
    hasCategoryMismatch,
  } = useCompareStore();

  // Do not show floating bar if cart empty or if already on compare page
  if (items.length === 0 || location.pathname === "/compare") {
    return null;
  }

  const categoryMismatch = hasCategoryMismatch();

  // Format currency
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Remaining empty slots
  const emptySlotsCount = Math.max(0, maxItems - items.length);

  return (
    <aside
      aria-label="Product Comparison Bar"
      className="fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 pointer-events-none px-3 sm:px-6 pb-3 sm:pb-5"
    >
      <div className="max-w-5xl mx-auto pointer-events-auto">
        {/* Collapsed Mini Pill (When minimized by user) */}
        {!isDockOpen ? (
          <button
            type="button"
            onClick={toggleDock}
            className="ml-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-[#10141f]/95 text-white border-2 border-orange-500/50 shadow-2xl backdrop-blur-xl hover:scale-105 transition-all cursor-pointer font-sans"
          >
            <div className="h-6 w-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-mono font-bold">
              {items.length}
            </div>
            <span className="text-xs font-bold font-heading">
              Comparing Products ({items.length}/{maxItems})
            </span>
            <ChevronUp className="h-4 w-4 text-orange-400" />
          </button>
        ) : (
          /* Expanded Full Floating Dock */
          <div className="rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-[#0c0f18]/95 border-2 border-slate-300 dark:border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),_0_0_20px_rgba(249,115,22,0.15)] backdrop-blur-2xl overflow-hidden animate-slide-up transition-all">
            {/* Category Mismatch Advisory Banner (if applicable) */}
            {categoryMismatch && (
              <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-between text-[11px] font-sans">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span>
                    Items span different electronics categories. Specs comparison will adapt automatically.
                  </span>
                </div>
              </div>
            )}

            {/* Main Dock Content */}
            <div className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              {/* Header Info & Controls */}
              <div className="flex items-center justify-between md:justify-start gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <ArrowLeftRight className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                        Compare Matrix
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        {items.length}/{maxItems}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans hidden sm:block">
                      {items.length === 1
                        ? "Select at least one more product to compare"
                        : "Ready for side-by-side spec evaluation"}
                    </p>
                  </div>
                </div>

                {/* Mobile Minimize Toggle */}
                <button
                  type="button"
                  onClick={toggleDock}
                  className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  aria-label="Collapse compare dock"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Middle: Horizontal Items Strip */}
              <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {items.map((prod) => (
                  <div
                    key={prod._id}
                    className="relative group/item flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shrink-0 w-44 sm:w-48 shadow-xs"
                  >
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg overflow-hidden bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shrink-0">
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-heading font-bold text-slate-900 dark:text-white truncate">
                        {prod.title}
                      </p>
                      <p className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400">
                        {formatINR(prod.salePrice)}
                      </p>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCompare(prod._id)}
                      className="h-5 w-5 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Remove from comparison"
                    >
                      <X className="h-3 w-3 stroke-[3]" />
                    </button>
                  </div>
                ))}

                {/* Empty Placeholder Slots */}
                {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="hidden sm:flex items-center justify-center p-2 rounded-xl border border-dashed border-slate-300 dark:border-white/15 text-[10px] font-sans font-semibold text-slate-400 dark:text-slate-500 shrink-0 w-32 h-12 text-center"
                  >
                    <span>+ Add Product</span>
                  </div>
                ))}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={clearCompare}
                  className="px-2.5 py-2 rounded-xl text-xs font-sans font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Clear all comparison items"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>

                <button
                  type="button"
                  onClick={toggleDock}
                  className="hidden md:inline-flex text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Minimize compare dock"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>

                <Link
                  to="/compare"
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm text-white transition-all shadow-md active:scale-95 ${
                    items.length >= 2
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25 cursor-pointer ring-2 ring-orange-500/30"
                      : "bg-slate-400 dark:bg-slate-700 opacity-60 pointer-events-none"
                  }`}
                >
                  <span>Compare Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
