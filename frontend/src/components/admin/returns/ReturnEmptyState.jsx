import React from "react";
import { Package } from "lucide-react";

/**
 * ReturnEmptyState - Clean empty placeholder when no RMA tickets match filters.
 */
export default function ReturnEmptyState({ hasFilters, onReset }) {
  return (
    <div className="py-20 text-center rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 p-8 shadow-xs">
      <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
      <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
        No Return Requests Found
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 font-sans">
        No active RMA applications match the current status and resolution filter criteria.
      </p>
      {hasFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-heading font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-all cursor-pointer"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
