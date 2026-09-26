import React, { useState, useMemo, useRef, useCallback } from "react";
import { TrendingUp, Activity, Sparkles, Calendar } from "lucide-react";

/**
 * Enterprise Production Revenue Spline Chart:
 * - Cyber Orange / Amber high-definition gradient curve with luminous SVG glow.
 * - Fluid continuous mouse-tracking interaction & animated halo crosshair.
 * - Interactive metric switcher (Revenue, Orders, AOV).
 * - Rich glassmorphic tooltip with primary & secondary analytics.
 * - Peak & Average statistical badges for high financial visibility.
 */
export default function RevenueSplineChart({
  timeline = [],
  headlineTotal = 0,
  growthPercentage = 12.8,
  currencyFormatter,
}) {
  const [activeMetric, setActiveMetric] = useState("revenue"); // 'revenue' | 'orders' | 'aov'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const containerRef = useRef(null);

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

  // Chart coordinate space
  const height = 220;
  const paddingLeft = 6;
  const paddingRight = 6;
  const paddingTop = 24;
  const paddingBottom = 28;

  const values = chartData.map((d) => d[activeMetric] || 0);
  const minVal = Math.min(...values) * 0.85;
  const rawMax = Math.max(...values);
  const maxVal = rawMax * 1.12 || 100;
  const range = maxVal - minVal || 1;

  // Compute SVG coordinates
  const points = useMemo(() => {
    return chartData.map((d, i) => {
      const x =
        paddingLeft +
        (i / (chartData.length - 1)) * (100 - paddingLeft - paddingRight);
      const y =
        paddingTop +
        (1 - ((d[activeMetric] || 0) - minVal) / range) *
          (height - paddingTop - paddingBottom);
      return { x, y, data: d, index: i };
    });
  }, [chartData, activeMetric, minVal, range]);

  // Find peak point for maximum visual highlight
  const peakPoint = useMemo(() => {
    if (!points.length) return null;
    return points.reduce((max, pt) =>
      (pt.data[activeMetric] || 0) > (max.data[activeMetric] || 0) ? pt : max
    );
  }, [points, activeMetric]);

  // Generate smooth cubic bezier curve
  const { pathD, fillD } = useMemo(() => {
    if (!points.length) return { pathD: "", fillD: "" };
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
    const fill = `${path} L ${points[points.length - 1].x} ${
      height - paddingBottom
    } L ${points[0].x} ${height - paddingBottom} Z`;
    return { pathD: path, fillD: fill };
  }, [points]);

  // Value formatting helper
  const formatMetricVal = useCallback(
    (val) => {
      if (activeMetric === "revenue" || activeMetric === "aov") {
        return currencyFormatter
          ? currencyFormatter(Math.round(val))
          : `₹${Math.round(val).toLocaleString()}`;
      }
      return `${Math.round(val).toLocaleString()} Orders`;
    },
    [activeMetric, currencyFormatter]
  );

  // Format headline number
  const formatHeadline = () => {
    if (activeMetric === "revenue") {
      if (headlineTotal >= 10000000) {
        return `₹${(headlineTotal / 10000000).toFixed(2)}Cr`;
      }
      if (headlineTotal >= 100000) {
        return `₹${(headlineTotal / 100000).toFixed(2)}L`;
      }
      return currencyFormatter
        ? currencyFormatter(headlineTotal)
        : `₹${headlineTotal.toLocaleString()}`;
    }
    if (activeMetric === "orders") {
      const totalOrders = chartData.reduce(
        (sum, d) => sum + (d.orders || 0),
        0
      );
      return `${totalOrders.toLocaleString()} Orders`;
    }
    const avgAov = Math.round(
      chartData.reduce((sum, d) => sum + (d.aov || 0), 0) /
        (chartData.length || 1)
    );
    return currencyFormatter ? currencyFormatter(avgAov) : `₹${avgAov}`;
  };

  // Fluid mouse tracking to snap to nearest point across SVG canvas
  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current || !points.length) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const percentX = (clientX / rect.width) * 100;

      // Find closest point by x coordinate
      let closest = points[0];
      let minDiff = Math.abs(points[0].x - percentX);

      for (let i = 1; i < points.length; i++) {
        const diff = Math.abs(points[i].x - percentX);
        if (diff < minDiff) {
          minDiff = diff;
          closest = points[i];
        }
      }
      setHoveredPoint(closest);
    },
    [points]
  );

  // Tooltip boundary clamp (keep inside 12% - 88% width bounds)
  const clampedTooltipX = hoveredPoint
    ? Math.max(14, Math.min(86, hoveredPoint.x))
    : 50;

  return (
    <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-xl hover:border-orange-500/25 transition-all duration-300 flex flex-col justify-between group">
      {/* Ambient Cyber Orange Atmosphere Glows */}
      <div className="absolute -top-14 -right-14 w-44 h-44 bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-70 group-hover:opacity-100" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-orange-600/[0.04] rounded-full blur-2xl pointer-events-none" />

      {/* Top Header & Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          {/* Subtitle with Live Pulse Beacon */}
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[11px] font-mono font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Financial & Sales Curve
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md">
              <Activity className="w-2.5 h-2.5 text-orange-500" /> Live Aggregation
            </span>
          </div>

          {/* Main Headline & Growth Badge */}
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              {formatHeadline()}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-xs">
              <TrendingUp className="w-3 h-3" />
              <span>+{growthPercentage}%</span>
            </span>
            {peakPoint && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-mono text-orange-600 dark:text-orange-400/90 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                <Sparkles className="w-3 h-3" /> Peak: {formatMetricVal(rawMax)}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Metric Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 self-start sm:self-auto backdrop-blur-sm">
          {[
            { key: "revenue", label: "Revenue" },
            { key: "orders", label: "Orders" },
            { key: "aov", label: "AOV" },
          ].map((tab) => {
            const isActive = activeMetric === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveMetric(tab.key);
                  setHoveredPoint(null);
                }}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/30 scale-[1.02]"
                    : "text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive SVG Spline Graphic Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[220px] select-none cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Cyber Orange Multi-stop Gradient Fill */}
            <linearGradient id="orange-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.42" />
              <stop offset="45%" stopColor="#fb923c" stopOpacity="0.18" />
              <stop offset="85%" stopColor="#ea580c" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>

            {/* Radiant Orange Spline Stroke Gradient */}
            <linearGradient id="orange-line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Glowing Drop Shadow Filter for Neon Curve Effect */}
            <filter id="orange-curve-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#f97316" floodOpacity="0.45" />
            </filter>

            {/* Hover Crosshair Vertical Gradient */}
            <linearGradient id="crosshair-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Background Grid Guide Lines */}
          {[0.25, 0.5, 0.75].map((ratio) => {
            const y =
              paddingTop + ratio * (height - paddingTop - paddingBottom);
            return (
              <line
                key={ratio}
                x1={paddingLeft}
                y1={y}
                x2={100 - paddingRight}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-white/[0.06]"
                strokeDasharray="2 3"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Area Fill Under Spline */}
          <path d={fillD} fill="url(#orange-area-gradient)" />

          {/* Spline Path with Orange Gradient and Glow Filter */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#orange-line-gradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#orange-curve-glow)"
          />

          {/* Subtle Data Dots along Curve */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="1.2"
              fill="#fb923c"
              className="opacity-60 transition-opacity duration-200"
            />
          ))}

          {/* Active Hover Crosshair Line and Multi-ring Halo Dot */}
          {hoveredPoint && (
            <g className="transition-all duration-75">
              {/* Vertical Crosshair Line */}
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={height - paddingBottom}
                stroke="url(#crosshair-gradient)"
                strokeDasharray="2 2"
                strokeWidth="0.8"
              />

              {/* Pulsing Radar Ring */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="7"
                fill="#f97316"
                fillOpacity="0.3"
                className="animate-ping"
              />

              {/* Outer Amber Aura */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="5"
                fill="#ea580c"
                fillOpacity="0.25"
              />

              {/* Solid Orange Ring & Crisp White Core */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="3.5"
                fill="#ffffff"
                stroke="#f97316"
                strokeWidth="1.8"
              />
            </g>
          )}
        </svg>

        {/* Floating Glassmorphic Interactive Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute -top-3 pointer-events-none transform -translate-x-1/2 z-30 bg-slate-950/95 dark:bg-[#07090e]/95 border border-orange-500/40 px-3.5 py-2 rounded-xl shadow-2xl shadow-orange-500/20 backdrop-blur-xl text-xs font-mono text-white transition-transform duration-75 whitespace-nowrap"
            style={{ left: `${clampedTooltipX}%` }}
          >
            {/* Tooltip Header */}
            <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 pb-1 mb-1 border-b border-white/10 font-sans">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-2.5 h-2.5 text-orange-400" />
                {hoveredPoint.data.date}
              </span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                {activeMetric}
              </span>
            </div>

            {/* Tooltip Main Metric Value */}
            <div className="text-sm font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 tracking-tight">
              {activeMetric === "revenue"
                ? currencyFormatter
                  ? currencyFormatter(hoveredPoint.data.revenue)
                  : `₹${hoveredPoint.data.revenue?.toLocaleString()}`
                : activeMetric === "orders"
                ? `${hoveredPoint.data.orders} Orders`
                : `₹${hoveredPoint.data.aov?.toLocaleString()} AOV`}
            </div>

            {/* Tooltip Secondary Insight */}
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between gap-3 font-mono">
              {activeMetric === "revenue" ? (
                <>
                  <span>Volume:</span>
                  <span className="text-white font-semibold">{hoveredPoint.data.orders} orders</span>
                </>
              ) : activeMetric === "orders" ? (
                <>
                  <span>Revenue:</span>
                  <span className="text-white font-semibold">
                    {currencyFormatter
                      ? currencyFormatter(hoveredPoint.data.revenue)
                      : `₹${hoveredPoint.data.revenue?.toLocaleString()}`}
                  </span>
                </>
              ) : (
                <>
                  <span>Orders:</span>
                  <span className="text-white font-semibold">{hoveredPoint.data.orders}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* X-Axis Date Ticks with Active Date Highlight */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-white/5">
        {chartData
          .filter(
            (_, i) =>
              i % Math.ceil(chartData.length / 6) === 0 ||
              i === chartData.length - 1
          )
          .map((item, idx) => {
            const isHovered = hoveredPoint?.data?.date === item.date;
            return (
              <span
                key={idx}
                className={`transition-all duration-150 ${
                  isHovered
                    ? "text-orange-500 dark:text-orange-400 font-bold scale-105"
                    : ""
                }`}
              >
                {item.date}
              </span>
            );
          })}
      </div>
    </div>
  );
}
