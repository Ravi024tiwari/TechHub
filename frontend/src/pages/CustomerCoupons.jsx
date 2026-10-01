import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Ticket,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  Tag,
  Percent,
  X,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CouponCard from "@/components/coupon/CouponCard";
import { fetchActiveCouponsApi } from "@/api/couponApi";
import { useCartStore } from "@/store/useCartStore";

export default function CustomerCoupons() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'percentage' | 'flat' | 'eligible'
  const [toastMessage, setToastMessage] = useState(null);

  // TanStack Query: Auto-caching & request deduplication across renders
  const { data: coupons = [], isLoading: loading } = useQuery({
    queryKey: ["activeCoupons"],
    queryFn: fetchActiveCouponsApi,
    staleTime: 2 * 60 * 1000,
  });

  // Cart state from Zustand store
  const cartSubtotal = useCartStore((state) => state.getSubtotal());
  const cartItemCount = useCartStore((state) => state.getTotalCount());

  // Show transient notification
  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Format currency
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Handle Apply Coupon action from card
  const handleApplyCoupon = (code) => {
    showToast(`Promo code '${code}' applied! Redirecting to cart...`);
    setTimeout(() => {
      navigate(`/cart?coupon=${encodeURIComponent(code)}`);
    }, 900);
  };

  // Filtered coupons calculation
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      // Search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesCode = coupon.code.toLowerCase().includes(query);
        const matchesDesc = (coupon.description || "").toLowerCase().includes(query);
        if (!matchesCode && !matchesDesc) return false;
      }

      // Filter tabs
      if (filterType === "percentage") {
        return coupon.discountType === "PERCENTAGE";
      }
      if (filterType === "flat") {
        return coupon.discountType === "FLAT";
      }
      if (filterType === "eligible") {
        return cartSubtotal >= (coupon.minOrderValue || 0);
      }

      return true;
    });
  }, [coupons, searchTerm, filterType, cartSubtotal]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors w-full overflow-x-clip">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-2xl border border-slate-800 dark:border-slate-200 text-xs font-semibold animate-in slide-in-from-top-3 duration-300">
          <CheckCircle2 className="size-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage.message}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* =========================================================
            HERO PROMOTIONAL BANNER
            ========================================================= */}
        <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 text-slate-900 border-2 border-slate-200/90 shadow-sm dark:from-[#0d111a] dark:via-[#111622] dark:to-[#080a0f] dark:text-white dark:border-white/10 dark:shadow-xl transition-all">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-0 size-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 size-80 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-800 dark:bg-white/10 dark:text-amber-300 border border-amber-300/80 dark:border-white/10">
              <Sparkles className="size-3.5 text-amber-600 dark:text-amber-300" />
              <span>Official Store Promotions</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight leading-tight text-slate-950 dark:text-white">
              Promotional Offers & Instant Vouchers
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Unlock verified instant discounts on premium electronics, hardware, and flagship devices. Copy any code or apply directly to your cart.
            </p>
          </div>

          {/* Cart Status Micro-Banner */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center border border-slate-200 dark:border-white/15 shadow-2xs">
                <ShoppingBag className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Current Cart Value
                </span>
                <span className="text-base sm:text-lg font-heading font-black text-slate-950 dark:text-white">
                  {cartItemCount > 0 ? (
                    <>
                      <span>{formatINR(cartSubtotal)}</span>
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">
                        ({cartItemCount} {cartItemCount === 1 ? "item" : "items"})
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-normal">Cart is empty</span>
                  )}
                </span>
              </div>
            </div>

            {cartItemCount > 0 ? (
              <Link
                to="/cart"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold text-xs shadow-md transition-all hover:scale-102 cursor-pointer"
              >
                <span>View Cart & Checkout</span>
                <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/15 transition-all cursor-pointer"
              >
                <span>Browse Products</span>
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* =========================================================
            SEARCH & FILTER CONTROLS BAR
            ========================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#0c0e15] border-2 border-slate-200/90 dark:border-white/10 shadow-xs">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Offers" },
              { id: "percentage", label: "Percentage Off" },
              { id: "flat", label: "Flat Savings" },
              ...(cartItemCount > 0
                ? [{ id: "eligible", label: "Eligible for My Cart" }]
                : []),
            ].map((tab) => {
              const isActive = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search coupon or terms..."
              className="w-full pl-9 pr-7 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all font-mono"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* =========================================================
            COUPONS GRID DISPLAY
            ========================================================= */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-slate-200/60 dark:bg-white/[0.04] animate-pulse border-2 border-slate-200/60 dark:border-white/5"
              />
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/15 bg-white/50 dark:bg-white/[0.02] space-y-3">
            <div className="size-16 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto shadow-xs">
              <Ticket className="size-8" />
            </div>
            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
              No Coupons Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchTerm
                ? `No active offers match '${searchTerm}'. Try checking your search spelling.`
                : "Check back soon for new seasonal vouchers and launch campaigns."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                mode="customer"
                currentCartTotal={cartSubtotal}
                onApply={handleApplyCoupon}
              />
            ))}
          </div>
        )}

        {/* =========================================================
            PROMOTIONAL FAQ & HOW TO REDEEM SECTION
            ========================================================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0e15] border-2 border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-indigo-500" />
            <h2 className="font-heading font-black text-lg text-slate-950 dark:text-white">
              How to Redeem Your Offers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1.5">
              <span className="font-mono text-xs font-bold text-slate-400">Step 1</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Choose Your Voucher</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Pick the promo code matching your purchase category or cart value.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1.5">
              <span className="font-mono text-xs font-bold text-slate-400">Step 2</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">1-Click Apply</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Click "Apply Code" to instantly apply the discount directly to your shopping cart.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1.5">
              <span className="font-mono text-xs font-bold text-slate-400">Step 3</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Instant Savings</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Enjoy immediate price reductions verified across secure checkout.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
