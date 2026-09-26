import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function Wishlist() {
  const { items, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addItem(item, 1);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-tech text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link to="/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Catalog
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-medium">Saved Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[11px] font-tech uppercase tracking-wider mb-2 font-semibold">
              <Heart className="h-3 w-3 fill-rose-500" />
              <span>Personal Vault</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Saved Hardware Wishlist ({items.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Keep track of dream hardware builds, monitor price drops, and move items to your bag.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Move All to Bag</span>
              </button>

              <button
                type="button"
                onClick={clearWishlist}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Items Grid */}
        {items.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Heart className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              You haven't saved any electronics yet. Browse our hardware catalog and click the heart icon on any device to save it here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <span>Explore Hardware</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 min-[540px]:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5">
            {items.map((item) => (
              <div key={item._id} className="h-full">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
