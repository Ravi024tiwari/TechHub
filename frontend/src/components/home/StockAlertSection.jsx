import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Check, AlertTriangle, Flame } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { useProductsQuery } from "@/hooks/useProducts";

export default function StockAlertSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Query low stock items: maxStock <= 5, limit to 3 products
  const { data, isLoading } = useProductsQuery({
    maxStock: 5,
    limit: 3,
  });

  const products = data?.products || [];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setIsSubscribed(true);
    }
  };

  return (
    <section
      id="stock-alerts-section"
      className="relative w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-8 sm:py-12 scroll-mt-20"
    >
      {/* 1. Specular Light Beam Top Divider */}
      <div className="relative w-full max-w-4xl mx-auto h-[2px] mb-8 sm:mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/80 to-transparent blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400 to-transparent shadow-[0_0_25px_4px_rgba(239,68,68,0.7)]" />
      </div>

      {/* 2. Section Header: Badge, Title & Catalog Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div className="space-y-2 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-500/20 via-amber-500/20 to-red-500/20 border border-red-500/40 text-red-300 text-[10px] sm:text-xs font-mono font-extrabold tracking-wider shadow-md backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>CRITICAL INVENTORY DROP • LIMITED STOCK (≤ 5 UNITS)</span>
          </div>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
            Selling Out Fast: Last Chance Stock Alerts
          </h2>

          <p className="font-body text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            These high-demand flagships have 5 or fewer units remaining in warehouse allocation. Once depleted, promotional pricing ends and standard backorder lead times apply.
          </p>
        </div>

        {/* View Full Low Stock Catalog Button */}
        <div className="shrink-0 text-left md:text-right">
          <Link
            to="/deals?filter=low-stock"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-103 active:scale-97 transition-all cursor-pointer"
          >
            <span>View Full Low Stock Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 3. The 3 Low Stock Product Cards Grid (Reusing Universal ProductCard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {isLoading
          ? [1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)
          : products.slice(0, 3).map((product) => (
              <div key={product._id} className="h-full flex flex-col">
                <ProductCard product={product} />
              </div>
            ))}
      </div>

      {/* 4. Bottom VIP Restock Notification Banner */}
      <div className="mt-8 sm:mt-10 p-4 sm:p-6 rounded-2xl bg-[#0b0e14] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">
              Want immediate priority alerts when sold-out flagships restock?
            </h4>
            <p className="text-[11px] text-slate-400">
              Drop your email to get 15-minute early access before public drop + instant ₹1,500 welcome voucher.
            </p>
          </div>
        </div>

        {!isSubscribed ? (
          <form
            onSubmit={handleSubscribe}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for restock drops..."
              className="h-10 px-3.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 w-full md:w-64"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-slate-200 transition-all shrink-0 cursor-pointer"
            >
              Get Alerts
            </button>
          </form>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Subscribed! Code: TECHVIP1500</span>
          </div>
        )}
      </div>
    </section>
  );
}
