import React, { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Flame,
  Clock,
  Percent,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { useProductsQuery } from "@/hooks/useProducts";

export default function Deals() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") === "low-stock" ? "low-stock" : "all";

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDiscountFilter, setActiveDiscountFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState("savings-desc");

  // Fetch all active products
  const { data, isLoading } = useProductsQuery({ limit: 20 });
  const allProducts = data?.products || [];

  // Filter products that have actual discounts or critical low stock
  const dealsProducts = useMemo(() => {
    // 1. Initial product set
    let result = allProducts;

    // 2. Discount or Stock bracket filter
    if (activeDiscountFilter === "low-stock") {
      result = result.filter((p) => (p.stock ?? 0) <= 5);
    } else {
      // For general deals, require regularPrice > salePrice
      result = result.filter((p) => {
        const reg = p.regularPrice || 0;
        const sale = p.salePrice || reg;
        return reg > sale;
      });

      if (activeDiscountFilter === "save-20k") {
        result = result.filter(
          (p) => (p.regularPrice || 0) - (p.salePrice || 0) >= 20000
        );
      } else if (activeDiscountFilter === "20-percent") {
        result = result.filter((p) => {
          const diff = (p.regularPrice || 0) - (p.salePrice || 0);
          return ((diff / (p.regularPrice || 1)) * 100) >= 20;
        });
      } else if (activeDiscountFilter === "under-50k") {
        result = result.filter((p) => (p.salePrice || 0) <= 50000);
      }
    }

    // 4. Sort logic
    if (sortBy === "savings-desc") {
      result.sort(
        (a, b) =>
          (b.regularPrice - b.salePrice) - (a.regularPrice - a.salePrice)
      );
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0));
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    return result;
  }, [allProducts, activeCategory, activeDiscountFilter, sortBy]);

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "laptops", label: "Laptops & MacBooks" },
    { id: "gaming", label: "Gaming GPUs" },
    { id: "audio", label: "Audio & ANC" },
    { id: "monitors", label: "OLED Displays" },
    { id: "smartphones", label: "Smartphones" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#050608] text-white flex flex-col selection:bg-white/20 selection:text-white relative overflow-x-clip">
      {/* Universal Navbar */}
      <Navbar />

      <main className="flex-1 w-full space-y-6 sm:space-y-8 z-10 pb-20">
        
        {/* =========================================================
            DEALS PAGE HERO HEADER
            ========================================================= */}
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-6 sm:pt-10">
          <div className="relative w-full rounded-3xl border-2 border-slate-400/35 bg-gradient-to-r from-[#121622] via-[#0d1017] to-[#121622] p-6 sm:p-10 shadow-[0_12px_45px_rgba(0,0,0,0.85)] overflow-hidden text-left">
            
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-3xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs text-slate-400">
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-white font-semibold">Deals & Offers Hub</span>
              </nav>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono font-bold tracking-wider">
                  <Flame className="h-3.5 w-3.5 fill-red-300 animate-pulse" />
                  <span>FLASH SAVINGS EVENT</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-slate-200 text-xs font-mono">
                  <Tag className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{dealsProducts.length} Verified Active Deals</span>
                </div>
              </div>

              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
                Official Deals & Discount Hub
              </h1>

              <p className="font-body text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Explore authentic manufacturer-direct promotional offers across computing, graphics, audio, and displays. Guaranteed OEM warranty, 0% No-Cost EMI, and next-day insured air dispatch.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            DEAL HUNTING CONTROLS (Discount Filters & Sort)
            ========================================================= */}
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="p-4 rounded-2xl bg-[#090b10]/80 border-2 border-slate-400/25 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
            
            {/* Quick Discount Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full md:w-auto py-1">
              <button
                type="button"
                onClick={() => setActiveDiscountFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeDiscountFilter === "all"
                    ? "bg-white text-black shadow-md font-bold"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10"
                }`}
              >
                All Active Deals
              </button>

              <button
                type="button"
                onClick={() => setActiveDiscountFilter("low-stock")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeDiscountFilter === "low-stock"
                    ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] font-bold"
                    : "bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                <span>Critical Stock (≤5 Left)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDiscountFilter("save-20k")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeDiscountFilter === "save-20k"
                    ? "bg-white text-black shadow-md font-bold"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10"
                }`}
              >
                🔥 Save ₹20,000+
              </button>

              <button
                type="button"
                onClick={() => setActiveDiscountFilter("20-percent")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeDiscountFilter === "20-percent"
                    ? "bg-white text-black shadow-md font-bold"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10"
                }`}
              >
                🏷️ 20%+ Instant Off
              </button>

              <button
                type="button"
                onClick={() => setActiveDiscountFilter("under-50k")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeDiscountFilter === "under-50k"
                    ? "bg-white text-black shadow-md font-bold"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10"
                }`}
              >
                ⚡ Under ₹50,000
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#0e1118] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="savings-desc">Sort: Highest Savings First (₹)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-3">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm"
                      : "bg-white/[0.03] hover:bg-white/[0.07] text-slate-400 hover:text-white border border-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            DEALS PRODUCTS GRID
            ========================================================= */}
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
              {Array.from({ length: 8 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : dealsProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
              {dealsProducts.map((product) => (
                <ProductCard key={product._id || product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-white/[0.02] border-2 border-slate-400/20 text-center space-y-3">
              <p className="font-heading font-bold text-lg text-white">
                No active deals found matching your selected criteria
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try resetting your discount or category filter above to see all promotional hardware offers.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveDiscountFilter("all");
                  setActiveCategory("all");
                }}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
