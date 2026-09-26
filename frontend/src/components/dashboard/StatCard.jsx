import React from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = "sky",
  badgeText,
  pulse = false,
  trend,
  onClick,
}) {
  const colorMap = {
    orange: {
      bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
      glow: "hover:border-orange-500/50 hover:shadow-orange-500/15 hover:shadow-lg",
      dot: "bg-orange-500",
      borderHover: "group-hover:border-orange-500/40",
      beam: "from-orange-500/25 via-amber-500/10 to-transparent",
    },
    amber: {
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      glow: "hover:border-amber-500/50 hover:shadow-amber-500/15 hover:shadow-lg",
      dot: "bg-amber-500",
      borderHover: "group-hover:border-amber-500/40",
      beam: "from-amber-500/25 via-amber-500/10 to-transparent",
    },
    emerald: {
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      glow: "hover:border-emerald-500/50 hover:shadow-emerald-500/15 hover:shadow-lg",
      dot: "bg-emerald-500",
      borderHover: "group-hover:border-emerald-500/40",
      beam: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    },
    purple: {
      bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
      glow: "hover:border-purple-500/50 hover:shadow-purple-500/15 hover:shadow-lg",
      dot: "bg-purple-500",
      borderHover: "group-hover:border-purple-500/40",
      beam: "from-purple-500/20 via-purple-500/5 to-transparent",
    },
  };

  const style = colorMap[accentColor] || colorMap.orange;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 p-3.5 sm:p-5 shadow-xs hover:-translate-y-1 transition-all duration-300 ${style.glow} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Ambient gradient top highlight */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.beam} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
        <div
          className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 shadow-xs ${style.bg}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        <div className="flex items-center gap-1.5">
          {badgeText && (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-tech font-bold uppercase tracking-wider border ${style.bg}`}
            >
              {pulse && (
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-1.5 w-1.5 ${style.dot}`}
                  />
                </span>
              )}
              {badgeText}
            </span>
          )}

          {trend && (
            <span className="text-[10px] font-mono font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              {trend}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-0.5">
        <div className="text-base sm:text-2xl font-black font-heading tracking-tight text-slate-900 dark:text-white truncate">
          {value}
        </div>
        <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
          {title}
        </p>
      </div>

      {subtitle && (
        <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
          {subtitle}
        </p>
      )}

      {/* Subtle corner light reflection */}
      <div className="absolute -bottom-8 -right-8 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-transparent to-current opacity-5 pointer-events-none rounded-full blur-xl group-hover:opacity-15 transition-opacity" />
    </div>
  );
}
