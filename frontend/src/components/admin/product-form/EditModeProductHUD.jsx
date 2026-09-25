import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Package,
  CheckCircle2,
} from "lucide-react";

export default function EditModeProductHUD({
  isEditMode,
  product,
  formData,
  primaryPreviewUrl,
  hasUnsavedChanges,
  isSubmitting,
  onSave,
  onDiscard,
  onReset,
}) {
  const productId = product?._id || "";
  const productSlug = product?.slug || productId;
  const storeUrl = `/product/${productSlug}`;

  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#07090e]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 -mx-3.5 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 lg:px-8 -mt-3.5 sm:-mt-4 py-2.5 sm:py-3.5 transition-all shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Side: Back Navigation, Thumbnail, Clean Breadcrumb & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* Back Navigation */}
          <Link
            to="/admin/products"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors shrink-0"
            title="Return to Product Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Product Thumbnail Avatar (Edit Mode) */}
          {isEditMode && (
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/15 overflow-hidden shrink-0 flex items-center justify-center shadow-xs group">
              {primaryPreviewUrl ? (
                <img
                  src={primaryPreviewUrl}
                  alt="Product thumbnail"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Package className="w-5 h-5 text-slate-400" />
              )}
              <span
                className={`absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ring-2 ring-white dark:ring-[#07090e] ${
                  formData.isActive ? "bg-emerald-500" : "bg-slate-400"
                }`}
                title={formData.isActive ? "Active in Catalog" : "Draft Mode"}
              />
            </div>
          )}

          {/* Clean E-Commerce Header Content */}
          <div className="min-w-0 flex-1">
            {/* Elegant Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-slate-400 dark:text-slate-500 mb-0.5">
              <Link
                to="/admin/products"
                className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
              >
                Products
              </Link>
              <span>/</span>
              {formData.categoryName && (
                <>
                  <span className="hidden md:inline truncate max-w-[120px]">
                    {formData.categoryName}
                  </span>
                  <span className="hidden md:inline">/</span>
                </>
              )}
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {isEditMode ? "Edit Product" : "New Product"}
              </span>
            </div>

            {/* Product Title & Status Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
              <h1 className="text-sm sm:text-base lg:text-xl font-heading font-extrabold text-slate-900 dark:text-white truncate tracking-tight">
                {formData.title || (isEditMode ? "Untitled Product" : "Create New Product")}
              </h1>

              {/* Status Pill */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-wide border shrink-0 ${
                  formData.isActive
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    formData.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                <span>{formData.isActive ? "Live" : "Draft"}</span>
              </span>

              {/* Keynote Featured Tag */}
              {formData.isFeatured && (
                <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  <Sparkles className="w-3 h-3 fill-amber-500" />
                  <span>Featured</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Storefront Link, Unsaved Indicator & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 justify-end shrink-0 w-full sm:w-auto">
          {/* Live Storefront Link Button */}
          {isEditMode && (
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 hover:border-sky-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer group shrink-0"
              title="Preview product on public storefront"
            >
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden xs:inline">View Store</span>
              <span className="xs:hidden">Store</span>
            </a>
          )}

          {/* Sync Status Badge (Desktop only to save mobile space) */}
          {isEditMode && (
            <div className="hidden lg:flex items-center shrink-0">
              {hasUnsavedChanges ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Unsaved</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Synced</span>
                </span>
              )}
            </div>
          )}

          {/* Reset Changes Button (Visible when changes made in Edit Mode) */}
          {isEditMode && hasUnsavedChanges && (
            <button
              type="button"
              onClick={onReset}
              disabled={isSubmitting}
              className="px-2.5 py-1.5 sm:py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-mono font-medium flex items-center gap-1 transition-all cursor-pointer shrink-0"
              title="Discard edits and revert to saved state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Discard Button */}
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSubmitting}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/10 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer text-center justify-center flex items-center shrink-0"
          >
            Discard
          </button>

          {/* Primary Save Changes CTA */}
          <button
            type="button"
            onClick={onSave}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-black font-bold text-xs font-mono flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-[0_0_15px_rgba(56,189,248,0.35)] cursor-pointer disabled:opacity-50 active:scale-98 shrink-0 min-h-[34px] sm:min-h-[38px]"
            title="Save changes (Ctrl+S)"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black shrink-0" />
                <span className="truncate">Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-black shrink-0" />
                <span className="truncate">{isEditMode ? "Save Changes" : "Publish"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
