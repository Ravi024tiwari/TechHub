import React from "react";
import {
  IndianRupee,
  Boxes,
  AlertTriangle,
  Percent,
  ArrowDownRight,
  TrendingDown,
  Sparkles,
} from "lucide-react";

export default function PricingStockSection({
  formData,
  setFormData,
  colorVariants = [],
}) {
  const regularPrice = Number(formData.regularPrice) || 0;
  const salePrice =
    formData.salePrice !== "" && formData.salePrice !== null
      ? Number(formData.salePrice)
      : null;

  const isSalePriceInvalid = salePrice !== null && salePrice > regularPrice;

  const discountPercent =
    regularPrice > 0 && salePrice !== null && salePrice < regularPrice
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  const customerSavings =
    regularPrice > 0 && salePrice !== null && salePrice < regularPrice
      ? regularPrice - salePrice
      : 0;

  // Format currency helper
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-white/30 bg-white dark:bg-[#0c0f17] p-4 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group overflow-hidden space-y-5 sm:space-y-6">
      {/* Contained Ambient Background Glow */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-emerald-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
      </div>

      {/* Section Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200 dark:border-white/15">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-emerald-500/30 shrink-0 shadow-xs">
            02
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white truncate">
              Pricing & Warehouse Inventory
            </h2>
            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 line-clamp-1">
              Regular retail price (MRP), promotional deal pricing, and inventory management.
            </p>
          </div>
        </div>

        {/* Live Discount Indicator */}
        {discountPercent > 0 && (
          <div className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-sans font-bold flex items-center gap-1.5 shadow-xs w-fit">
            <Percent className="w-3.5 h-3.5 text-rose-500" />
            <span>{discountPercent}% OFF LIVE</span>
          </div>
        )}
      </div>

      {/* Pricing Inputs Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Regular Price (MRP) */}
        <div className="space-y-1.5">
          <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Regular Price (MRP)</span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold text-sm">
              ₹
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={formData.regularPrice}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  regularPrice: e.target.value,
                }))
              }
              placeholder="e.g. 199900"
              required
              className="w-full pl-8 pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-hidden shadow-xs"
            />
          </div>
          <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
            Formatted:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatINR(regularPrice)}
            </span>
          </p>
        </div>

        {/* Sale Price (Offer Price) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
              <span>Promotional Sale Price</span>
            </label>
            <span className="text-[11px] font-sans text-slate-400">Optional</span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold text-sm">
              ₹
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={formData.salePrice}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, salePrice: e.target.value }))
              }
              placeholder="e.g. 179900"
              className={`w-full pl-8 pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#07090e] border text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-hidden shadow-xs ${
                isSalePriceInvalid
                  ? "border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/20"
                  : "border-slate-300 dark:border-white/20 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              }`}
            />
          </div>
          {isSalePriceInvalid ? (
            <p className="text-[11px] font-sans text-rose-500 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Sale price cannot exceed Regular Price (MRP)</span>
            </p>
          ) : customerSavings > 0 ? (
            <p className="text-[11px] font-sans text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 shrink-0" />
              <span>Customer saves: {formatINR(customerSavings)}</span>
            </p>
          ) : (
            <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
              Leave blank if no promotion applies.
            </p>
          )}
        </div>
      </div>

      {/* Stock & Low Stock Threshold Row */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-3 border-t border-slate-200 dark:border-white/10">
        {/* Available Stock */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-orange-500" />
              <span>Available Inventory Units</span>
              <span className="text-rose-500">*</span>
            </label>
            {colorVariants.length > 0 && (
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                <span>Auto-Synced</span>
              </span>
            )}
          </div>
          <input
            type="number"
            min={0}
            step={1}
            value={formData.stock}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, stock: e.target.value }))
            }
            placeholder="e.g. 25"
            required
            className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-hidden shadow-xs"
          />
          <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
            {colorVariants.length > 0
              ? `Calculated from ${colorVariants.length} color variants (${formData.stock} total units).`
              : "Base stock quantity if color finishes are not defined."}
          </p>
        </div>

        {/* Low Stock Warning Threshold */}
        <div className="space-y-1.5">
          <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Low Stock Warning Trigger</span>
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={formData.lowStockThreshold}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                lowStockThreshold: e.target.value,
              }))
            }
            placeholder="e.g. 5"
            className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-hidden shadow-xs"
          />
          <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
            Triggers amber warning badge in inventory table when units fall below this.
          </p>
        </div>
      </div>
    </div>
  );
}
