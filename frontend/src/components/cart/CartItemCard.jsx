import React from "react";
import { Link } from "react-router-dom";
import { Plus, Minus, Trash2, Heart, Check, ExternalLink } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";



export default function CartItemCard({
  item,
  onUpdateQuantity,
  onRemoveItem,
  onMoveToWishlist,
}) {
  const product = item.product || item;
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) =>
    state.isInWishlist(product._id)
  );

  const price = product.salePrice ?? product.regularPrice ?? 0;
  const regularPrice = product.regularPrice ?? price;
  const hasDiscount = regularPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0;

  const lineTotal = price * (item.quantity || 1);
  const stockLimit = product.stock ?? 10;
  const isMaxQuantity = (item.quantity || 1) >= stockLimit;

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const image =
    product.images?.[0]?.url ||
    product.image ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80";

  const productUrl = `/product/${product.slug || product._id}`;

  const handleSaveForLater = () => {
    if (!isInWishlist) {
      toggleWishlist(product);
    }
    if (onMoveToWishlist) {
      onMoveToWishlist(item);
    } else {
      onRemoveItem(product._id, item.selectedColor || item.color);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-xs hover:border-orange-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Product Image & Information */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1 w-full sm:w-auto">
        <Link
          to={productUrl}
          className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-slate-100 dark:bg-[#07090e] border border-slate-200 dark:border-white/10 shrink-0 overflow-hidden p-2 flex items-center justify-center group/thumb relative"
          title="View product details"
        >
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-contain group-hover/thumb:scale-108 transition-transform duration-300"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
              {product.brandName || product.brand?.name || "GENUINE GEAR"}
            </span>

            {product.categoryName && (
              <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-md">
                {product.categoryName}
              </span>
            )}
          </div>

          <Link
            to={productUrl}
            className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors line-clamp-1 block tracking-tight"
            title={product.title}
          >
            {product.title}
          </Link>

          {(item.selectedColor || item.color) && (
            <span className="inline-block mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              Color: <strong className="text-slate-800 dark:text-slate-200">{item.selectedColor || item.color}</strong>
            </span>
          )}

          {/* Unit price & discounts */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
              {formatINR(price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-[11px] font-mono text-slate-400 line-through">
                  {formatINR(regularPrice)}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Secondary Quick Actions: Save for later & Specs */}
          <div className="flex items-center gap-3 mt-2 text-[11px]">
            <button
              type="button"
              onClick={handleSaveForLater}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 font-medium transition-colors cursor-pointer"
            >
              <Heart className={`h-3 w-3 ${isInWishlist ? "fill-orange-500 text-orange-500" : ""}`} />
              <span>{isInWishlist ? "Saved in Wishlist" : "Save for Later"}</span>
            </button>

            <Link
              to={productUrl}
              className="hidden xs:inline-flex items-center gap-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Product Specs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quantity Stepper, Line Total & Remove Action */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/[0.06] shrink-0">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-slate-300 dark:border-white/15 rounded-xl bg-slate-50 dark:bg-white/[0.04] overflow-hidden">
          <button
            type="button"
            onClick={() =>
              onUpdateQuantity(
                product._id,
                Math.max(1, (item.quantity || 1) - 1),
                item.selectedColor || item.color
              )
            }
            disabled={(item.quantity || 1) <= 1}
            className="h-8 w-8 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
            title="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="h-8 w-10 flex items-center justify-center font-mono font-bold text-xs text-slate-900 dark:text-white border-x border-slate-300 dark:border-white/10 bg-white dark:bg-black/40">
            {item.quantity || 1}
          </span>
          <button
            type="button"
            onClick={() =>
              onUpdateQuantity(
                product._id,
                (item.quantity || 1) + 1,
                item.selectedColor || item.color
              )
            }
            disabled={isMaxQuantity}
            className="h-8 w-8 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
            title={isMaxQuantity ? "Max stock reached" : "Increase quantity"}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Line Total */}
        <div className="text-right min-w-[95px]">
          <span className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white block">
            {formatINR(lineTotal)}
          </span>
          {(item.quantity || 1) > 1 && (
            <span className="text-[10px] text-slate-400 font-mono">
              {formatINR(price)} each
            </span>
          )}
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemoveItem(product._id, item.selectedColor || item.color)}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Remove from bag"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
