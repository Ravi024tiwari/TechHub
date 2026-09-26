import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  PieChart,
  Layers,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Calendar,
} from "lucide-react";

export default function SpendingAnalyticsChart({
  monthlySpending = [],
  categoryBreakdown = [],
}) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [viewMode, setViewMode] = useState("spent"); // 'spent' or 'orders'

  // Determine max spend or max orders for relative bar heights
  const maxSpend = Math.max(1, ...monthlySpending.map((m) => m.spent || 0));
  const maxOrders = Math.max(1, ...monthlySpending.map((m) => m.orders || 0));
  const currentMax = viewMode === "spent" ? maxSpend : maxOrders;

  // Calculate 6-month total and average
  const totalSpend = monthlySpending.reduce((acc, m) => acc + (m.spent || 0), 0);
  const totalOrders = monthlySpending.reduce((acc, m) => acc + (m.orders || 0), 0);
  const avgMonthly =
    monthlySpending.length > 0 ? Math.round(totalSpend / monthlySpending.length) : 0;

  const activeMonth =
    selectedMonth ||
    (monthlySpending.length > 0
      ? monthlySpending[monthlySpending.length - 1]
      : null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 6-Month Time-Series Chart */}
      <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 p-4 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                6-Month Expenditure Timeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Avg Monthly: ₹{avgMonthly.toLocaleString("en-IN")} • {totalOrders} total orders
              </p>
            </div>
          </div>

          {/* Toggle View Mode: Spend vs Orders */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 w-fit self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("spent")}
              className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                viewMode === "spent"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Amount (₹)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("orders")}
              className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                viewMode === "orders"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Orders ({totalOrders})
            </button>
          </div>
        </div>

        {/* Active Month Readout Banner */}
        {activeMonth && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-500/10 border border-orange-500/25 text-orange-700 dark:text-orange-300 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-bold">
              <Calendar className="h-3.5 w-3.5" />
              {activeMonth.month} {activeMonth.year}
            </span>
            <div className="flex items-center gap-3">
              <span>
                Spent: <strong>₹{(activeMonth.spent || 0).toLocaleString("en-IN")}</strong>
              </span>
              <span>
                Volume: <strong>{activeMonth.orders} orders</strong>
              </span>
            </div>
          </div>
        )}

        {/* Visualizer Bars Container */}
        <div className="pt-4 pb-2">
          <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 px-1">
            {monthlySpending.map((m, idx) => {
              const val = viewMode === "spent" ? m.spent || 0 : m.orders || 0;
              const heightPercent = Math.max(10, Math.round((val / currentMax) * 100));
              const isPeak = val === currentMax && currentMax > 0;
              const isSelected = activeMonth?.month === m.month && activeMonth?.year === m.year;

              return (
                <div
                  key={`${m.year}-${m.month}-${idx}`}
                  onClick={() => setSelectedMonth(m)}
                  onMouseEnter={() => setSelectedMonth(m)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Tooltip */}
                  <div
                    className={`transition-all duration-200 mb-2 text-center pointer-events-none ${
                      isSelected ? "opacity-100 scale-105" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md">
                      {viewMode === "spent"
                        ? `₹${m.spent >= 1000 ? `${(m.spent / 1000).toFixed(1)}k` : m.spent}`
                        : `${m.orders} ord`}
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[48px] relative rounded-xl overflow-hidden bg-slate-100 dark:bg-white/[0.04] flex items-end p-0.5">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isPeak
                          ? "bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-400 shadow-lg shadow-orange-500/25"
                          : isSelected
                          ? "bg-gradient-to-t from-orange-600 to-amber-400"
                          : "bg-gradient-to-t from-slate-400/80 to-slate-300 dark:from-slate-700 dark:to-slate-600 group-hover:from-orange-500/70 group-hover:to-amber-400/70"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Month Label & Order Count */}
                  <div className="mt-3 text-center">
                    <span
                      className={`block text-xs font-heading font-bold ${
                        isSelected
                          ? "text-orange-600 dark:text-orange-400 font-black"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {m.month}
                    </span>
                    <span className="block text-[10px] font-mono text-slate-400">
                      {m.orders} {m.orders === 1 ? "ord" : "ords"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown Portfolio */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 p-4 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                Category Portfolio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Distribution of lifetime investments
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 font-mono">
                No category spend logged yet.
              </div>
            ) : (
              categoryBreakdown.slice(0, 5).map((cat, i) => {
                const colors = [
                  "from-orange-500 to-amber-600",
                  "from-amber-500 to-yellow-500",
                  "from-emerald-500 to-teal-600",
                  "from-purple-500 to-indigo-600",
                  "from-rose-500 to-pink-600",
                ];
                const gradient = colors[i % colors.length];

                return (
                  <div key={cat.category} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-heading font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-wider group-hover:text-orange-500 transition-colors">
                        {cat.category}
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        ₹{(cat.spent || 0).toLocaleString("en-IN")} ({cat.percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                        style={{ width: `${Math.max(5, cat.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Link
          to="/products"
          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-heading font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all text-center"
        >
          <span>Browse All Hardware Categories</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
