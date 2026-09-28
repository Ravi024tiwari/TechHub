import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight, Trash2, CheckCircle2, PackageOpen } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function NavMiniCartPopover() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const items = useCartStore((state) => state.items);
  const cartCount = useCartStore((state) => state.getTotalCount());
  const cartSubtotal = useCartStore((state) => state.getSubtotal());
  const removeItem = useCartStore((state) => state.removeItem);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const FREE_SHIPPING_THRESHOLD = 1999;
  const isFreeShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const shippingProgress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div
      ref={popoverRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <Link
        to="/cart"
        onClick={() => setIsOpen(false)}
        aria-label="Shopping Cart"
        className={`relative flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all cursor-pointer select-none ${
          isOpen
            ? "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:bg-white/10 dark:text-white dark:border-white/20 shadow-xs"
            : "bg-slate-100 hover:bg-slate-200/90 text-slate-800 hover:text-slate-950 border-slate-200/90 hover:border-slate-300 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] dark:text-slate-200 dark:hover:text-white dark:border-white/10 shadow-2xs"
        }`}
      >
        <div className="relative flex items-center justify-center">
          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-slate-800 dark:text-white transition-transform group-hover:scale-105" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-orange-500 text-white text-[9px] sm:text-[10px] font-mono font-bold flex items-center justify-center shadow-xs border-2 border-white dark:border-[#0a0d14] animate-in zoom-in">
              {cartCount}
            </span>
          )}
        </div>
        <div className="hidden xl:flex flex-col text-left">
          <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-tech leading-none">
            Cart Total
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
            {formatINR(cartSubtotal)}
          </span>
        </div>
      </Link>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] rounded-2xl bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
                Your Shopping Bag ({cartCount})
              </span>
            </div>
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-orange-600 hover:text-orange-700 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors"
            >
              View Full Cart
            </Link>
          </div>

          {items.length > 0 ? (
            <>
              {/* Free Shipping Progress */}
              <div className="py-2.5 px-3 my-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  {isFreeShipping ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Unlocked Free Express Shipping!</span>
                    </span>
                  ) : (
                    <span className="text-slate-600 dark:text-slate-300">
                      Add <strong className="text-slate-900 dark:text-white font-mono">{formatINR(amountToFreeShipping)}</strong> for Free Delivery
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Math.round(shippingProgress)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items List (Show up to 3) */}
              <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04] py-1">
                {items.slice(0, 3).map((item) => (
                  <div
                    key={`${item._id}-${item.selectedColor || "default"}`}
                    className="py-2.5 flex items-center gap-3 group"
                  >
                    <div className="h-11 w-11 rounded-lg bg-slate-100 dark:bg-black/50 border border-slate-200/80 dark:border-white/10 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={typeof item.image === "object" ? item.image.url : item.image}
                          alt={item.title}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ShoppingBag className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Qty: <strong className="text-slate-800 dark:text-slate-200">{item.quantity}</strong> × {formatINR(item.salePrice || item.regularPrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item._id, item.selectedColor)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {items.length > 3 && (
                  <div className="py-2 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    + {items.length - 3} more items in cart
                  </div>
                )}
              </div>

              {/* Subtotal & Checkout CTA */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] space-y-2.5 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {formatINR(cartSubtotal)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2 text-center rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/90 text-xs font-semibold text-slate-800 hover:text-slate-950 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:border-white/10 dark:text-slate-200 dark:hover:text-white transition-all cursor-pointer"
                  >
                    View Bag
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2 text-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-slate-400">
                <PackageOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Your bag is empty</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Browse our top flagship deals & hardware
                </p>
              </div>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>Discover Tech</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
