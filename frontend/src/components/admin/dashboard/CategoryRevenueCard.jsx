import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Laptop, Smartphone, Headphones, Gamepad2, Monitor, Cpu, ChevronRight } from "lucide-react";

// Category icon mapper
const getCategoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("laptop")) return Laptop;
  if (n.includes("phone")) return Smartphone;
  if (n.includes("audio") || n.includes("headphone")) return Headphones;
  if (n.includes("game") || n.includes("gaming")) return Gamepad2;
  if (n.includes("monitor") || n.includes("display")) return Monitor;
  return Cpu;
};

// Gradient generator per category for the progress bars
const categoryColors = [
  { bar: "from-sky-400 to-blue-600", dot: "#38bdf8" },
  { bar: "from-purple-400 to-indigo-600", dot: "#a855f7" },
  { bar: "from-emerald-400 to-teal-600", dot: "#10b981" },
  { bar: "from-amber-400 to-orange-600", dot: "#f59e0b" },
  { bar: "from-rose-400 to-pink-600", dot: "#f43f5e" },
  { bar: "from-slate-300 to-slate-500", dot: "#94a3b8" },
];

export default function CategoryRevenueCard({
  categories = [],
  currencyFormatter,
}) {
  const processedCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      const totalRev = categories.reduce((sum, c) => sum + (c.revenue || 0), 0) || 1;
      return categories.map((c, idx) => ({
        name: c.category || "General",
        revenue: c.revenue || 0,
        unitsSold: c.unitsSold || 0,
        percentage: Math.round(((c.revenue || 0) / totalRev) * 100),
        color: categoryColors[idx % categoryColors.length],
      }));
    }

    // Default category revenue breakdown for standard catalog
    return [
      { name: "Laptops", revenue: 984000, unitsSold: 42, percentage: 40, color: categoryColors[0] },
      { name: "Smartphones", revenue: 642000, unitsSold: 58, percentage: 26, color: categoryColors[1] },
      { name: "Audio", revenue: 385000, unitsSold: 94, percentage: 15, color: categoryColors[2] },
      { name: "Gaming", revenue: 290000, unitsSold: 35, percentage: 12, color: categoryColors[3] },
      { name: "Monitors", revenue: 181450, unitsSold: 22, percentage: 7, color: categoryColors[4] },
    ];
  }, [categories]);

  const totalCatRevenue = processedCategories.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm sm:text-base font-heading font-bold text-white">
            Revenue by Category
          </h2>
          <p className="text-[11px] text-slate-400">
            Performance & share of electronic departments
          </p>
        </div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white group transition-colors"
        >
          <span>Catalog</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Category Bars List */}
      <div className="space-y-4">
        {processedCategories.map((item, idx) => {
          const Icon = getCategoryIcon(item.name);
          return (
            <div key={idx} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-white/[0.04] text-slate-300 group-hover:text-white group-hover:bg-white/10 transition-colors shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-white truncate">{item.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    ({item.unitsSold} sold)
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono shrink-0 ml-2">
                  <span className="text-white font-semibold">
                    {currencyFormatter ? currencyFormatter(item.revenue) : `₹${item.revenue.toLocaleString()}`}
                  </span>
                  <span className="text-[10px] text-slate-400 w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color.bar} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.max(item.percentage, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Footer */}
      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Total Departmental Sales:</span>
        <span className="font-bold text-white text-sm">
          {currencyFormatter ? currencyFormatter(totalCatRevenue) : `₹${totalCatRevenue.toLocaleString()}`}
        </span>
      </div>
    </div>
  );
}
