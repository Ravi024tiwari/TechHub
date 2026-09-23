import React, { useState } from "react";
import {
  Cpu,
  Layers,
  ShieldCheck,
  Package,
  CheckCircle2,
  Truck,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  Check,
  FileText,
  BadgeCheck,
  Zap
} from "lucide-react";

export default function SpecsHighlightsTabs({ product }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!product) return null;

  const specifications = product.specifications || {};
  const highlights = product.highlights || {};
  const features = highlights.features || [];
  const inTheBox = highlights.inTheBox || [];
  const warranty = highlights.warranty || {};

  // Formatted spec labels
  const formatSpecKey = (key = "") => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const brandName = product.brandName || product.brand?.name || "GENUINE";
  const categoryName = product.categoryName || product.category?.name || "Electronics";
  const modelSku = product.sku || "OEM-VERIFIED";

  return (
    <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-white/10 text-left w-full">
      {/* =========================================================================
          TAB NAVIGATION HEADER: Centered Segmented Capsule Dock
          ========================================================================= */}
      <div className="flex items-center justify-center w-full pt-2 pb-2">
        <div className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-2xl sm:rounded-full bg-white dark:bg-[#0c0e14] border-2 border-slate-200 dark:border-white/10 shadow-sm max-w-full overflow-x-auto custom-scrollbar gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-heading transition-all cursor-pointer whitespace-nowrap border-2 ${
              activeTab === "overview"
                ? "bg-slate-900 text-white border-slate-900 dark:bg-sky-500/20 dark:border-sky-400 dark:shadow-md dark:shadow-sky-500/15 scale-102"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            <span className={activeTab === "overview" ? "text-white font-extrabold" : "text-slate-700 dark:text-slate-300 font-semibold"}>
              Overview & Highlights
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-heading transition-all cursor-pointer whitespace-nowrap border-2 ${
              activeTab === "specs"
                ? "bg-slate-900 text-white border-slate-900 dark:bg-purple-500/20 dark:border-purple-400 dark:shadow-md dark:shadow-purple-500/15 scale-102"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
            <span className={activeTab === "specs" ? "text-white font-extrabold" : "text-slate-700 dark:text-slate-300 font-semibold"}>
              Technical Specifications
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("warranty")}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-heading transition-all cursor-pointer whitespace-nowrap border-2 ${
              activeTab === "warranty"
                ? "bg-slate-900 text-white border-slate-900 dark:bg-emerald-500/20 dark:border-emerald-400 dark:shadow-md dark:shadow-emerald-500/15 scale-102"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className={activeTab === "warranty" ? "text-white font-extrabold" : "text-slate-700 dark:text-slate-300 font-semibold"}>
              Warranty & In-The-Box
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: Overview & Key Highlights (Balanced 2-Column Responsive Layout)
          ========================================================================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full animate-in fade-in duration-200">
          {/* LEFT COLUMN: Architecture & Narrative Card */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0c0e14] border-2 border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Product Architecture & Engineering Story
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                  Verified Spec
                </span>
              </div>

              {/* Formatted Description */}
              <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 font-sans whitespace-pre-line">
                {product.description ||
                  "Precision engineered hardware built with enterprise-grade components, rigorous thermal validation, and state-of-the-art industrial design."}
              </p>

              {/* Engineering Highlights Grid (If features present) */}
              {features.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Key Performance Highlights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5"
                      >
                        <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hardware Pillars Trust Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0e14] border-2 border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-heading font-bold text-slate-900 dark:text-white">
                    Insured Express
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Air priority dispatch
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0e14] border-2 border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-heading font-bold text-slate-900 dark:text-white">
                    Official Warranty
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Brand authorized care
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0e14] border-2 border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-heading font-bold text-slate-900 dark:text-white">
                    7-Day Return
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Hassle-free replacement
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Hardware At A Glance Quick Snapshot Widget */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 w-full">
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0e14] border-2 border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Hardware At A Glance
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">
                  Verified
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-mono">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Brand OEM:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{brandName}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Category:</span>
                  <span className="text-slate-900 dark:text-white font-bold capitalize">{categoryName}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Model SKU:</span>
                  <span className="text-slate-900 dark:text-white font-bold truncate max-w-[140px]">{modelSku}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Warranty:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{warranty.duration || "1 Year Manufacturer"}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Service Mode:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{warranty.claimType || "Carry-In Authorized"}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Package Seal:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Genuine Factory</span>
                </div>
              </div>

              {/* View Full Specs Trigger */}
              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className="w-full py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Inspect Technical Matrix →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: Technical Specifications Matrix (Full-Width Symmetrical Grid)
          ========================================================================= */}
      {activeTab === "specs" && (
        <div className="space-y-4 w-full animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Technical Datasheet Matrix
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Verified OEM specifications
            </span>
          </div>

          <div className="rounded-3xl border-2 border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0c0e14] divide-y divide-slate-100 dark:divide-white/5 shadow-sm w-full">
            {Object.entries(specifications).map(([key, value]) => {
              if (!value || typeof value === "object") return null;
              return (
                <div
                  key={key}
                  className="grid grid-cols-1 sm:grid-cols-3 p-4 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {formatSpecKey(key)}
                  </span>
                  <span className="sm:col-span-2 font-heading font-semibold text-slate-900 dark:text-white mt-0.5 sm:mt-0">
                    {String(value)}
                  </span>
                </div>
              );
            })}

            {/* Default core specifications if empty */}
            {Object.keys(specifications).filter((k) => specifications[k] && typeof specifications[k] !== "object").length === 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 text-xs sm:text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Brand</span>
                  <span className="sm:col-span-2 font-heading font-semibold text-slate-900 dark:text-white">{brandName}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 text-xs sm:text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Category</span>
                  <span className="sm:col-span-2 font-heading font-semibold text-slate-900 dark:text-white capitalize">{categoryName}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 text-xs sm:text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Model SKU</span>
                  <span className="sm:col-span-2 font-heading font-semibold text-slate-900 dark:text-white">{modelSku}</span>
                </div>
              </>
            )}

            {/* Custom Specifications (if present) */}
            {specifications.customSpecs &&
              Array.isArray(specifications.customSpecs) &&
              specifications.customSpecs.map((spec, i) => (
                <div
                  key={`custom-${i}`}
                  className="grid grid-cols-1 sm:grid-cols-3 p-4 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {spec.key}
                  </span>
                  <span className="sm:col-span-2 font-heading font-semibold text-slate-900 dark:text-white mt-0.5 sm:mt-0">
                    {spec.value}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: Warranty & In-The-Box Unboxing (Full-Width Grid)
          ========================================================================= */}
      {activeTab === "warranty" && (
        <div className="space-y-6 w-full animate-in fade-in duration-200">
          {/* In The Box Hardware Accessories */}
          {inTheBox.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-500" />
                <span>What's In The Box</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 w-full">
                {inTheBox.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-[#0c0e14] border-2 border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warranty & Guarantee Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0e14] border-2 border-slate-200 dark:border-white/10 shadow-sm space-y-4 w-full">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-heading font-bold text-slate-900 dark:text-white">
                  Official Hardware Warranty Protection
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {warranty.duration || "1 Year Comprehensive Manufacturer Warranty"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Service Mode
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {warranty.claimType || "Carry-In / Brand Authorized Center"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Return Window
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  7 Days Replacement Guarantee
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Authenticity
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  100% Genuine Sealed Hardware
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
