import React from "react";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Grid3X3,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";

/**
 * Catalog Toolbar:
 * - Mobile filter sheet trigger with active count badge.
 * - Enterprise sort options dropdown.
 * - View mode switcher (Comfortable Grid vs Compact Grid vs List).
 * - Live item count display.
 */
export default function CatalogToolbar({
  totalProducts = 0,
  currentPage = 1,
  limit = 12,
  sort = "",
  viewMode = "grid-4",
  onSortChange,
  onViewModeChange,
  onOpenMobileFilters,
  activeFilterCount = 0,
  className = "",
}) {
  const startIndex = totalProducts === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalProducts);

  const sortOptions = [
    { value: "", label: "Newest Arrivals" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Customer Rating" },
    { value: "popular", label: "Most Popular" },
  ];

  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm text-xs ${className}`}
    >
      {/* Left: Results Count & Mobile Filter Trigger */}
      <div className="flex items-center justify-between sm:justify-start gap-3">
        {/* Mobile Filter Trigger Button */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="h-4 min-w-4 px-1 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Results Counter Text */}
        <div className="text-slate-600 dark:text-slate-400 font-medium">
          {totalProducts > 0 ? (
            <span>
              Showing <strong className="text-slate-950 dark:text-white">{startIndex}–{endIndex}</strong> of{" "}
              <strong className="text-slate-950 dark:text-white">{totalProducts}</strong> products
            </span>
          ) : (
            <span>0 products found</span>
          )}
        </div>
      </div>

      {/* Right: Sort Dropdown & Layout Mode Switcher */}
      <div className="flex items-center justify-end gap-2.5 sm:gap-3">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="catalog-sort"
            className="hidden md:inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-tech uppercase tracking-wider text-[11px]"
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>Sort by:</span>
          </label>
          <div className="relative">
            <select
              id="catalog-sort"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-medium focus:outline-none focus:border-sky-500 cursor-pointer appearance-none transition-colors"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ArrowUpDown className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* View Mode Toggle (Grid vs List on Desktop) */}
        <div className="hidden sm:flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onViewModeChange("grid-4")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "grid-4"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-white shadow-xs"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
            title="Compact 4-column Grid"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid-3")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "grid-3"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-white shadow-xs"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
            title="Comfortable 3-column Grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
