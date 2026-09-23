import React from "react";
import { Sparkles, Layers, Tag, Barcode, RefreshCw, FileText, CheckCircle2 } from "lucide-react";

export default function BasicInfoSection({
  formData,
  setFormData,
  categories = [],
  brands = [],
  onGenerateSku,
}) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-white/15 bg-white dark:bg-gradient-to-b dark:from-[#141824] dark:via-[#0d1017] dark:to-[#080a0e] p-3.5 sm:p-6 lg:p-7 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.8),_0_0_15px_rgba(255,255,255,0.05)] space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-sky-400 font-mono font-bold text-xs sm:text-sm shrink-0 mt-0.5 sm:mt-0">
            01
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-heading font-bold text-slate-900 dark:text-white truncate">
              General Information & Taxonomy
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              Set the product's title, brand, category, SKU, and catalog visibility flags.
            </p>
          </div>
        </div>

        {/* Visibility Toggles - Full width row on mobile, never clips */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
            className={`flex-1 sm:flex-initial justify-center px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              formData.isActive
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10"
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${formData.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            <span className="truncate">{formData.isActive ? "Active in Catalog" : "Draft / Hidden"}</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
            className={`flex-1 sm:flex-initial justify-center px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              formData.isFeatured
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 shrink-0 ${formData.isFeatured ? "text-amber-500 dark:text-amber-400 fill-amber-400" : ""}`} />
            <span className="truncate">Keynote Featured</span>
          </button>
        </div>
      </div>

      {/* Product Title */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
            <span>Product Title</span>
            <span className="text-rose-500 dark:text-rose-400">*</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            {formData.title?.length || 0} / 180 characters
          </span>
        </div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. Apple MacBook Pro 16 (M3 Max, 36GB Unified Memory, 1TB SSD) - Space Black"
          maxLength={180}
          required
          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:ring-1 focus:ring-sky-500/20 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
        />
      </div>

      {/* Category & Brand Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Category Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Category</span>
            <span className="text-rose-500 dark:text-rose-400">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => {
                const selectedCat = categories.find((c) => (c._id || c.name) === e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value,
                  categoryName: selectedCat?.name || e.target.value,
                }));
              }}
              required
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 text-xs sm:text-sm font-medium text-slate-900 dark:text-white transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-white dark:bg-[#12141c] text-slate-400 dark:text-slate-500">
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
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Brand Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Brand / Manufacturer</span>
            <span className="text-rose-500 dark:text-rose-400">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.brand}
              onChange={(e) => {
                const selectedBrand = brands.find((b) => (b._id || b.name) === e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  brand: e.target.value,
                  brandName: selectedBrand?.name || e.target.value,
                }));
              }}
              required
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 text-xs sm:text-sm font-medium text-slate-900 dark:text-white transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-white dark:bg-[#12141c] text-slate-400 dark:text-slate-500">
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
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* SKU Generator */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
          <Barcode className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
          <span>SKU (Stock Keeping Unit)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value.toUpperCase() }))}
            placeholder="e.g. APL-MBP-16-M3X-BLK"
            className="flex-1 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 text-xs sm:text-sm font-mono uppercase font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
          />
          <button
            type="button"
            onClick={onGenerateSku}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/15 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Auto-generate SKU based on brand and category"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Auto-Generate</span>
          </button>
        </div>
        <p className="text-[10px] sm:text-[11px] font-mono text-slate-500">
          Leave blank to automatically generate an industrial SKU standard on save.
        </p>
      </div>

      {/* Product Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Product Overview & Description</span>
          <span className="text-rose-500 dark:text-rose-400">*</span>
        </label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Provide an overview of key technical highlights, engineering architecture, build quality, and intended professional workflow..."
          required
          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none resize-y leading-relaxed font-sans"
        />
      </div>
    </div>
  );
}
