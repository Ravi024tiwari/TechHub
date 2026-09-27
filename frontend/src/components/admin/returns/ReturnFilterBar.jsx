import React from "react";
import { Search, X } from "lucide-react";

/**
 * ReturnFilterBar - Status filter tabs, search input, resolution type select, and reset button.
 */
export default function ReturnFilterBar({
  statusFilters,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  searchInput,
  setSearchInput,
  metrics,
  totalShowing,
}) {
  return (
    <div className="space-y-3.5 w-full max-w-full">
      {/* Status Pills with Dynamic Counts (Horizontal Scroll on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth snap-x touch-pan-x [-webkit-overflow-scrolling:touch] w-full max-w-full">
        {statusFilters.map((tab) => {
          const count = tab.countKey ? metrics[tab.countKey] : undefined;
          const isTabActive = statusFilter === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-heading font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 snap-start active:scale-95 ${
                isTabActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 border border-orange-400/40"
                  : "bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-xs"
              }`}
            >
              <span>{tab.label}</span>
              {count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isTabActive
                      ? "bg-black/25 text-white"
                      : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Box with Clear Button */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by RMA Number (e.g. RMA-2026), Order Number, or Customer..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 shadow-xs font-sans"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type Filter & Reset Action */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl text-xs font-heading font-bold bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-orange-500 cursor-pointer shadow-xs"
          >
            <option value="">All Resolution Types</option>
            <option value="RETURN_AND_REFUND">Return &amp; Refund Only</option>
            <option value="REPLACEMENT">Hardware Replacement Only</option>
          </select>

          {(statusFilter || typeFilter || searchInput) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("");
                setTypeFilter("");
                setSearchInput("");
              }}
              className="px-3.5 py-2 rounded-2xl text-xs font-heading font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              title="Reset all search filters"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Live Filter Indicator Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>
            Showing <strong className="text-slate-900 dark:text-white font-mono">{totalShowing}</strong> of{" "}
            <strong className="text-slate-900 dark:text-white font-mono">{metrics.total}</strong> reverse RMA tickets
          </span>
        </div>
        {statusFilter && (
          <span className="text-[11px] font-sans text-orange-600 dark:text-orange-400 font-semibold">
            Filter: {statusFilter.replace(/_/g, " ")}
          </span>
        )}
      </div>
    </div>
  );
}
