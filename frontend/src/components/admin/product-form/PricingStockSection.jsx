import React from "react";
import { IndianRupee, Boxes, AlertTriangle, Percent, ArrowDownRight } from "lucide-react";

export default function PricingStockSection({
  formData,
  setFormData,
  colorVariants = [],
}) {
  const regularPrice = Number(formData.regularPrice) || 0;
  const salePrice = formData.salePrice !== "" && formData.salePrice !== null ? Number(formData.salePrice) : null;

  const isSalePriceInvalid = salePrice !== null && salePrice > regularPrice;

  const discountPercent =
    regularPrice > 0 && salePrice !== null && salePrice < regularPrice
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  // Format currency helper
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-white/15 bg-white dark:bg-gradient-to-b dark:from-[#141824] dark:via-[#0d1017] dark:to-[#080a0e] p-3.5 sm:p-6 lg:p-7 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.8),_0_0_15px_rgba(255,255,255,0.05)] space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs sm:text-sm shrink-0 mt-0.5 sm:mt-0">
            02
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-heading font-bold text-slate-900 dark:text-white truncate">
              Pricing & Warehouse Inventory
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              Configure regular retail price (MRP), promotional deal pricing, and stock monitoring.
            </p>
          </div>
        </div>

        {/* Live Discount Indicator */}
        {discountPercent > 0 && (
          <div className="px-2.5 sm:px-3 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm w-fit">
            <Percent className="w-3 h-3 text-rose-500 dark:text-rose-400" />
            <span>{discountPercent}% OFF LIVE</span>
          </div>
        )}
      </div>

      {/* Pricing Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Regular Price (MRP) */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Regular Price (MRP)</span>
            <span className="text-rose-500 dark:text-rose-400">*</span>
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
              onChange={(e) => setFormData((prev) => ({ ...prev, regularPrice: e.target.value }))}
              placeholder="e.g. 199900"
              required
              className="w-full pl-8 pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-emerald-500 dark:focus:border-emerald-400 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
            />
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono text-slate-500">
            Preview: {formatINR(regularPrice)}
          </p>
        </div>

        {/* Sale Price (Offer Price) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Promotional Sale Price</span>
            </label>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-slate-500">Optional</span>
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
              onChange={(e) => setFormData((prev) => ({ ...prev, salePrice: e.target.value }))}
              placeholder="e.g. 179900"
              className={`w-full pl-8 pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none ${
                isSalePriceInvalid
                  ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500"
                  : "border-slate-200 dark:border-white/15 focus:border-emerald-500 dark:focus:border-emerald-400"
              }`}
            />
          </div>
          {isSalePriceInvalid ? (
            <p className="text-[10px] sm:text-[11px] font-mono text-rose-500 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Sale price cannot be greater than Regular Price</span>
            </p>
          ) : (
            <p className="text-[10px] sm:text-[11px] font-mono text-slate-500">
              Customer saves: {regularPrice && salePrice ? formatINR(Math.max(0, regularPrice - salePrice)) : "₹0"}
            </p>
          )}
        </div>
      </div>

      {/* Stock & Low Stock Threshold Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-slate-200/60 dark:border-white/5">
        {/* Available Stock */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>Available Inventory Units</span>
              <span className="text-rose-500 dark:text-rose-400">*</span>
            </label>
            {colorVariants.length > 0 && (
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span>⚡ Auto-synced</span>
              </span>
            )}
          </div>
          <input
            type="number"
            min={0}
            step={1}
            value={formData.stock}
            onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
            placeholder="e.g. 25"
            required
            className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
          />
          <p className="text-[10px] sm:text-[11px] font-mono text-slate-500">
            {colorVariants.length > 0
              ? `Auto-computed as sum of all ${colorVariants.length} color finishes (${formData.stock} total units).`
              : "Base stock quantity if color variants are not configured."}
          </p>
        </div>

        {/* Low Stock Warning Threshold */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Low Stock Alert Trigger</span>
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={formData.lowStockThreshold}
            onChange={(e) => setFormData((prev) => ({ ...prev, lowStockThreshold: e.target.value }))}
            placeholder="e.g. 5"
            className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-amber-500 dark:focus:border-amber-400 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
          />
          <p className="text-[10px] sm:text-[11px] font-mono text-slate-500">
            System sends low inventory alert when units fall to or below this number.
          </p>
        </div>
      </div>
    </div>
  );
}
