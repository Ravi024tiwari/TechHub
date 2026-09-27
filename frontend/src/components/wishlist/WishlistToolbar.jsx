import React, { useRef, useEffect } from "react";
import {
  Search,
  X,
  LayoutGrid,
  List,
  ArrowUpDown,
  CheckCircle2,
  SlidersHorizontal,
  Package,
} from "lucide-react";

/**
 * Production-Grade Wishlist Toolbar:
 * - Real-time keyword search with instant clear & keyboard autofocus hint.
 * - Dynamic category filter chips with live item counts and active highlights.
 * - In-Stock Only filter switch.
 * - Multi-criteria sort selector (Recently Added, Price Low-High, Price High-Low, Discount).
 * - Interactive View Mode Switcher (Grid vs List) with tactile feedback.
 */
export default function WishlistToolbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalCount = 0,
  filteredCount = 0,
  onlyInStock = false,
  setOnlyInStock,
}) {
  const searchInputRef = useRef(null);

  // Keyboard shortcut listener: press '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "/" &&
        document.activeElement !== searchInputRef.current &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-4 mb-6">
      {/* Top Bar: Search, In-Stock Quick Filter, Sort & View Mode Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input with quick key shortcut indicator */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved hardware, brands, specs..."
            className="w-full pl-10 pr-16 py-2.5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-xs"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/10 rounded border border-slate-200 dark:border-white/10">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Right Controls: In-Stock Toggle, Sort & Dual View Switcher */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5">
          {/* Quick In-Stock Switch */}
          {setOnlyInStock && (
            <button
              type="button"
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer ${
                onlyInStock
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                  : "bg-white dark:bg-[#0c0f17] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Show only currently in-stock items"
            >
              <Package className="h-3.5 w-3.5 shrink-0" />
              <span>In-Stock Only</span>
            </button>
          )}

          {/* Sort Selector */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="hidden sm:inline font-mono text-[11px] text-slate-400">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer pr-1"
              >
                <option
                  value="recent"
                  className="bg-white dark:bg-[#0c0f17] text-slate-900 dark:text-white"
                >
                  Recently Added
                </option>
                <option
                  value="price-asc"
                  className="bg-white dark:bg-[#0c0f17] text-slate-900 dark:text-white"
                >
                  Price: Low to High
                </option>
                <option
                  value="price-desc"
                  className="bg-white dark:bg-[#0c0f17] text-slate-900 dark:text-white"
                >
                  Price: High to Low
                </option>
                <option
                  value="discount"
                  className="bg-white dark:bg-[#0c0f17] text-slate-900 dark:text-white"
                >
                  Highest Discount
                </option>
              </select>
            </div>
          </div>

          {/* View Mode Switcher: Card / Grid vs Detailed List */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-[#141824] text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200 dark:border-orange-500/30 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Grid Card View"
              aria-label="Grid Card View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden xs:inline text-[11px] font-mono">Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#141824] text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200 dark:border-orange-500/30 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Detailed List View"
              aria-label="Detailed List View"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden xs:inline text-[11px] font-mono">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Chips Bar */}
      {categories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
              selectedCategory === "all"
                ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25 font-bold"
                : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
            }`}
          >
            All Products ({totalCount})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.name
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25 font-bold"
                  : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}

          {/* Showing Results Indicator */}
          {filteredCount !== totalCount && (
            <span className="text-[11px] font-mono text-slate-400 ml-auto hidden sm:inline shrink-0">
              Showing {filteredCount} of {totalCount} items
            </span>
          )}
        </div>
      )}
    </div>
  );
}
