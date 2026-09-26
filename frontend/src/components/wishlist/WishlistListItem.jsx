import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import {
  ShoppingBag,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Check,
} from "lucide-react";

/**
 * Enterprise Production-Grade Wishlist List Item:
 * - High-density responsive list row layout.
 * - Image thumbnail with hover scaling.
 * - Stock availability pill badge.
 * - Pricing with regular price strikethrough & discount percent pill.
 * - 1-Click Move to Bag with tactile confirmation feedback.
 * - Remove from Wishlist action.
 */
export default function WishlistListItem({ product }) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const price = product.salePrice ?? product.regularPrice ?? 0;
  const regularPrice = product.regularPrice ?? price;
  const hasDiscount = regularPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0;

  const isInStock = product.inStock !== false && (product.stock ?? 1) > 0;

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const imageUrl =
    product.images?.[0]?.url ||
    product.image ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80";

  const handleAddToCart = () => {
    if (!isInStock) return;
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <div className="group p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 hover:border-rose-500/40 dark:hover:border-rose-500/30 transition-all duration-300 shadow-xs hover:shadow-xl dark:hover:shadow-black/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-6 relative overflow-hidden">
      {/* Ambient hover glow */}
      <div className="absolute -right-16 -top-16 w-36 h-36 bg-rose-500/5 rounded-full blur-3xl pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity" />

      {/* Left: Product Image & Meta */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 w-full md:w-auto">
        <Link
          to={`/product/${product.slug || product._id}`}
          className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-[#07090e] border border-slate-200 dark:border-white/10 p-2 shrink-0 flex items-center justify-center overflow-hidden group/img relative"
        >
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-contain group-hover/img:scale-110 transition-transform duration-300"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
              {product.brandName || "FLAGSHIP"}
            </span>

            {product.categoryName && (
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-md">
                {product.categoryName}
              </span>
            )}

            {isInStock ? (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>In Stock</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>Out of Stock</span>
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.slug || product._id}`}
            className="font-heading font-bold text-xs sm:text-base text-slate-900 dark:text-white hover:text-rose-500 dark:hover:text-rose-400 transition-colors line-clamp-1 block tracking-tight"
          >
            {product.title}
          </Link>

          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-mono">
            Direct flagship dispatch with 1-Year Comprehensive Manufacturer Warranty.
          </p>
        </div>
      </div>

      {/* Middle & Right: Pricing & Action Controls */}
      <div className="flex flex-row md:flex-col lg:flex-row items-center justify-between md:justify-end gap-3 sm:gap-6 w-full md:w-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/[0.06] shrink-0">
        {/* Pricing Block */}
        <div className="text-left md:text-right">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-heading font-extrabold text-sm sm:text-lg text-slate-900 dark:text-white tracking-tight">
              {formatINR(price)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] sm:text-xs font-mono text-slate-400 line-through">
                {formatINR(regularPrice)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="inline-block mt-0.5 text-[9px] sm:text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Save {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
              !isInStock
                ? "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-white/5"
                : isAdded
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-rose-500/25"
            }`}
            title="Move to Bag"
          >
            {isAdded ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span className="text-[11px]">Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px]">Add to Bag</span>
              </>
            )}
          </button>

          <Link
            to={`/product/${product.slug || product._id}`}
            className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="View Hardware Specs"
          >
            <Eye className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Remove from Wishlist"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
