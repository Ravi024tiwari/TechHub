import React from "react";
import Sparkline from "./Sparkline";

/**
 * Enterprise Production KPI Card:
 * - Compact mobile layout: 44vw wide, 2 cards visible simultaneously.
 * - High-density responsive card layout matching Profile/Wishlist aesthetic.
 * - Ambient gradient hover aura.
 * - Bold headline value in font-heading with tight tracking.
 * - Mini inline SVG sparkline curve (hidden on mobile to save space).
 * - Micro trend indicator badge in font-mono.
 */
export default function DashboardKpiCard({
  icon: Icon,
  iconBg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  title,
  value,
  sparklineData = [],
  sparklineColor = "#10b981",
  trendIcon: TrendIcon,
  trendText,
  trendColor = "text-emerald-600 dark:text-emerald-400",
  subText = "vs last period",
  glowColor = "bg-emerald-500/5",
}) {
  return (
    <div className="w-[44vw] min-w-[150px] max-w-[200px] sm:w-auto sm:max-w-none flex-shrink-0 sm:flex-shrink snap-start p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 hover:border-sky-500/40 dark:hover:border-sky-500/30 shadow-xs hover:shadow-xl dark:hover:shadow-black/60 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group select-none">
      {/* Ambient hover glow */}
      <div
        className={`absolute -right-12 -top-12 w-32 h-32 ${glowColor} rounded-full blur-2xl pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity duration-500`}
      />

      {/* Icon + Title row */}
      <div className="flex items-center justify-between mb-2 sm:mb-3 relative z-10">
        <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-xs ${iconBg}`}>
          {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </div>
        <span className="text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 text-right leading-tight max-w-[80px] sm:max-w-none">
          {title}
        </span>
      </div>

      {/* Value + Sparkline row */}
      <div className="flex items-baseline justify-between gap-1 sm:gap-2 relative z-10">
        <div className="text-base sm:text-2xl lg:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight truncate">
          {value}
        </div>
        {/* Sparkline hidden on mobile — not legible at small size */}
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline
            data={sparklineData}
            color={sparklineColor}
            className="hidden sm:block w-16 h-7 shrink-0"
          />
        )}
      </div>

      {/* Trend footer */}
      <div className="mt-2 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-1 text-[9px] sm:text-xs relative z-10">
        <span className={`${trendColor} font-mono font-bold inline-flex items-center gap-0.5`}>
          {TrendIcon && <TrendIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />}
          <span className="truncate max-w-[60px] sm:max-w-none">{trendText}</span>
        </span>
        {subText && (
          <span className="text-slate-500 dark:text-slate-500 text-[9px] sm:text-[11px] font-sans truncate hidden xs:inline sm:inline">
            {subText}
          </span>
        )}
      </div>
    </div>
  );
}
