import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Clock,
  SlidersHorizontal,
  Star,
  Zap,
  Percent,
} from "lucide-react";
import ProductCard from "../product/ProductCard";
import ProductCardSkeleton from "../product/ProductCardSkeleton";

/**
 * Enterprise Production-Grade Product Shelf:
 * - Dynamic Interactive Header inspired by Amazon & Apple:
 *   - Cyber Orange & Amber Accent Pillar & Verified Deal Badges.
 *   - Real-time "Deal of the Day" Countdown Timer (HH:MM:SS).
 *   - Instant Client-Side Filter Pills (All, Top Rated, High Savings, Under ₹1L).
 *   - Instant Sorting (Featured, Price Low->High, Price High->Low, Rating).
 *   - 100% Adaptive Light and Dark mode styling.
 */
export default function ProductShelf({
  title,
  subtitle,
  badgeText,
  showAllLink,
  products = [],
  isLoading = false,
  limit = 8,
  hasCountdown = true,
  defaultSort = "featured",
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState(defaultSort);

  // Countdown timer for Amazon-style "Deal of the Day"
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });

  useEffect(() => {
    if (!hasCountdown) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasCountdown]);

  const formatDigits = (num) => String(num).padStart(2, "0");

  // Interactive filtering and sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter rules
    if (activeFilter === "top-rated") {
      result = result.filter((p) => (p.averageRating || 0) >= 4.5);
    } else if (activeFilter === "big-deals") {
      result = result.filter((p) => {
        const reg = p.regularPrice || 0;
        const sale = p.salePrice || reg;
        return reg > 0 && ((reg - sale) / reg) * 100 >= 10;
      });
    } else if (activeFilter === "under-1l") {
      result = result.filter((p) => (p.salePrice || p.regularPrice || 0) <= 100000);
    }

    // Sort rules
    if (sortBy === "price-asc") {
      result.sort(
        (a, b) =>
          (a.salePrice || a.regularPrice || 0) - (b.salePrice || b.regularPrice || 0)
      );
    } else if (sortBy === "price-desc") {
      result.sort(
        (a, b) =>
          (b.salePrice || b.regularPrice || 0) - (a.salePrice || a.regularPrice || 0)
      );
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    return result.slice(0, limit);
  }, [products, activeFilter, sortBy, limit]);

  // Quick filter counts
  const topRatedCount = products.filter((p) => (p.averageRating || 0) >= 4.5).length;
  const bigDealsCount = products.filter((p) => {
    const reg = p.regularPrice || 0;
    const sale = p.salePrice || reg;
    return reg > 0 && ((reg - sale) / reg) * 100 >= 10;
  }).length;
  const under1LCount = products.filter(
    (p) => (p.salePrice || p.regularPrice || 0) <= 100000
  ).length;

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-6 sm:py-10">
      {/* =========================================================
          INTERACTIVE SHELF HEADER
          ========================================================= */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 text-left">
        
        {/* Top Header Row: Badges, Title, Countdown & View All CTA */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          
          {/* Left Column: Accent Bar + Title & Badges */}
          <div className="space-y-2 relative pl-3 sm:pl-4">
            {/* Glowing Accent Pillar */}
            <div className="absolute left-0 top-1 bottom-1 w-1 sm:w-1.5 rounded-full bg-gradient-to-b from-orange-500 via-amber-500 to-orange-600 shadow-[0_0_12px_rgba(249,115,22,0.4)]" />

            {/* Badges & Real-Time Countdown Row */}
            <div className="flex flex-wrap items-center gap-2">
              {badgeText && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-white/[0.08] border border-orange-500/20 dark:border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 dark:text-slate-200 shadow-xs backdrop-blur-md">
                  <Sparkles className="h-3 w-3 text-orange-500 dark:text-cyan-300" />
                  <span>{badgeText}</span>
                </div>
              )}

              {/* Total Products Counter Badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-700 dark:text-slate-300 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>{products.length} In Shelf</span>
              </span>

              {/* Real-time Deal Countdown Timer */}
              {hasCountdown && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold shadow-xs">
                  <Clock className="h-3 w-3 animate-spin text-amber-500 dark:text-amber-400" style={{ animationDuration: "6s" }} />
                  <span>
                    Ends in {formatDigits(timeLeft.hours)}h : {formatDigits(timeLeft.minutes)}m : {formatDigits(timeLeft.seconds)}s
                  </span>
                </div>
              )}
            </div>

            {/* Main Shelf Heading */}
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight leading-tight">
              {title}
            </h2>

            {/* Subtitle */}
            {subtitle && (
              <p className="font-body text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right Column: Sort Selector & 'View All' Action Button */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end">
            {/* Interactive Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-white text-slate-900 dark:bg-[#0e1118] dark:text-white">
                  Sort: Featured Deals
                </option>
                <option value="price-asc" className="bg-white text-slate-900 dark:bg-[#0e1118] dark:text-white">
                  Price: Low to High
                </option>
                <option value="price-desc" className="bg-white text-slate-900 dark:bg-[#0e1118] dark:text-white">
                  Price: High to Low
                </option>
                <option value="rating" className="bg-white text-slate-900 dark:bg-[#0e1118] dark:text-white">
                  Highest Customer Rating
                </option>
              </select>
            </div>

            {/* View All Products CTA */}
            {showAllLink && (
              <Link
                to={showAllLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white border border-slate-900 dark:border-white/20 text-xs font-bold shadow-xs hover:shadow-md group transition-all cursor-pointer"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-orange-400 dark:text-cyan-300" />
              </Link>
            )}
          </div>
        </div>

        {/* Bottom Interactive Filter Chips Row */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 border-t border-slate-200/80 dark:border-white/[0.06] pt-3">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Quick Filter:
          </span>

          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md font-bold"
                : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-slate-300 dark:hover:text-white dark:border-white/10"
            }`}
          >
            <span>All Items</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeFilter === "all"
                ? "bg-white/20 dark:bg-black/15 text-white dark:text-slate-950"
                : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
            }`}>
              {products.length}
            </span>
          </button>

          {topRatedCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter("top-rated")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeFilter === "top-rated"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md font-bold"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-slate-300 dark:hover:text-white dark:border-white/10"
              }`}
            >
              <Star className={`h-3 w-3 ${activeFilter === "top-rated" ? "fill-white text-white dark:fill-slate-950 dark:text-slate-950" : "fill-amber-400 text-amber-400"}`} />
              <span>Top Rated (★4.5+)</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeFilter === "top-rated"
                  ? "bg-white/20 dark:bg-black/15 text-white dark:text-slate-950"
                  : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
              }`}>
                {topRatedCount}
              </span>
            </button>
          )}

          {bigDealsCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter("big-deals")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeFilter === "big-deals"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md font-bold"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-slate-300 dark:hover:text-white dark:border-white/10"
              }`}
            >
              <Percent className="h-3 w-3 text-emerald-500" />
              <span>High Savings (10%+ Off)</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeFilter === "big-deals"
                  ? "bg-white/20 dark:bg-black/15 text-white dark:text-slate-950"
                  : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
              }`}>
                {bigDealsCount}
              </span>
            </button>
          )}

          {under1LCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter("under-1l")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeFilter === "under-1l"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md font-bold"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-slate-300 dark:hover:text-white dark:border-white/10"
              }`}
            >
              <Zap className="h-3 w-3 text-blue-500 dark:text-cyan-400" />
              <span>Under ₹1,00,000</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeFilter === "under-1l"
                  ? "bg-white/20 dark:bg-black/15 text-white dark:text-slate-950"
                  : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
              }`}>
                {under1LCount}
              </span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="relative w-full h-[1.5px] bg-gradient-to-r from-slate-300 dark:from-slate-700 via-slate-200 dark:via-white/20 to-transparent" />
      </div>

      {/* =========================================================
          PRODUCT GRID
          ========================================================= */}
      {isLoading ? (
        <div className="grid grid-cols-2 min-[540px]:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {Array.from({ length: 4 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 min-[540px]:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id || product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="font-heading font-bold text-base text-slate-900 dark:text-white">
            No items matched the active filter ({activeFilter})
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try selecting a different filter tab above or resetting to view all available flagship hardware.
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
