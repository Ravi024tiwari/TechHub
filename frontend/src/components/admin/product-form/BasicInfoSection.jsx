import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Tag,
  Barcode,
  RefreshCw,
  FileText,
  Copy,
  Check,
  Globe,
} from "lucide-react";

export default function BasicInfoSection({
  formData,
  setFormData,
  categories = [],
  brands = [],
  onGenerateSku,
}) {
  const [copiedSku, setCopiedSku] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleCopySku = () => {
    if (!formData.sku) return;
    navigator.clipboard.writeText(formData.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const handleSkuGenerateClick = () => {
    setIsSpinning(true);
    onGenerateSku();
    setTimeout(() => setIsSpinning(false), 500);
  };

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-white/30 bg-white dark:bg-[#0c0f17] p-4 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group overflow-hidden space-y-5 sm:space-y-6">
      {/* Contained Ambient Background Glow */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
      </div>

      {/* Section Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200 dark:border-white/15">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-orange-500/10 text-orange-600 dark:text-orange-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-orange-500/30 shrink-0 shadow-xs">
            01
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white truncate">
              General Information & Classification
            </h2>
            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 line-clamp-1">
              Title, brand classification, category taxonomy, and store visibility.
            </p>
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
            }
            className={`flex-1 sm:flex-initial justify-center px-3 py-2 rounded-xl text-xs font-sans font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              formData.isActive
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/15"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                formData.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span className="truncate">
              {formData.isActive ? "Active in Catalog" : "Draft / Hidden"}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))
            }
            className={`flex-1 sm:flex-initial justify-center px-3 py-2 rounded-xl text-xs font-sans font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              formData.isFeatured
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/15 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles
              className={`w-3.5 h-3.5 shrink-0 ${
                formData.isFeatured
                  ? "text-amber-500 dark:text-amber-400 fill-amber-400"
                  : ""
              }`}
            />
            <span className="truncate">Featured</span>
          </button>
        </div>
      </div>

      {/* Product Title */}
      <div className="relative z-10 space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
            <span>Product Title</span>
            <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {formData.title?.length || 0} / 180 chars
          </span>
        </div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="e.g. Apple MacBook Pro 16 (M3 Max, 36GB Unified Memory, 1TB SSD) - Space Black"
          maxLength={180}
          required
          className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm font-sans font-semibold text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-hidden shadow-xs"
        />
      </div>

      {/* Category & Brand Selectors */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Category Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-orange-500" />
            <span>Category</span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => {
                const selectedCat = categories.find(
                  (c) => (c._id || c.name) === e.target.value
                );
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value,
                  categoryName: selectedCat?.name || e.target.value,
                }));
              }}
              required
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm font-sans font-medium text-slate-900 dark:text-white transition-all outline-hidden appearance-none cursor-pointer shadow-xs"
            >
              <option
                value=""
                disabled
                className="bg-white dark:bg-[#12141c] text-slate-400"
              >
                Select Hardware Category...
              </option>
              {categories.map((cat) => (
                <option
                  key={cat._id || cat.name}
                  value={cat._id || cat.slug || cat.name}
                  className="bg-white dark:bg-[#12141c] text-slate-900 dark:text-white"
                >
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Brand Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            <span>Brand / Manufacturer</span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.brand}
              onChange={(e) => {
                const selectedBrand = brands.find(
                  (b) => (b._id || b.name) === e.target.value
                );
                setFormData((prev) => ({
                  ...prev,
                  brand: e.target.value,
                  brandName: selectedBrand?.name || e.target.value,
                }));
              }}
              required
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm font-sans font-medium text-slate-900 dark:text-white transition-all outline-hidden appearance-none cursor-pointer shadow-xs"
            >
              <option
                value=""
                disabled
                className="bg-white dark:bg-[#12141c] text-slate-400"
              >
                Select Brand / Manufacturer...
              </option>
              {brands.map((b) => (
                <option
                  key={b._id || b.name}
                  value={b._id || b.slug || b.name}
                  className="bg-white dark:bg-[#12141c] text-slate-900 dark:text-white"
                >
                  {b.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* SKU Generator */}
      <div className="relative z-10 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
            <Barcode className="w-3.5 h-3.5 text-violet-500" />
            <span>SKU (Stock Keeping Unit)</span>
          </label>
          {formData.sku && (
            <button
              type="button"
              onClick={handleCopySku}
              className="flex items-center gap-1 text-[11px] font-mono text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              {copiedSku ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy SKU</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={formData.sku}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sku: e.target.value.toUpperCase(),
              }))
            }
            placeholder="e.g. APL-MBP-16-M3X-BLK"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm font-mono uppercase font-bold text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-hidden shadow-xs"
          />
          <button
            type="button"
            onClick={handleSkuGenerateClick}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-300 dark:border-white/20 text-xs font-sans font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs active:scale-95"
            title="Auto-generate SKU based on brand and category"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-orange-500 ${
                isSpinning ? "animate-spin" : ""
              }`}
            />
            <span className="hidden xs:inline">Auto-Generate</span>
          </button>
        </div>
        <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
          Leave blank to automatically generate an industrial SKU on save.
        </p>
      </div>

      {/* Product Description */}
      <div className="relative z-10 space-y-1.5">
        <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Product Overview & Description</span>
          <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Provide an overview of key technical highlights, engineering architecture, build quality, and intended professional workflow..."
          required
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-hidden resize-y leading-relaxed font-sans shadow-xs"
        />
      </div>
    </div>
  );
}
