import React, { useState } from "react";
import {
  Eye,
  Boxes,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Globe,
} from "lucide-react";

export default function LiveProductPreview({
  formData,
  primaryPreviewUrl,
  colorVariants = [],
  specifications = {},
  isEditMode = false,
  productId = null,
  productSlug = null,
  onJumpToSection = null,
}) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const regularPrice = Number(formData.regularPrice) || 0;
  const salePrice =
    formData.salePrice !== "" && formData.salePrice !== null
      ? Number(formData.salePrice)
      : null;
  const discountPercent =
    regularPrice > 0 && salePrice !== null && salePrice < regularPrice
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  const stock = Number(formData.stock) || 0;

  // Active color variant if any
  const activeColor =
    colorVariants[selectedColorIdx] || colorVariants[0] || null;
  const currentStock = activeColor ? Number(activeColor.stock) || 0 : stock;
  const effectivePrice =
    activeColor?.priceOverride != null
      ? Number(activeColor.priceOverride)
      : salePrice ?? regularPrice;

  // Format currency helper
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Completion checklist items with targeted section IDs for jump
  const checklist = [
    {
      label: "Product Title",
      ok: Boolean(formData.title?.trim().length >= 3),
      sectionId: "section-general",
    },
    {
      label: "Category Selected",
      ok: Boolean(formData.category),
      sectionId: "section-general",
    },
    {
      label: "Brand Selected",
      ok: Boolean(formData.brand),
      sectionId: "section-general",
    },
    {
      label: "Regular Price (MRP)",
      ok: regularPrice > 0,
      sectionId: "section-pricing",
    },
    {
      label: "Product Photo",
      ok: Boolean(primaryPreviewUrl),
      sectionId: "section-media",
    },
  ];

  const completedCount = checklist.filter((c) => c.ok).length;
  const isReady = completedCount === checklist.length;

  const resolvedSlug = productSlug || productId || "";
  const publicStoreUrl = resolvedSlug ? `/product/${resolvedSlug}` : null;

  return (
    <div className="space-y-4 lg:sticky lg:top-[128px]">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-orange-500" />
          <h3 className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
            Live Storefront Preview
          </h3>
        </div>

        {isEditMode && publicStoreUrl && (
          <a
            href={publicStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-sans text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-bold transition-colors group cursor-pointer"
            title="Open customer view in new tab"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        )}
      </div>

      {/* Realistic Interactive Store Product Card */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-white/30 bg-white dark:bg-[#0c0f17] shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden group">
        {/* Contained Ambient Background Glow */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
          <div className="absolute -top-14 -right-14 w-44 h-44 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
        </div>

        {/* Top Image Box */}
        <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-[#07090e] border-b border-slate-300 dark:border-white/15 overflow-hidden flex items-center justify-center">
          {primaryPreviewUrl ? (
            <img
              src={primaryPreviewUrl}
              alt="Preview"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-center p-6 space-y-2 text-slate-400 dark:text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/15 mx-auto flex items-center justify-center text-slate-500 dark:text-slate-400 text-xl">
                📷
              </div>
              <p className="text-xs font-sans font-medium">No Image Uploaded Yet</p>
            </div>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />

          {/* Top-Left Category & Discount */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 max-w-[65%]">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold tracking-wider uppercase bg-black/75 text-white backdrop-blur-md border border-white/20 shadow-xs truncate">
              {formData.categoryName || "Category"}
            </span>

            {discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-sans font-extrabold tracking-wider uppercase bg-rose-500 text-white shadow-md flex items-center gap-1 w-fit">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Featured Keynote Star */}
          {formData.isFeatured && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase bg-amber-500 text-black shadow-md flex items-center gap-1 z-10">
              <Sparkles className="w-3 h-3 fill-black" />
              <span>Keynote</span>
            </div>
          )}

          {/* Bottom Stock Indicator Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold backdrop-blur-md border flex items-center gap-1 shadow-xs ${
                currentStock <= 0
                  ? "bg-rose-500/25 text-rose-200 border-rose-500/40"
                  : currentStock <= 5
                  ? "bg-amber-500/25 text-amber-200 border-amber-500/40"
                  : "bg-emerald-500/25 text-emerald-200 border-emerald-500/40"
              }`}
            >
              <Boxes className="w-3 h-3" />
              <span>
                {currentStock <= 0
                  ? "Out of Stock"
                  : activeColor
                  ? `${activeColor.colorName}: ${currentStock}u`
                  : `Stock: ${currentStock}`}
              </span>
            </span>

            <span
              className={`px-2 py-0.5 rounded-full text-[9.5px] font-sans uppercase tracking-wider backdrop-blur-md border font-bold ${
                formData.isActive
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-500/20 text-slate-300 border-slate-500/40"
              }`}
            >
              {formData.isActive ? "Active" : "Draft"}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3 relative z-10">
          {/* Brand & SKU */}
          <div className="flex items-center justify-between text-xs font-sans text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {formData.brandName || "Brand"}
            </span>
            {formData.sku && (
              <span className="font-mono text-slate-400 text-[10px] truncate max-w-[130px]">
                SKU: {formData.sku}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h4 className="text-sm sm:text-base font-heading font-black text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[2.5rem]">
            {formData.title || "Your Flagship Product Title Appears Here"}
          </h4>

          {/* Interactive Color Swatches Selector */}
          {colorVariants.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between text-[11px] font-sans text-slate-500 dark:text-slate-400">
                <span>Color Finish:</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {activeColor?.colorName || "Standard"}
                  <span
                    className={`ml-1 font-bold ${
                      currentStock <= 0
                        ? "text-rose-500"
                        : currentStock <= 5
                        ? "text-amber-500"
                        : "text-emerald-500"
                    }`}
                  >
                    (
                    {currentStock <= 0
                      ? "Out of Stock"
                      : `${currentStock} in stock`}
                    )
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {colorVariants.map((col, idx) => (
                  <button
                    key={col.colorName + idx}
                    type="button"
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 cursor-pointer shadow-xs ${
                      selectedColorIdx === idx
                        ? "border-orange-500 scale-110 ring-2 ring-orange-500/30"
                        : "border-slate-300 dark:border-white/25 hover:border-slate-400 dark:hover:border-white/50"
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
          <div className="pt-2.5 border-t border-slate-200 dark:border-white/10 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-heading font-black text-slate-900 dark:text-white font-mono">
                {formatINR(effectivePrice)}
              </span>
              {regularPrice > effectivePrice && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {formatINR(regularPrice)}
                </span>
              )}
            </div>

            <span className="text-xs font-sans text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Instant Buy</span>
            </span>
          </div>
        </div>
      </div>

      {/* Public URL Route Pill (In Edit Mode) */}
      {isEditMode && publicStoreUrl && (
        <div className="p-3.5 rounded-2xl border border-slate-300 dark:border-white/20 bg-slate-50/70 dark:bg-[#0c0f17] flex items-center justify-between gap-2 text-xs font-mono shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 truncate">
              /product/{productSlug || productId}
            </span>
          </div>
          <a
            href={publicStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-sans font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Visit</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Validation Checklist Card with Clickable Jump Targets */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-white/20 bg-slate-50/70 dark:bg-[#0c0f17] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-sans uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">
            Publication Checklist
          </h4>
          <span
            className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold border ${
              isReady
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
            }`}
          >
            {completedCount} / {checklist.length} Ready
          </span>
        </div>

        <div className="space-y-1.5">
          {checklist.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onJumpToSection && onJumpToSection(item.sectionId)}
              className="w-full flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-sans hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors group cursor-pointer text-left"
              title={`Click to jump to ${item.label} section`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={
                    item.ok
                      ? "text-slate-700 dark:text-slate-300 font-semibold"
                      : "text-slate-400 dark:text-slate-500 font-medium"
                  }
                >
                  {item.label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {item.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Required
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
