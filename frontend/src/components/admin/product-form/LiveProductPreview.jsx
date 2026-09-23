import React, { useState } from "react";
import { Eye, Star, Boxes, Sparkles, CheckCircle2, AlertCircle, ShoppingBag } from "lucide-react";

export default function LiveProductPreview({
  formData,
  primaryPreviewUrl,
  colorVariants = [],
  specifications = {},
}) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const regularPrice = Number(formData.regularPrice) || 0;
  const salePrice = formData.salePrice !== "" && formData.salePrice !== null ? Number(formData.salePrice) : null;
  const discountPercent =
    regularPrice > 0 && salePrice !== null && salePrice < regularPrice
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  const stock = Number(formData.stock) || 0;

  // Format currency helper
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Active color variant if any
  const activeColor = colorVariants[selectedColorIdx] || colorVariants[0] || null;

  // Completion checklist items
  const checklist = [
    { label: "Product Title", ok: Boolean(formData.title?.trim().length >= 3) },
    { label: "Category Selected", ok: Boolean(formData.category) },
    { label: "Brand Selected", ok: Boolean(formData.brand) },
    { label: "Regular Price (MRP)", ok: regularPrice > 0 },
    { label: "Product Photo", ok: Boolean(primaryPreviewUrl) },
  ];

  const completedCount = checklist.filter((c) => c.ok).length;
  const isReady = completedCount === checklist.length;

  return (
    <div className="space-y-3 sm:space-y-4 lg:sticky lg:top-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          <span>Live Storefront Preview</span>
        </h3>
        <span
          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
            isReady
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
          }`}
        >
          {completedCount} / {checklist.length} Required
        </span>
      </div>

      {/* Realistic Interactive Store Product Card */}
      <div className="relative rounded-2xl border-2 border-slate-200 dark:border-white/25 bg-white dark:bg-gradient-to-b dark:from-[#141824] dark:via-[#0d1017] dark:to-[#080a0e] shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.9),_0_0_20px_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-300 group">
        {/* Top Image Box */}
        <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-[#0c0f16] border-b border-slate-200 dark:border-white/15 overflow-hidden flex items-center justify-center">
          {primaryPreviewUrl ? (
            <img
              src={primaryPreviewUrl}
              alt="Preview"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-center p-6 space-y-2 text-slate-400 dark:text-slate-500">
              <div className="w-12 h-12 rounded-xl bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 mx-auto flex items-center justify-center text-slate-500 dark:text-slate-400 text-lg">
                📷
              </div>
              <p className="text-xs font-mono">No Image Uploaded Yet</p>
            </div>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/80 dark:from-[#080a0e] via-black/40 dark:via-[#080a0e]/50 to-transparent pointer-events-none" />

          {/* Top-Left Category & Discount */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 max-w-[65%]">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-black/75 text-white backdrop-blur-md border border-white/15 shadow-sm truncate">
              {formData.categoryName || "Category"}
            </span>

            {discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold tracking-wider uppercase bg-rose-500 text-white shadow-md flex items-center gap-1 w-fit">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Keynote Featured Star */}
          {formData.isFeatured && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-500 text-black shadow-md flex items-center gap-1 z-10">
              <Sparkles className="w-3 h-3 fill-black" />
              <span>Keynote</span>
            </div>
          )}

          {/* Bottom Stock Indicator */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold backdrop-blur-md border flex items-center gap-1 shadow-sm ${
                stock <= 0
                  ? "bg-rose-500/25 text-rose-300 border-rose-500/40"
                  : stock <= 5
                  ? "bg-amber-500/25 text-amber-300 border-amber-500/40"
                  : "bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
              }`}
            >
              <Boxes className="w-3 h-3" />
              <span>{stock <= 0 ? "Out of Stock" : `Stock: ${stock}`}</span>
            </span>

            <span
              className={`px-2 py-0.5 rounded-full text-[9.5px] font-mono uppercase tracking-wider backdrop-blur-md border ${
                formData.isActive
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-500/15 text-slate-400 border-slate-500/30"
              }`}
            >
              {formData.isActive ? "Active" : "Draft"}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 bg-white dark:bg-transparent">
          {/* Brand & SKU */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formData.brandName || "Brand"}
            </span>
            {formData.sku && (
              <span className="text-slate-400 dark:text-slate-500 text-[10px] truncate max-w-[120px]">
                SKU: {formData.sku}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h4 className="text-xs sm:text-sm font-heading font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[2.2rem] sm:min-h-[2.5rem]">
            {formData.title || "Your Flagship Product Title Appears Here"}
          </h4>

          {/* Interactive Color Swatches Selector */}
          {colorVariants.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span>Color Finish:</span>
                <span className="text-slate-900 dark:text-white font-semibold">{activeColor?.colorName || "Standard"}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {colorVariants.map((col, idx) => (
                  <button
                    key={col.colorName + idx}
                    type="button"
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`w-6 h-6 rounded-full border-2 transition-all p-0.5 cursor-pointer ${
                      selectedColorIdx === idx
                        ? "border-sky-500 scale-110 shadow-xs"
                        : "border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/50"
                    }`}
                    title={`${col.colorName} (${col.colorCode})`}
                  >
                    <div
                      className="w-full h-full rounded-full"
                      style={{ backgroundColor: col.colorCode }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Block */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-heading font-extrabold text-slate-900 dark:text-white font-mono">
                {formatINR(salePrice ?? regularPrice)}
              </span>
              {regularPrice > (salePrice ?? regularPrice) && (
                <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 line-through font-mono">
                  {formatINR(regularPrice)}
                </span>
              )}
            </div>

            <span className="text-[10px] sm:text-[11px] font-mono text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Instant Buy</span>
            </span>
          </div>
        </div>
      </div>

      {/* Validation Checklist Card */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090b10] space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
          Publication Readiness Checklist
        </h4>
        <div className="space-y-1.5">
          {checklist.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs font-mono"
            >
              <span className={item.ok ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}>
                {item.label}
              </span>
              {item.ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Required</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
