import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Enterprise Production Error State for Admin Dashboard:
 * - Friendly message with retry connection CTA.
 */
export default function DashboardErrorState({ error, onRetry }) {
  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    "Unable to connect to the store database.";

  return (
    <div className="glass-card p-8 text-center max-w-lg mx-auto my-12 space-y-4">
      <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-heading font-bold text-white">
        Failed to load store analytics
      </h3>
      <p className="text-xs text-slate-400">{errorMessage}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
