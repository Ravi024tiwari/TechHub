import React from "react";
import {
  Search,
  X,
  ChevronDown,
  Filter,
  Layers,
  RotateCcw,
  Package,
  Check,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

/**
 * ReturnFilterBar - Industrial-grade search, resolution type dropdown, and status triage controls.
 * Uses fully responsive Radix-powered dropdown to prevent viewport overflow on all device sizes.
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
  const hasActiveFilters = Boolean(statusFilter || typeFilter || searchInput);

  // Status-specific color configurations for tabs
  const getTabColors = (value, isActive) => {
    switch (value) {
      case "":
        return isActive
          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5";
      case "REQUESTED":
        return isActive
          ? "bg-rose-500 text-white font-bold shadow-xs shadow-rose-500/20"
          : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10";
      case "APPROVED":
        return isActive
          ? "bg-sky-500 text-white font-bold shadow-xs shadow-sky-500/20"
          : "text-sky-600 dark:text-sky-400 hover:bg-sky-500/10";
      case "ITEM_RECEIVED":
        return isActive
          ? "bg-indigo-500 text-white font-bold shadow-xs shadow-indigo-500/20"
          : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10";
      case "REPLACEMENT_DISPATCHED":
        return isActive
          ? "bg-purple-500 text-white font-bold shadow-xs shadow-purple-500/20"
          : "text-purple-600 dark:text-purple-400 hover:bg-purple-500/10";
      case "REFUND_PROCESSED":
        return isActive
          ? "bg-emerald-500 text-white font-bold shadow-xs shadow-emerald-500/20"
          : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10";
      case "REJECTED":
        return isActive
          ? "bg-rose-700 text-white font-bold shadow-xs shadow-rose-700/20"
          : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10";
      default:
        return isActive
          ? "bg-amber-500 text-white font-bold shadow-xs"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5";
    }
  };

  const getStatusDot = (value) => {
    switch (value) {
      case "REQUESTED":
        return "bg-rose-500";
      case "APPROVED":
        return "bg-sky-500";
      case "ITEM_RECEIVED":
        return "bg-indigo-500";
      case "REPLACEMENT_DISPATCHED":
        return "bg-purple-500";
      case "REFUND_PROCESSED":
        return "bg-emerald-500";
      case "REJECTED":
        return "bg-rose-700";
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2.5 w-full max-w-full">
      {/* Control Card Container */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0d1017] border-2 border-slate-200 dark:border-white/10 shadow-xs space-y-3">
        {/* Top Controls: Search Input + Resolution Dropdown + Reset */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Box with Clear Button */}
          <div className="relative flex-1 w-full min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search RMA # (e.g. RMA-2026), Order #, customer or SKU..."
              className="w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#121622] border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500 font-sans transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Resolution Type Dropdown & Reset Action */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex-1 md:flex-none inline-flex items-center justify-between gap-2.5 px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#121622] hover:bg-slate-100/80 dark:hover:bg-white/[0.05] border border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-200 text-xs font-heading font-semibold transition-all cursor-pointer shadow-2xs group min-w-0"
                  aria-label="Filter by resolution type"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">
                      {typeFilter === "RETURN_AND_REFUND"
                        ? "Return & Refund"
                        : typeFilter === "REPLACEMENT"
                        ? "Hardware Replacement"
                        : "All Resolution Types"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0 ml-1" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-[calc(100vw-2.5rem)] sm:w-56 p-1.5 z-50 max-w-sm"
              >
                <DropdownMenuItem
                  onClick={() => setTypeFilter("")}
                  className={`cursor-pointer justify-between text-xs font-sans ${
                    typeFilter === ""
                      ? "font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>All Resolution Types</span>
                  </div>
                  {typeFilter === "" && <Check className="w-3.5 h-3.5 text-amber-500" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setTypeFilter("RETURN_AND_REFUND")}
                  className={`cursor-pointer justify-between text-xs font-sans ${
                    typeFilter === "RETURN_AND_REFUND"
                      ? "font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 dark:bg-sky-500/15"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-sky-500" />
                    <span>Return &amp; Refund</span>
                  </div>
                  {typeFilter === "RETURN_AND_REFUND" && (
                    <Check className="w-3.5 h-3.5 text-sky-500" />
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setTypeFilter("REPLACEMENT")}
                  className={`cursor-pointer justify-between text-xs font-sans ${
                    typeFilter === "REPLACEMENT"
                      ? "font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/15"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-purple-500" />
                    <span>Hardware Replacement</span>
                  </div>
                  {typeFilter === "REPLACEMENT" && (
                    <Check className="w-3.5 h-3.5 text-purple-500" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("");
                  setTypeFilter("");
                  setSearchInput("");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-heading font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                title="Reset all filters"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Status Filter Tabs (Horizontal Scrollable) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-white/5 scrollbar-none snap-x touch-pan-x">
          {statusFilters.map((tab) => {
            const count = tab.countKey ? metrics[tab.countKey] : undefined;
            const isTabActive = statusFilter === tab.value;
            const dotColor = getStatusDot(tab.value);

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 snap-start inline-flex items-center gap-1.5 cursor-pointer active:scale-95 ${getTabColors(
                  tab.value,
                  isTabActive
                )}`}
              >
                {dotColor && !isTabActive && (
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                )}
                <span>{tab.label}</span>
                {count !== undefined && (
                  <span
                    className={`text-[10px] font-mono ${
                      isTabActive
                        ? "text-white/90"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry Indicator & Active Filter Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>
            Showing <strong className="text-slate-900 dark:text-white font-mono">{totalShowing}</strong> of{" "}
            <strong className="text-slate-900 dark:text-white font-mono">{metrics.total}</strong> reverse RMA tickets
          </span>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                Status: {statusFilter.replace(/_/g, " ")}
                <button
                  type="button"
                  onClick={() => setStatusFilter("")}
                  className="hover:text-rose-500 ml-0.5 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {typeFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                Type: {typeFilter === "REPLACEMENT" ? "Replacement" : "Refund"}
                <button
                  type="button"
                  onClick={() => setTypeFilter("")}
                  className="hover:text-rose-500 ml-0.5 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {searchInput && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 truncate max-w-[150px]">
                Search: "{searchInput}"
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="hover:text-rose-500 ml-0.5 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
