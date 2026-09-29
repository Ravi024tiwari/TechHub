import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Laptop,
  Smartphone,
  Headphones,
  Gamepad2,
  Monitor,
  Cpu,
  Watch,
  Tv,
  ChevronRight,
  TrendingUp,
  Percent,
  DollarSign,
  Package,
} from "lucide-react";

// Categorized fallback names for raw hex ObjectIds
const fallbackCategoryLabels = [
  "Smartphones & Mobile",
  "Laptops & Computing",
  "Audio & Acoustics",
  "Wearables & Smartwatches",
  "Gaming & Consoles",
  "Displays & Monitors",
  "Smart Accessories",
];

// Category icon mapper with extended coverage
const getCategoryIcon = (name = "") => {
  const n = String(name).toLowerCase();
  if (n.includes("laptop") || n.includes("pc") || n.includes("mac")) return Laptop;
  if (n.includes("phone") || n.includes("mobile") || n.includes("galaxy") || n.includes("iphone"))
    return Smartphone;
  if (n.includes("audio") || n.includes("headphone") || n.includes("sound") || n.includes("airpod"))
    return Headphones;
  if (n.includes("watch") || n.includes("wearable")) return Watch;
  if (n.includes("tv") || n.includes("display") || n.includes("monitor")) return Tv;
  if (n.includes("game") || n.includes("gaming") || n.includes("console")) return Gamepad2;
  return Cpu;
};

// Curated vibrant gradient palettes per category
const categoryThemes = [
  {
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    glow: "shadow-orange-500/20",
    bg: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    badge: "text-orange-600 dark:text-orange-400 bg-orange-500/10",
  },
  {
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    glow: "shadow-sky-500/20",
    bg: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    badge: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
  },
  {
    gradient: "from-purple-500 via-violet-500 to-fuchsia-600",
    glow: "shadow-purple-500/20",
    bg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    badge: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
  },
  {
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glow: "shadow-emerald-500/20",
    bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    badge: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  {
    gradient: "from-rose-500 via-pink-500 to-red-600",
    glow: "shadow-rose-500/20",
    bg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    badge: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
  },
];

// Helper to sanitize raw MongoDB ObjectId to human-readable label
const cleanCategoryName = (rawName, idx = 0) => {
  if (!rawName || typeof rawName !== "string") {
    return fallbackCategoryLabels[idx % fallbackCategoryLabels.length];
  }
  // Check if rawName is a 24-char hex ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(rawName.trim())) {
    return fallbackCategoryLabels[idx % fallbackCategoryLabels.length];
  }
  return rawName.trim();
};

export default function CategoryRevenueCard({
  categories = [],
  currencyFormatter,
}) {
  const [activeMode, setActiveMode] = useState("share"); // 'share' | 'revenue' | 'units'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const processedCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      const totalRev =
        categories.reduce((sum, c) => sum + (c.revenue || 0), 0) || 1;
      return categories.map((c, idx) => ({
        name: cleanCategoryName(c.category, idx),
        revenue: c.revenue || 0,
        unitsSold: c.unitsSold || 1,
        percentage: Math.max(1, Math.round(((c.revenue || 0) / totalRev) * 100)),
        theme: categoryThemes[idx % categoryThemes.length],
      }));
    }
    return [];
  }, [categories]);

  return (
    <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-xl hover:border-orange-500/20 transition-all duration-300 flex flex-col justify-between group">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-500/[0.04] dark:bg-orange-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-heading font-bold text-slate-900 dark:text-white">
              Revenue by Category
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-semibold border border-slate-200 dark:border-white/10">
              {processedCategories.length} Categories
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Sales volume & earnings distribution
          </p>
        </div>

        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors group/link shrink-0"
        >
          <span>Catalog</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Interactive Mode Switcher Pills */}
      <div className="relative z-10 flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 mb-4 self-start">
        {[
          { key: "share", label: "% Share", icon: Percent },
          { key: "revenue", label: "Value", icon: DollarSign },
          { key: "units", label: "Units", icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveMode(tab.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-orange-500 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Category List or Empty State */}
      <div className="relative z-10 space-y-2.5">
        {processedCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-7 px-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-2 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <p className="text-sm font-heading font-bold text-slate-800 dark:text-slate-200">
              No Category Sales Yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs font-sans">
              As orders arrive across different hardware categories, revenue distribution will appear here.
            </p>
          </div>
        ) : (
          processedCategories.map((cat, idx) => {
            const Icon = getCategoryIcon(cat.name);
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 border cursor-pointer ${
                  isHovered
                    ? "bg-slate-50 dark:bg-white/[0.04] border-slate-300 dark:border-white/20 shadow-sm translate-x-1"
                    : "bg-transparent border-transparent hover:border-slate-200 dark:hover:border-white/5"
                }`}
              >
                {/* Row Top Info */}
                <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                        cat.theme.bg
                      } ${isHovered ? "scale-110 shadow-md " + cat.theme.glow : ""}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white truncate font-sans text-xs sm:text-[13px]">
                      {cat.name}
                    </span>
                  </div>

                  {/* Right values based on active mode */}
                  <div className="flex items-center gap-2 shrink-0 font-mono text-right">
                    {activeMode === "share" ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans hidden sm:inline">
                          {currencyFormatter
                            ? currencyFormatter(cat.revenue)
                            : `₹${cat.revenue.toLocaleString()}`}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          {cat.percentage}%
                        </span>
                      </div>
                    ) : activeMode === "revenue" ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[10px] text-slate-400">
                          ({cat.unitsSold} pcs)
                        </span>
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          {currencyFormatter
                            ? currencyFormatter(cat.revenue)
                            : `₹${cat.revenue.toLocaleString()}`}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans hidden sm:inline">
                          {cat.percentage}% share
                        </span>
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          {cat.unitsSold} units
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Track with Shimmer & Head Indicator */}
                <div className="relative h-2 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <div
                    style={{ width: `${cat.percentage}%` }}
                    className={`relative h-full rounded-full bg-gradient-to-r ${
                      cat.theme.gradient
                    } transition-all duration-500 ${
                      isHovered ? "brightness-110 shadow-sm" : ""
                    }`}
                  >
                    {/* Subtle leading pulse dot */}
                    {isHovered && (
                      <span className="absolute right-0 top-0 bottom-0 w-1.5 bg-white rounded-full animate-pulse shadow-xs" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer KPI summary */}
      <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>Top Leader:</span>
          <strong className="text-slate-900 dark:text-white font-semibold">
            {processedCategories[0]?.name || "Catalog Active"}
          </strong>
        </span>
        <span className="font-bold text-orange-600 dark:text-orange-400">
          {processedCategories.length > 0 ? `${processedCategories[0].percentage}% Share` : "0% Share"}
        </span>
      </div>
    </div>
  );
}
