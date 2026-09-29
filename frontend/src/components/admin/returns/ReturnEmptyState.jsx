import React from "react";
import { Package, RotateCcw } from "lucide-react";

/**
 * ReturnEmptyState - Clean empty placeholder when no RMA tickets match filters.
 */
export default function ReturnEmptyState({ hasFilters, onReset }) {
  return (
    <div className="py-16 sm:py-20 text-center rounded-2xl bg-white dark:bg-[#0d1017] border-2 border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto mb-3.5">
        <Package className="w-7 h-7" />
      </div>
      <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
        No Return Requests Found
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 font-sans">
        No active RMA applications match the current status and resolution filter criteria.
      </p>
      {hasFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );
}
