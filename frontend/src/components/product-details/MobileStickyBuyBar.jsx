import React from "react";
import { ShoppingBag, Check, Zap } from "lucide-react";

export default function MobileStickyBuyBar({
  product,
  selectedColor,
  activePrice,
  isAdded,
  onAddToCart,
  stock = 0,
}) {
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const isOut = stock === 0;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        {/* Left: Product Thumbnail & Price */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              src={
                selectedColor?.images?.[0]?.url ||
                product.images?.[0]?.url ||
                product.image
              }
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight truncate">
              {formatINR(activePrice)}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {selectedColor && (
                <span
                  style={{ backgroundColor: selectedColor.colorCode }}
                  className="w-2.5 h-2.5 rounded-full inline-block border border-black/20 shrink-0"
                />
              )}
              <span className="truncate">
                {selectedColor?.colorName || "Standard"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Add to Cart CTA */}
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isOut}
          className={`flex-1 max-w-[180px] h-11 px-4 rounded-xl text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md border-2 ${
            isOut
              ? "bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 border-transparent cursor-not-allowed"
              : isAdded
              ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/30 cursor-pointer"
              : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-white/20 shadow-md cursor-pointer"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 stroke-[3] text-white shrink-0" />
              <span className="text-white font-extrabold">Added!</span>
            </>
          ) : isOut ? (
            <span className="text-slate-400">Sold Out</span>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-white shrink-0" />
              <span className="text-white font-bold">Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
