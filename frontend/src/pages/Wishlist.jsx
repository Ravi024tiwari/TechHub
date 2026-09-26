import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import WishlistListItem from "@/components/wishlist/WishlistListItem";
import WishlistToolbar from "@/components/wishlist/WishlistToolbar";
import WishlistClearModal from "@/components/wishlist/WishlistClearModal";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Zap,
  CheckCircle2,
  PackageOpen,
  FilterX,
  TrendingDown,
} from "lucide-react";

export default function Wishlist() {
  const { items, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  // View mode (grid vs list), stored in localStorage for customer preference
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("shop_wishlist_view_mode") || "grid";
  });

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [batchActionNotice, setBatchActionNotice] = useState(null);

  // Sync viewMode changes to localStorage
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("shop_wishlist_view_mode", mode);
  };

  // Derive dynamic category chips with counts
  const categories = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const cat = item.categoryName || item.category?.name;
      if (cat) {
        map[cat] = (map[cat] || 0) + 1;
      }
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [items]);

  // Financial summary metrics
  const { totalValue, totalSavings, inStockCount } = useMemo(() => {
    let value = 0;
    let savings = 0;
    let inStock = 0;

    items.forEach((item) => {
      const price = item.salePrice ?? item.regularPrice ?? 0;
      const reg = item.regularPrice ?? price;
      value += price;
      if (reg > price) {
        savings += reg - price;
      }
      if (item.inStock !== false && (item.stock ?? 1) > 0) {
        inStock++;
      }
    });

    return { totalValue: value, totalSavings: savings, inStockCount: inStock };
  }, [items]);

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Filter & Sort Items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.brandName?.toLowerCase().includes(query) ||
          item.categoryName?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (item) =>
          (item.categoryName || item.category?.name) === selectedCategory
      );
    }

    // Sort order
    if (sortBy === "price-asc") {
      result.sort((a, b) => {
        const pA = a.salePrice ?? a.regularPrice ?? 0;
        const pB = b.salePrice ?? b.regularPrice ?? 0;
        return pA - pB;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const pA = a.salePrice ?? a.regularPrice ?? 0;
        const pB = b.salePrice ?? b.regularPrice ?? 0;
        return pB - pA;
      });
    } else if (sortBy === "discount") {
      result.sort((a, b) => {
        const pA = a.salePrice ?? a.regularPrice ?? 0;
        const rA = a.regularPrice ?? pA;
        const discA = rA > pA ? (rA - pA) / rA : 0;

        const pB = b.salePrice ?? b.regularPrice ?? 0;
        const rB = b.regularPrice ?? pB;
        const discB = rB > pB ? (rB - pB) / rB : 0;

        return discB - discA;
      });
    }

    return result;
  }, [items, searchQuery, selectedCategory, sortBy]);

  // Move all available in-stock items to bag
  const handleMoveAllToCart = () => {
    const available = items.filter(
      (item) => item.inStock !== false && (item.stock ?? 1) > 0
    );

    if (available.length === 0) {
      setBatchActionNotice({
        type: "info",
        message: "No in-stock items to move to bag right now.",
      });
      return;
    }

    available.forEach((item) => {
      addItem(item, 1);
    });

    setBatchActionNotice({
      type: "success",
      message: `Moved ${available.length} ${
        available.length === 1 ? "item" : "items"
      } directly to your shopping bag!`,
    });

    setTimeout(() => {
      setBatchActionNotice(null);
    }, 4000);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("recent");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-6">
          <Link
            to="/"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link
            to="/products"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Catalog
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold">
            Saved Hardware Vault
          </span>
        </nav>

        {/* Hero Header & Vault Value Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[11px] font-mono uppercase tracking-wider mb-2.5 font-bold border border-rose-500/20 shadow-xs">
              <Heart className="h-3 w-3 fill-rose-500" />
              <span>Customer Hardware Vault</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Saved Wishlist ({items.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Track real-time pricing on curated flagship gear, monitor stock
              levels, and seamlessly transfer saved builds into your cart.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Financial Snapshot Card */}
              <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 flex items-center gap-4 shadow-xs">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    Estimated Vault Value
                  </div>
                  <div className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    {formatINR(totalValue)}
                  </div>
                </div>

                {totalSavings > 0 && (
                  <div className="pl-4 border-l border-slate-200 dark:border-white/10">
                    <div className="text-[10px] font-mono uppercase text-emerald-500 flex items-center gap-0.5">
                      <TrendingDown className="h-3 w-3" />
                      <span>Savings</span>
                    </div>
                    <div className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                      {formatINR(totalSavings)}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMoveAllToCart}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-heading font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Move All In-Stock ({inStockCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(true)}
                  className="p-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer"
                  title="Clear Hardware Vault"
                  aria-label="Clear Hardware Vault"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Batch Notice Toast */}
        {batchActionNotice && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              batchActionNotice.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{batchActionNotice.message}</span>
            </div>
            <Link
              to="/cart"
              className="text-xs font-bold underline hover:opacity-80 transition-opacity shrink-0"
            >
              Open Bag →
            </Link>
          </div>
        )}

        {/* Wishlist Body */}
        {items.length === 0 ? (
          /* Entire Wishlist Empty State */
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="h-24 w-24 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-6 shadow-xl relative">
              <Heart className="h-12 w-12 text-rose-500/40" />
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="h-3 w-3" />
              </div>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2.5">
              Your Hardware Vault is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              You haven't saved any hardware yet. Explore our ultra-flagship
              catalog and tap the heart icon on any device to monitor prices
              and store them here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <span>Explore Flagship Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div>
            {/* Interactive Filter Toolbar & View Switcher */}
            <WishlistToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={handleViewModeChange}
              totalCount={items.length}
              filteredCount={filteredItems.length}
            />

            {/* Zero Results from Active Filter */}
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center max-w-md mx-auto bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4">
                  <FilterX className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  No matching hardware found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                  No saved items match "{searchQuery}" in{" "}
                  {selectedCategory === "all" ? "any category" : selectedCategory}.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  Reset Search & Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* Dual View Option 1: Card / Grid View */
              <div className="grid grid-cols-2 min-[540px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5">
                {filteredItems.map((item) => (
                  <div key={item._id} className="h-full">
                    <ProductCard product={item} />
                  </div>
                ))}
              </div>
            ) : (
              /* Dual View Option 2: Detailed List View */
              <div className="flex flex-col gap-3 sm:gap-4">
                {filteredItems.map((item) => (
                  <WishlistListItem key={item._id} product={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal to Clear All Wishlist Items */}
      <WishlistClearModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={clearWishlist}
        itemCount={items.length}
      />

      <Footer />
    </div>
  );
}
