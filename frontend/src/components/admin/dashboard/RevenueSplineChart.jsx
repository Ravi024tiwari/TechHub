import React, { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";

export default function RevenueSplineChart({
  timeline = [],
  headlineTotal = 0,
  growthPercentage = 12.8,
  currencyFormatter,
}) {
  const [activeMetric, setActiveMetric] = useState("revenue"); // 'revenue' | 'orders' | 'aov'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Fallback demo data if store has no recent orders yet
  const chartData = useMemo(() => {
    if (timeline && timeline.length >= 2) {
      return timeline;
    }
    // Realistic curve representing 15 days of activity
    return [
      { date: "1 Mar", revenue: 42000, orders: 18, aov: 2333 },
      { date: "3 Mar", revenue: 68000, orders: 26, aov: 2615 },
      { date: "6 Mar", revenue: 55000, orders: 22, aov: 2500 },
      { date: "9 Mar", revenue: 95000, orders: 38, aov: 2500 },
      { date: "12 Mar", revenue: 82000, orders: 31, aov: 2645 },
      { date: "15 Mar", revenue: 140000, orders: 48, aov: 2916 },
      { date: "18 Mar", revenue: 125000, orders: 42, aov: 2976 },
      { date: "21 Mar", revenue: 185000, orders: 60, aov: 3083 },
      { date: "24 Mar", revenue: 160000, orders: 54, aov: 2962 },
      { date: "27 Mar", revenue: 220000, orders: 72, aov: 3055 },
      { date: "30 Mar", revenue: 260000, orders: 85, aov: 3058 },
    ];
  }, [timeline]);

  // Chart dimensions
  const height = 220;
  const paddingLeft = 10;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;

  const values = chartData.map((d) => d[activeMetric] || 0);
  const minVal = Math.min(...values) * 0.85;
  const maxVal = Math.max(...values) * 1.1 || 100;
  const range = maxVal - minVal || 1;

  // Compute SVG coordinates
  const points = chartData.map((d, i) => {
    const x =
      paddingLeft +
      (i / (chartData.length - 1)) * (100 - paddingLeft - paddingRight);
    const y =
      paddingTop +
      (1 - ((d[activeMetric] || 0) - minVal) / range) *
        (height - paddingTop - paddingBottom);
    return { x, y, data: d };
  });

  // Generate cubic bezier curve
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  // Format large values nicely
  const formatHeadline = () => {
    if (activeMetric === "revenue") {
      if (headlineTotal >= 10000000) {
        return `₹${(headlineTotal / 10000000).toFixed(2)}Cr`;
      }
      if (headlineTotal >= 100000) {
        return `₹${(headlineTotal / 100000).toFixed(2)}L`;
      }
      return currencyFormatter ? currencyFormatter(headlineTotal) : `₹${headlineTotal.toLocaleString()}`;
    }
    if (activeMetric === "orders") {
      const totalOrders = chartData.reduce((sum, d) => sum + (d.orders || 0), 0);
      return `${totalOrders.toLocaleString()} Orders`;
    }
    const avgAov = Math.round(
      chartData.reduce((sum, d) => sum + (d.aov || 0), 0) / (chartData.length || 1)
    );
    return currencyFormatter ? currencyFormatter(avgAov) : `₹${avgAov}`;
  };

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
            Financial & Sales Curve
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              {formatHeadline()}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              +{growthPercentage}%
            </span>
          </div>
        </div>

        {/* Metric Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 self-start sm:self-auto">
          {[
            { key: "revenue", label: "Revenue" },
            { key: "orders", label: "Orders" },
            { key: "aov", label: "AOV" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveMetric(tab.key);
                setHoveredPoint(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeMetric === tab.key
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Spline Graphic */}
      <div className="relative w-full h-[220px] select-none">
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          {/* Background Grid Guide Lines */}
          {[0.25, 0.5, 0.75].map((ratio) => {
            const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
            return (
              <line
                key={ratio}
                x1={paddingLeft}
                y1={y}
                x2={100 - paddingRight}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="2 2"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Area Fill */}
          <path d={fillD} fill="url(#revenue-gradient)" />

          {/* Spline Path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Crosshair & Data Point */}
          {hoveredPoint && (
            <>
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={height - paddingBottom}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeDasharray="1.5 1.5"
                strokeWidth="0.5"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="2.5"
                fill="#ffffff"
                stroke="#38bdf8"
                strokeWidth="1"
              />
            </>
          )}

          {/* Transparent Hover Target Columns */}
          {points.map((pt, idx) => (
            <rect
              key={idx}
              x={pt.x - 4}
              y={0}
              width={8}
              height={height}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute -top-3 pointer-events-none transform -translate-x-1/2 z-20 bg-[#0e0f13]/95 border border-white/20 px-2.5 py-1.5 rounded-xl shadow-xl backdrop-blur-md text-[11px] font-mono text-white transition-all whitespace-nowrap"
            style={{ left: `${hoveredPoint.x}%` }}
          >
            <div className="text-slate-400 text-[10px]">{hoveredPoint.data.date}</div>
            <div className="font-bold text-sky-400">
              {activeMetric === "revenue"
                ? currencyFormatter
                  ? currencyFormatter(hoveredPoint.data.revenue)
                  : `₹${hoveredPoint.data.revenue}`
                : activeMetric === "orders"
                ? `${hoveredPoint.data.orders} Orders`
                : `₹${hoveredPoint.data.aov} AOV`}
            </div>
          </div>
        )}
      </div>

      {/* X-Axis Date Ticks */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-white/5">
        {chartData
          .filter((_, i) => i % Math.ceil(chartData.length / 6) === 0 || i === chartData.length - 1)
          .map((item, idx) => (
            <span key={idx}>{item.date}</span>
          ))}
      </div>
    </div>
  );
}
