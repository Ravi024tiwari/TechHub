import React from "react";
import Sparkline from "./Sparkline";

/**
 * Enterprise Production KPI Card:
 * - High-density responsive card layout matching Profile/Wishlist aesthetic.
 * - Ambient gradient hover aura.
 * - Bold headline value in font-heading with tight tracking.
 * - Mini inline SVG sparkline curve.
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
    <div className="w-[62vw] min-w-[210px] max-w-[245px] sm:w-auto sm:max-w-none flex-shrink-0 sm:flex-shrink snap-start p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 hover:border-sky-500/40 dark:hover:border-sky-500/30 shadow-xs hover:shadow-xl dark:hover:shadow-black/60 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group select-none">
      {/* Ambient hover glow */}
      <div
        className={`absolute -right-12 -top-12 w-32 h-32 ${glowColor} rounded-full blur-2xl pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity duration-500`}
      />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div
          className={`p-2 sm:p-2.5 rounded-xl border shadow-xs ${iconBg}`}
        >
          {Icon && <Icon className="w-4 h-4" />}
        </div>
        <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2 relative z-10">
        <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight truncate">
          {value}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline
            data={sparklineData}
            color={sparklineColor}
            className="w-12 sm:w-16 h-6 sm:h-7 shrink-0"
          />
        )}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-1 text-[10px] sm:text-xs relative z-10">
        <span className={`${trendColor} font-mono font-bold inline-flex items-center gap-0.5`}>
          {TrendIcon && <TrendIcon className="w-3 h-3 shrink-0" />}
          <span>{trendText}</span>
        </span>
        {subText && (
          <span className="text-slate-400 dark:text-slate-500 text-[10px] sm:text-[11px] font-sans truncate">
            {subText}
          </span>
        )}
      </div>
    </div>
  );
}
