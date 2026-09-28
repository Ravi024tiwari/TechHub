import React, { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Grid3X3,
  LayoutGrid,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Star,
  Flame,
  Check,
  ChevronDown,
} from "lucide-react";

/**
 * Catalog Toolbar:
 * - Mobile filter sheet trigger with active count badge.
 * - Custom interactive Sort dropdown with glassmorphic cyber styling.
 * - View mode switcher (Comfortable Grid vs Compact Grid).
 * - Live item count display with emerald pulse.
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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  const startIndex = totalProducts === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalProducts);

  const sortOptions = [
    { value: "", label: "Newest Arrivals", icon: Sparkles },
    { value: "price_asc", label: "Price: Low to High", icon: ArrowUp },
    { value: "price_desc", label: "Price: High to Low", icon: ArrowDown },
    { value: "rating", label: "Customer Rating", icon: Star },
    { value: "popular", label: "Most Popular", icon: Flame },
  ];

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsSortOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const activeOption =
    sortOptions.find((opt) => opt.value === sort) || sortOptions[0];
  const ActiveIcon = activeOption.icon;

  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-xs text-xs ${className}`}
    >
      {/* Mobile Control Strip: Filter Button + Custom Sort Dropdown Side-by-Side (Full Width on Mobile) */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* Mobile Filter Trigger Button */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="lg:hidden flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-2xs hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="h-4.5 min-w-4.5 px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Custom Interactive Sort Dropdown with Cyber Styling */}
        <div ref={sortRef} className="flex-1 sm:flex-none relative">
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            aria-expanded={isSortOpen}
            aria-haspopup="listbox"
            className={`w-full sm:w-auto h-9 px-3 rounded-xl flex items-center justify-between gap-2 border transition-all cursor-pointer select-none text-xs font-medium ${
              isSortOpen
                ? "bg-orange-500/10 dark:bg-orange-500/15 border-orange-500/40 text-orange-600 dark:text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.15)]"
                : "bg-slate-100/90 dark:bg-white/[0.05] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <ActiveIcon className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span className="truncate">{activeOption.label}</span>
            </div>
            <ChevronDown
              className={`h-3 w-3 text-slate-400 transition-transform duration-200 shrink-0 ${
                isSortOpen ? "rotate-180 text-orange-500" : ""
              }`}
            />
          </button>

          {/* Custom Popover Dropdown Menu (No native OS select) */}
          {isSortOpen && (
            <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-1.5 w-52 sm:w-56 rounded-2xl bg-white dark:bg-[#0c101c] border border-slate-200 dark:border-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
              <div className="px-2 py-1 text-[10px] font-tech uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Sort Hardware By
              </div>
              <div className="space-y-0.5">
                {sortOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = (sort || "") === opt.value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onSortChange(opt.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-heading transition-all cursor-pointer ${
                        isSelected
                          ? "bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isSelected
                              ? "text-orange-500"
                              : "text-slate-400 group-hover:text-orange-400"
                          }`}
                        />
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-orange-500 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle (Grid vs List on Desktop) */}
        <div className="hidden sm:flex items-center rounded-xl bg-slate-100 dark:bg-slate-900/80 p-0.5 border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => onViewModeChange("grid-4")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "grid-4"
                ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
            title="Compact 4-column Grid"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid-3")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "grid-3"
                ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
            title="Comfortable 3-column Grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results Counter Text */}
      <div className="flex items-center justify-between sm:justify-start text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium pt-1 sm:pt-0 border-t border-slate-100 dark:border-white/5 sm:border-0">
        {totalProducts > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{startIndex}–{endIndex}</strong> of{" "}
              <strong className="text-slate-900 dark:text-white">{totalProducts}</strong> products
            </span>
          </div>
        ) : (
          <span>0 products found</span>
        )}
      </div>
    </div>
  );
}
