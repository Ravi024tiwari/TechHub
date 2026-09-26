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
  Percent,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

/**
 * Production-Grade Interactive Flagship Product Card:
 * - Direct architectural sibling of the Admin Product Card.
 * - Optimized for high-density 2-column mobile layout and responsive multi-column desktop.
 * - Cinematic edge-to-edge image showcase with top/bottom contrast vignettes.
 * - Brushed silver metallic borders with ambient light glow on hover.
 * - Tactile 1-click Add to Cart with instant visual feedback.
 */
export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) =>
    state.isInWishlist(product._id)
  );

  // Price & Discount Calculations
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
    }).format(val || 0);

  // Estimate monthly EMI
  const monthlyEmi = Math.round(salePrice / 12);

  // Fallback image handling
  const mainImage =
    product.images?.[0]?.url ||
    product.image ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80";

  const productUrl = `/product/${product.slug || product._id}`;

  const handleCardClick = () => {
    navigate(productUrl);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) return;

    addItem(product, 1);
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const stock = product.stock ?? 0;
  const isLowStock = stock > 0 && stock <= (product.lowStockThreshold || 5);
  const isOutOfStock = stock === 0;

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-white shadow-sm hover:shadow-lg dark:border-white/20 dark:sm:border-white/15 dark:hover:border-white/50 dark:active:border-white/60 dark:bg-gradient-to-b dark:from-[#141824] dark:via-[#0d1017] dark:to-[#080a0e] dark:shadow-[0_4px_20px_rgba(0,0,0,0.7),_0_0_10px_rgba(255,255,255,0.05)] dark:hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.9),_0_0_25px_rgba(255,255,255,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer touch-pan-y select-none"
    >
      {/* =========================================================================
          TOP SECTION: Full-Width Image Showcase with Overlays (Admin-Grade)
          ========================================================================= */}
      <div className="relative w-full aspect-[4/3] xs:aspect-square sm:aspect-auto sm:h-52 lg:h-56 overflow-hidden bg-slate-100 dark:bg-[#0c0f16] border-b border-slate-200 dark:border-white/15 sm:dark:border-white/10">
        {/* Product Image */}
        <img
          src={mainImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
        />

        {/* Gradient overlays for cinematic contrast */}
        <div className="absolute inset-x-0 top-0 h-14 sm:h-20 bg-gradient-to-b from-black/85 via-black/45 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-12 sm:h-16 bg-gradient-to-t from-[#080a0e] via-[#080a0e]/60 to-transparent pointer-events-none" />

        {/* Top-Left Category & Discount Badge */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-10 max-w-[65%]">
          <span className="px-1.5 sm:px-2.5 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-mono font-bold tracking-wider uppercase bg-black/75 text-white backdrop-blur-md border border-white/15 shadow-sm truncate">
            {product.categoryName || product.category?.name || "Hardware"}
          </span>

          {discountPercent > 0 && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-mono font-bold tracking-wider uppercase bg-rose-500 text-white shadow-md flex items-center gap-0.5 sm:gap-1 w-fit">
              <Percent className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Top-Right Floating Wishlist Toggle */}
        <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10">
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-md border transition-all duration-200 active:scale-90 cursor-pointer shadow-md ${
              isInWishlist
                ? "bg-rose-500/30 border-rose-500/60 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                : "bg-black/75 border-white/15 text-slate-300 hover:text-white hover:bg-white/15"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
                isInWishlist ? "fill-rose-500 text-rose-500 scale-110" : ""
              }`}
            />
          </button>
        </div>

        {/* Bottom Bar on Image: Live Stock Badge & Brand Pill */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2.5 sm:left-2.5 sm:right-2.5 flex items-center justify-between gap-1 z-10">
          <span
            className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8.5px] sm:text-[10.5px] font-mono font-bold tracking-tight backdrop-blur-md border flex items-center gap-1 shadow-md truncate ${
              isOutOfStock
                ? "bg-rose-500/25 text-rose-300 border-rose-500/40"
                : isLowStock
                ? "bg-amber-500/25 text-amber-300 border-amber-500/40"
                : "bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOutOfStock
                  ? "bg-rose-400"
                  : isLowStock
                  ? "bg-amber-400 animate-ping"
                  : "bg-emerald-400"
              }`}
            />
            <span>
              {isOutOfStock
                ? "Sold Out"
                : isLowStock
                ? `Only ${product.stock} Left`
                : "In Stock"}
            </span>
          </span>

          {(product.brandName || product.brand?.name) && (
            <span className="text-[8.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 bg-black/60 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md border border-white/10 hidden min-[440px]:inline-block truncate">
              {product.brandName || product.brand?.name}
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SECTION: Title, Rating, Price & Add to Cart CTA
          ========================================================================= */}
      <div className="p-2.5 sm:p-3.5 md:p-4 flex flex-col flex-1 bg-white dark:bg-transparent">
        {/* Product Title */}
        <h3
          className="font-heading font-semibold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors line-clamp-2 leading-tight sm:leading-snug mb-1.5 sm:mb-2 min-h-[2rem] sm:min-h-[2.4rem]"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-1.5 mb-2 sm:mb-3 text-xs">
          <div className="flex items-center text-amber-500 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-amber-400 mr-1" />
            <span className="font-bold text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-300">
              {product.averageRating && product.averageRating > 0
                ? Number(product.averageRating).toFixed(1)
                : "4.8"}
            </span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 text-[10px] sm:text-[11px] truncate">
            ({product.numReviews || "120+"})
          </span>
        </div>

        {/* Price & Action Button Footer */}
        <div className="mt-auto pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-white/[0.08] space-y-2 sm:space-y-2.5">
          <div className="flex items-baseline justify-between gap-1">
            <div className="truncate">
              <span className="font-heading font-black text-sm sm:text-base md:text-lg text-slate-900 dark:text-white tracking-tight">
                {formatINR(salePrice)}
              </span>
              {regularPrice > salePrice && (
                <span className="ml-1 text-[10px] sm:text-xs text-slate-400 line-through">
                  {formatINR(regularPrice)}
                </span>
              )}
            </div>

            {/* Monthly EMI */}
            <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-tech hidden sm:inline shrink-0">
              EMI {formatINR(monthlyEmi)}/mo
            </span>
          </div>

          {/* Dual Action Buttons: View Details + Add to Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
            {/* Dedicated View Details Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(productUrl);
              }}
              className="px-2 sm:px-2.5 h-7.5 sm:h-9 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
              title="View Product Specifications & Unboxing"
            >
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-sky-500" />
              <span className="hidden xs:inline">Details</span>
            </button>

            {/* Tactile Add to Cart CTA */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 h-7.5 sm:h-9 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 active:scale-98 shadow-sm ${
                isOutOfStock
                  ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-white/5"
                  : isAdded
                  ? "bg-emerald-500 text-white border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] cursor-pointer"
                  : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 hover:shadow-md cursor-pointer"
              }`}
            >
              {isOutOfStock ? (
                <span>Sold Out</span>
              ) : isAdded ? (
                <>
                  <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
                  <span className="truncate">Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="truncate">Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
