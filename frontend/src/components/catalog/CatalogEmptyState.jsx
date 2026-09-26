import React from "react";
import { RotateCcw, PackageSearch, Sparkles, ArrowRight } from "lucide-react";

export default function CatalogEmptyState({
  onResetFilters,
  onSelectCategory,
  className = "",
}) {
  const quickCategories = [
    { label: "Laptops", slug: "laptops" },
    { label: "Smartphones", slug: "smartphones" },
    { label: "Audio Gear", slug: "audio" },
    { label: "Gaming", slug: "gaming" },
  ];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-14 bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm ${className}`}
    >
      <div className="relative mb-5">
        <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-inner">
          <PackageSearch className="h-10 w-10 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md animate-bounce">
          <span className="text-xs font-bold font-mono">0</span>
        </div>
      </div>

      <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
        No Matching Hardware Found
      </h3>

      <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
        We couldn't find any electronics matching your precise filter criteria or search keyword. Try clearing some filters or exploring popular categories.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-heading font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 w-full max-w-sm">
        <span className="text-[11px] font-tech text-slate-400 uppercase tracking-widest block mb-3">
          Popular Departments
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {quickCategories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
