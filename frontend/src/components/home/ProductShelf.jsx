import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Flame,
  Clock,
  SlidersHorizontal,
  Star,
  Zap,
  TrendingUp,
  Percent,
} from "lucide-react";
import ProductCard from "../product/ProductCard";
import ProductCardSkeleton from "../product/ProductCardSkeleton";

/**
 * Enterprise Production-Grade Product Shelf:
 * - Dynamic Interactive Header inspired by Amazon & Flipkart:
 *   - Metallic Silver Accent Pillar & Verified Deal Badges.
 *   - Real-time "Deal of the Day" Countdown Timer (HH:MM:SS).
 *   - Instant Client-Side Filter Pills (All, Top Rated, High Savings, Under ₹1L).
 *   - Instant Sorting (Featured, Price Low->High, Price High->Low, Rating).
 *   - Harmonized full-width padding matching the global layout.
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
          ENHANCED INTERACTIVE SHELF HEADER
          ========================================================= */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 text-left">
        
        {/* Top Header Row: Badges, Title, Countdown & View All CTA */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          
          {/* Left Column: Accent Bar + Title & Badges */}
          <div className="space-y-2 relative pl-3 sm:pl-4">
            {/* Glowing Brushed Silver Accent Pillar */}
            <div className="absolute left-0 top-1 bottom-1 w-1 sm:w-1.5 rounded-full bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 shadow-[0_0_12px_rgba(255,255,255,0.4)]" />

            {/* Badges & Real-Time Countdown Row */}
            <div className="flex flex-wrap items-center gap-2">
              {badgeText && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/20 text-[10px] font-tech font-bold uppercase tracking-wider text-slate-200 shadow-sm backdrop-blur-md">
                  <Sparkles className="h-3 w-3 text-cyan-300" />
                  <span>{badgeText}</span>
                </div>
              )}

              {/* Total Products Counter Badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono text-slate-300 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>{products.length} Products In Catalog</span>
              </span>

              {/* Amazon-Style Real-time Deal Countdown Timer */}
              {hasCountdown && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold shadow-sm">
                  <Clock className="h-3 w-3 animate-spin text-amber-400" style={{ animationDuration: "6s" }} />
                  <span>
                    Ends in {formatDigits(timeLeft.hours)}h : {formatDigits(timeLeft.minutes)}m : {formatDigits(timeLeft.seconds)}s
                  </span>
                </div>
              )}
            </div>

            {/* Main Shelf Heading */}
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              {title}
            </h2>

            {/* Subtitle with Quality Assurance Marker */}
            {subtitle && (
              <p className="font-body text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed flex items-center gap-2">
                <span>{subtitle}</span>
              </p>
            )}
          </div>

          {/* Right Column: Sort Selector & 'View All' Action Button */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end">
            {/* Interactive Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-[#0e1118] text-white">
                  Sort: Featured Deals
                </option>
                <option value="price-asc" className="bg-[#0e1118] text-white">
                  Price: Low to High
                </option>
                <option value="price-desc" className="bg-[#0e1118] text-white">
                  Price: High to Low
                </option>
                <option value="rating" className="bg-[#0e1118] text-white">
                  Highest Customer Rating
                </option>
              </select>
            </div>

            {/* View All Products CTA */}
            {showAllLink && (
              <Link
                to={showAllLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-white/10 to-white/[0.04] hover:from-white/20 hover:to-white/10 border-2 border-slate-400/40 hover:border-slate-200 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.08)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] group transition-all cursor-pointer"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-cyan-300" />
              </Link>
            )}
          </div>
        </div>

        {/* Bottom Interactive Filter Chips Row (Amazon & Flipkart Pattern) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 border-t border-white/[0.06] pt-3">
          <span className="text-[11px] font-tech text-slate-500 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Quick Filter:
          </span>

          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "all"
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                : "bg-white/[0.035] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10"
            }`}
          >
            <span>All Items</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeFilter === "all" ? "bg-black/15 text-black" : "bg-white/10 text-slate-400"
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
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "bg-white/[0.035] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10"
              }`}
            >
              <Star className={`h-3 w-3 ${activeFilter === "top-rated" ? "fill-black text-black" : "fill-amber-300 text-amber-300"}`} />
              <span>Top Rated (★4.5+)</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeFilter === "top-rated" ? "bg-black/15 text-black" : "bg-white/10 text-slate-400"
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
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "bg-white/[0.035] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10"
              }`}
            >
              <Percent className="h-3 w-3 text-emerald-400" />
              <span>High Savings (10%+ Off)</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeFilter === "big-deals" ? "bg-black/15 text-black" : "bg-white/10 text-slate-400"
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
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "bg-white/[0.035] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10"
              }`}
            >
              <Zap className="h-3 w-3 text-cyan-400" />
              <span>Under ₹1,00,000</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeFilter === "under-1l" ? "bg-black/15 text-black" : "bg-white/10 text-slate-400"
              }`}>
                {under1LCount}
              </span>
            </button>
          )}
        </div>

        {/* Radiant Silver Gradient Hairline Divider */}
        <div className="relative w-full h-[2px] bg-gradient-to-r from-slate-400/40 via-white/20 to-transparent" />
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
        <div className="p-12 rounded-3xl bg-white/[0.02] border-2 border-slate-400/20 text-center space-y-3">
          <p className="font-heading font-bold text-base text-white">
            No items matched the active filter ({activeFilter})
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try selecting a different filter tab above or resetting to view all available flagship hardware.
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
