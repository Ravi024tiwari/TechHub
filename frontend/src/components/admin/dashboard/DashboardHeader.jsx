import React, { useMemo } from "react";
import { RefreshCw, Download, ChevronDown, Activity, Sparkles } from "lucide-react";

/**
 * Enterprise Production Dashboard Header:
 * - Dynamic time-of-day greeting (Good morning/afternoon/evening).
 * - Cache freshness badge showing 2-minute status.
 * - Interactive timeframe dropdown (7d, 30d, 90d, 1y).
 * - Force sync button with spin animation.
 * - Export executive CSV report button.
 */
export default function DashboardHeader({
  userName = "Administrator",
  lastSyncText = "Synced just now",
  timeframe = "30d",
  setTimeframe,
  onRefresh,
  isRefreshing = false,
  onExport,
}) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-2 font-bold border border-sky-500/20 shadow-xs">
          <Activity className="h-3 w-3" />
          <span>Real-Time Command Center</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>
            {greeting}, {userName}
          </span>
          <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
        </h1>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans">
            Here's what's happening across your hardware storefront today.
          </p>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
          {/* 2-Min Smart Cache Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>{lastSyncText}</span>
          </div>
        </div>
      </div>

      {/* Action Controls: Timeframe Selector, Refresh & Export */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Timeframe Dropdown */}
        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c0f17] hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all shadow-xs"
          >
            <option value="7d" className="bg-white dark:bg-[#0c0f17] text-slate-900 dark:text-white">
              Last 7 Days
            </option>
            <option value="30d" className="bg-white dark:bg-[#0c0f17] text-slate-900 dark:text-white">
              Last 30 Days
            </option>
            <option value="90d" className="bg-white dark:bg-[#0c0f17] text-slate-900 dark:text-white">
              Last 90 Days
            </option>
            <option value="1y" className="bg-white dark:bg-[#0c0f17] text-slate-900 dark:text-white">
              Last 1 Year
            </option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Smart Cache Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 sm:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#0c0f17] hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/10 transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
          title="Force refresh live database stats"
          aria-label="Refresh dashboard"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              isRefreshing ? "animate-spin text-sky-500" : ""
            }`}
          />
        </button>

        {/* Export Report CTA */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
}
