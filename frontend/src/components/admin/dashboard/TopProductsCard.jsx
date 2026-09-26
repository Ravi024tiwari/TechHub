import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ChevronRight,
  Flame,
  Zap,
  Star,
  TrendingUp,
  ArrowUpRight,
  Trophy,
  SlidersHorizontal,
} from "lucide-react";

/**
 * Enterprise Production Top Selling Hardware Leaderboard:
 * - Dynamic ranking podium (#1 Gold, #2 Silver, #3 Bronze).
 * - Interactive sorting by Gross Revenue vs Sales Units.
 * - Interactive hover states with quick catalog inspect actions.
 * - Clean category and stock visibility.
 */
export default function TopProductsCard({
  products = [],
  currencyFormatter,
}) {
  const [sortBy, setSortBy] = useState("revenue"); // 'revenue' | 'units'
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Fallback demo hardware if store is new
  const displayProducts = useMemo(() => {
    const rawList =
      products && products.length > 0
        ? products
        : [
            {
              title: "iPhone 17 Pro 256GB Natural Titanium",
              unitsSold: 182,
              totalRevenue: 2184000,
              category: "Smartphones",
              currentStock: 48,
              image:
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=160&q=80",
            },
            {
              title: "Apple MacBook Air M4 (16GB, 512GB)",
              unitsSold: 94,
              totalRevenue: 1128000,
              category: "Laptops",
              currentStock: 19,
              image:
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=160&q=80",
            },
            {
              title: "Samsung Galaxy S25 Ultra 512GB",
              unitsSold: 73,
              totalRevenue: 948927,
              category: "Smartphones",
              currentStock: 32,
              image:
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=160&q=80",
            },
            {
              title: "AirPods Pro (2nd Gen) USB-C",
              unitsSold: 84,
              totalRevenue: 209916,
              category: "Audio",
              currentStock: 64,
              image:
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=160&q=80",
            },
            {
              title: "Sony WH-1000XM5 Noise Canceling",
              unitsSold: 61,
              totalRevenue: 243939,
              category: "Audio",
              currentStock: 15,
              image:
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=160&q=80",
            },
          ];

    // Sort list according to active pill
    return [...rawList].sort((a, b) => {
      if (sortBy === "revenue") {
        return (b.totalRevenue || 0) - (a.totalRevenue || 0);
      }
      return (b.unitsSold || 0) - (a.unitsSold || 0);
    });
  }, [products, sortBy]);

  // Max revenue or units for relative progress calculation
  const maxMetric = useMemo(() => {
    if (!displayProducts.length) return 1;
    return (
      Math.max(
        ...displayProducts.map((p) =>
          sortBy === "revenue" ? p.totalRevenue || 0 : p.unitsSold || 0
        )
      ) || 1
    );
  }, [displayProducts, sortBy]);

  // Medal styling helper
  const getRankBadge = (rank) => {
    if (rank === 0) {
      return (
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-sm shadow-amber-500/30 ring-2 ring-amber-400/40">
          1
        </span>
      );
    }
    if (rank === 1) {
      return (
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 shadow-sm ring-1 ring-slate-300">
          2
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-gradient-to-br from-orange-400 to-amber-700 text-white shadow-sm ring-1 ring-orange-500/50">
          3
        </span>
      );
    }
    return (
      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5">
        {rank + 1}
      </span>
    );
  };

  // Demand velocity tag helper
  const getVelocityBadge = (rank) => {
    if (rank === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
          <Flame className="w-2.5 h-2.5 text-orange-500 animate-pulse" />
          <span>Top Velocity</span>
        </span>
      );
    }
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <Zap className="w-2.5 h-2.5 text-emerald-500" />
          <span>High Demand</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
          <Star className="w-2.5 h-2.5 text-sky-500" />
          <span>High Performer</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
        <span>Trending</span>
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-xl hover:border-orange-500/20 transition-all duration-300 flex flex-col justify-between group">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/[0.04] dark:bg-amber-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-heading font-bold text-slate-900 dark:text-white">
              Top Selling Hardware
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <Trophy className="w-2.5 h-2.5" /> Leaderboard
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Ranked by gross sales & dispatch volume
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

      {/* Metric Sort Toggle Pills */}
      <div className="relative z-10 flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 mb-4 self-start">
        <button
          type="button"
          onClick={() => setSortBy("revenue")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
            sortBy === "revenue"
              ? "bg-slate-900 text-white dark:bg-orange-500 dark:text-white shadow-xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          By Revenue
        </button>
        <button
          type="button"
          onClick={() => setSortBy("units")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
            sortBy === "units"
              ? "bg-slate-900 text-white dark:bg-orange-500 dark:text-white shadow-xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          By Units
        </button>
      </div>

      {/* Interactive Products List */}
      <div className="relative z-10 space-y-2.5">
        {displayProducts.slice(0, 5).map((prod, idx) => {
          const isHovered = hoveredProduct === idx;
          const currentMetricVal =
            sortBy === "revenue" ? prod.totalRevenue || 0 : prod.unitsSold || 0;
          const relativePercent = Math.max(
            12,
            Math.round((currentMetricVal / maxMetric) * 100)
          );

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredProduct(idx)}
              onMouseLeave={() => setHoveredProduct(null)}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 border cursor-pointer ${
                isHovered
                  ? "bg-slate-50 dark:bg-white/[0.04] border-slate-300 dark:border-white/20 shadow-sm translate-x-1"
                  : "bg-transparent border-transparent hover:border-slate-200 dark:hover:border-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: Rank + Image + Title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="shrink-0">{getRankBadge(idx)}</div>

                  {/* Thumbnail */}
                  <div className="relative w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        prod.image ||
                        prod.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=160&q=80"
                      }
                      alt={prod.title}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=160&q=80";
                      }}
                    />
                  </div>

                  {/* Product Title and Units Tag */}
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block font-sans">
                      {prod.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-slate-400">
                        {prod.unitsSold} units dispatched
                      </span>
                      {prod.currentStock !== undefined && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          • {prod.currentStock} in stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Revenue & Demand Tag */}
                <div className="text-right shrink-0 font-mono">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                    {currencyFormatter
                      ? currencyFormatter(prod.totalRevenue)
                      : `₹${(prod.totalRevenue || 0).toLocaleString()}`}
                  </span>
                  <div className="mt-0.5">{getVelocityBadge(idx)}</div>
                </div>
              </div>

              {/* Relative performance volume bar */}
              <div className="mt-2 h-1 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                <div
                  style={{ width: `${relativePercent}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === 0
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : idx === 1
                      ? "bg-gradient-to-r from-sky-500 to-blue-500"
                      : "bg-gradient-to-r from-slate-400 to-slate-500"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
          <span>Top Bestseller:</span>
          <strong className="text-slate-900 dark:text-white font-semibold truncate max-w-[130px] inline-block">
            {displayProducts[0]?.title || "Flagship"}
          </strong>
        </span>
        <Link
          to="/admin/products"
          className="text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5 font-bold"
        >
          <span>All Items</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
