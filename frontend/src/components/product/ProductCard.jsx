import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Check,
  Star,
  Zap,
  Truck,
  Eye,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

/**
 * Universal Premium Product Card:
 * - Product image renders edge-to-edge on the top background section with silver lighting.
 * - Entire card has cursor-pointer and navigates to Product Details on click.
 * - Add-to-Cart and Wishlist buttons stop propagation for dedicated micro-interactions.
 * - Brushed silver metallic chamfered border and frosted keynote aesthetic.
 */
export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) =>
    state.isInWishlist(product._id)
  );

  // Price & Discount math
  const regularPrice = product.regularPrice || 0;
  const salePrice = product.salePrice ?? regularPrice;
  const discountPercent =
    regularPrice > salePrice
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  // Format currency in Indian Rupees
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  // Estimate 12-month zero-cost EMI
  const monthlyEmi = Math.round(salePrice / 12);

  // Fallback image handling
  const mainImage =
    product.images?.[0]?.url ||
    product.image ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80";

  const productUrl = `/product/${product.slug || product._id}`;

  // Handle Card Click (Navigates to PDP)
  const handleCardClick = () => {
    navigate(productUrl);
  };

  // Handle Quick Add to Cart (Stops propagation)
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(product, 1);
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  // Handle Wishlist Toggle (Stops propagation)
  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-white shadow-sm hover:shadow-xl dark:border-white/25 dark:sm:border-slate-400/40 dark:hover:border-white/60 dark:active:border-white/70 dark:bg-gradient-to-b dark:from-[#141824] dark:via-[#0d1017] dark:to-[#080a0e] dark:shadow-[0_4px_25px_rgba(0,0,0,0.8),_0_0_15px_rgba(255,255,255,0.08)] dark:hover:shadow-[0_16px_45px_-10px_rgba(0,0,0,0.9),_0_0_30px_rgba(255,255,255,0.22)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer select-none"
    >
      {/* =========================================================================
          TOP SECTION: Full-Width Edge-to-Edge Image Showcase
          ========================================================================= */}
      <div className="relative w-full aspect-[4/3] xs:aspect-square sm:aspect-auto sm:h-64 lg:h-72 overflow-hidden bg-slate-100 dark:bg-[#0c0f16] border-b border-slate-200 dark:border-slate-400/30">
          {/* Product Image - Full Width & Height Cover */}
          <img
            src={mainImage}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          />

          {/* Cinematic Top and Bottom Gradient Vignettes for Badge Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 dark:to-[#0d1017] pointer-events-none" />

          {/* Floating Badges (Top-Left) */}
          <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 z-10 flex items-center gap-1 sm:gap-1.5 pointer-events-none max-w-[70%]">
            {/* Low Stock Alert Badge (stock <= 5) */}
            {(product.stock ?? 1) > 0 && (product.stock ?? 1) <= 5 && (
              <span className="px-1.5 sm:px-2.5 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-mono font-black tracking-wide uppercase bg-red-600/90 text-white border border-red-400/80 shadow-[0_0_12px_rgba(239,68,68,0.7)] backdrop-blur-md flex items-center gap-1 animate-pulse truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping shrink-0" />
                <span>ONLY {product.stock} LEFT!</span>
              </span>
            )}
            {discountPercent > 0 && (
              <span className="px-1.5 sm:px-2.5 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-extrabold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-sm shrink-0">
                {discountPercent}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-bold tracking-wide uppercase bg-white/20 text-white border border-white/30 backdrop-blur-md hidden sm:inline-block">
                KEYNOTE
              </span>
            )}
          </div>

          {/* Wishlist Heart Toggle (Top-Right) */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2 right-2 sm:top-3.5 sm:right-3.5 z-10 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 active:scale-90 cursor-pointer ${
              isInWishlist
                ? "bg-red-500/30 border-red-500/60 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)] scale-105"
                : "bg-black/60 border-white/20 text-slate-200 hover:text-white hover:bg-white/20 hover:scale-105"
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform ${
                isInWishlist ? "fill-red-400 scale-110" : ""
              }`}
            />
          </button>

          {/* Quick View Floating Hint Bar on Hover */}
          <div className="absolute inset-x-3 bottom-3 py-1.5 px-3 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-white font-medium hidden sm:flex items-center justify-center gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
            <Eye className="h-3.5 w-3.5 text-slate-300" />
            <span>Click for Full Technical Specs</span>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM SECTION: Metadata, Amazon Delivery Signal, Price & Action CTA
            ========================================================================= */}
        <div className="p-2.5 sm:p-4 md:p-5 flex flex-col flex-1 bg-white dark:bg-transparent">
          {/* Brand & Stock Pill */}
          <div className="flex items-center justify-between gap-1.5 mb-1 sm:mb-1.5">
            <span className="text-[9.5px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {product.brandName || product.brand?.name || "AUTHENTIC"}
            </span>

            <span
              className={`text-[9px] sm:text-[10px] font-semibold flex items-center gap-1 shrink-0 ${
                (product.stock ?? 1) <= 0
                  ? "text-red-500 dark:text-red-400 font-bold"
                  : (product.stock ?? 1) <= 5
                  ? "text-amber-500 dark:text-amber-400 font-mono font-bold"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  (product.stock ?? 1) <= 0
                    ? "bg-red-500 dark:bg-red-400"
                    : (product.stock ?? 1) <= 5
                    ? "bg-amber-500 dark:bg-amber-400 animate-ping"
                    : "bg-emerald-500 dark:bg-emerald-400"
                }`}
              />
              <span className="hidden xs:inline">
                {(product.stock ?? 1) <= 0
                  ? "Sold Out"
                  : (product.stock ?? 1) <= 5
                  ? `Only ${product.stock} Left`
                  : "In Stock"}
              </span>
            </span>
          </div>

          {/* Product Title */}
          <h3
            className="font-heading font-semibold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight sm:leading-snug mb-1.5 sm:mb-2 min-h-[2rem] sm:min-h-[2.6rem]"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Ratings & Reviews */}
          <div className="flex items-center gap-1.5 mb-2 sm:mb-3 text-xs">
            <div className="flex items-center text-amber-500 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-amber-400 mr-1" />
              <span className="font-bold text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-300">
                {product.rating ? Number(product.rating).toFixed(1) : "4.9"}
              </span>
            </div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] sm:text-xs truncate">
              ({product.numReviews || "150+"})
            </span>
          </div>

          {/* Amazon-Style Delivery Signal */}
          <div className="hidden xs:flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 mb-2.5 sm:mb-4 bg-slate-100 dark:bg-white/[0.03] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-slate-200 dark:border-white/5 w-fit">
            <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-600 dark:text-cyan-300" />
            <span>
              <strong className="text-slate-800 dark:text-white font-medium">Fast Dispatch</strong> · Insured
            </span>
          </div>

          {/* Price Block & Action Button */}
          <div className="mt-auto pt-2 sm:pt-3 border-t border-slate-200 dark:border-white/[0.08] space-y-2 sm:space-y-3">
            <div className="flex items-baseline justify-between gap-1">
              <div className="truncate">
                <span className="font-heading font-black text-sm sm:text-base md:text-xl text-slate-900 dark:text-white tracking-tight">
                  {formatINR(salePrice)}
                </span>
                {regularPrice > salePrice && (
                  <span className="ml-1.5 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 line-through">
                    {formatINR(regularPrice)}
                  </span>
                )}
              </div>

              {/* Monthly EMI pill */}
              <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-tech hidden xs:inline shrink-0">
                or {formatINR(monthlyEmi)}/mo
              </span>
            </div>

            {/* Interactive Add to Cart CTA */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full h-8 sm:h-10 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 active:scale-98 shadow-md ${
                product.stock === 0
                  ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-white/5"
                  : isAdded
                  ? "bg-emerald-500 text-white dark:text-black border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
                  : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 shadow-md cursor-pointer"
              }`}
            >
              {product.stock === 0 ? (
                <span>Out of Stock</span>
              ) : isAdded ? (
                <>
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white dark:text-black" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
