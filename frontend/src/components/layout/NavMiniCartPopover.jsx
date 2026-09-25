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
        className={`relative flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all ${
          isOpen
            ? "bg-white/10 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200 hover:text-white"
        }`}
      >
        <div className="relative">
          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-3.5 min-w-3.5 sm:h-4 sm:min-w-4 px-1 rounded-full bg-white text-black text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center animate-in zoom-in">
              {cartCount}
            </span>
          )}
        </div>
        <div className="hidden xl:flex flex-col text-left">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-tech leading-none">
            Cart Total
          </span>
          <span className="text-xs font-bold text-white font-mono">
            {formatINR(cartSubtotal)}
          </span>
        </div>
      </Link>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] rounded-2xl bg-[#090b10]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                Your Shopping Bag ({cartCount})
              </span>
            </div>
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              View Full Cart
            </Link>
          </div>

          {items.length > 0 ? (
            <>
              {/* Free Shipping Progress */}
              <div className="py-2.5 px-3 my-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  {isFreeShipping ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Unlocked Free Express Shipping!</span>
                    </span>
                  ) : (
                    <span className="text-slate-300">
                      Add <strong className="text-white font-mono">{formatINR(amountToFreeShipping)}</strong> for Free Delivery
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Math.round(shippingProgress)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items List (Show up to 3) */}
              <div className="max-h-[220px] overflow-y-auto divide-y divide-white/[0.04] py-1">
                {items.slice(0, 3).map((item) => (
                  <div
                    key={`${item._id}-${item.selectedColor || "default"}`}
                    className="py-2.5 flex items-center gap-3 group"
                  >
                    <div className="h-11 w-11 rounded-lg bg-black/50 border border-white/10 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={typeof item.image === "object" ? item.image.url : item.image}
                          alt={item.title}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ShoppingBag className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[11px] text-slate-400">
                          Qty: <strong className="text-slate-200">{item.quantity}</strong> × {formatINR(item.salePrice || item.regularPrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item._id, item.selectedColor)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {items.length > 3 && (
                  <div className="py-2 text-center text-[11px] text-slate-400">
                    + {items.length - 3} more items in cart
                  </div>
                )}
              </div>

              {/* Subtotal & Checkout CTA */}
              <div className="pt-3 border-t border-white/[0.08] space-y-2.5 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Subtotal</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {formatINR(cartSubtotal)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2 text-center rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all"
                  >
                    View Bag
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2 text-center rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center justify-center gap-1.5"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                <PackageOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Your bag is empty</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Browse our top flagship deals & hardware
                </p>
              </div>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-white transition-all"
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
