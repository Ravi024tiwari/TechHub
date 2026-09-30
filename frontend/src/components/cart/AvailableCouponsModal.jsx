import React from "react";
import { X, Sparkles, Check, AlertCircle, ArrowRight, Tag, Ticket } from "lucide-react";

export default function AvailableCouponsModal({
  isOpen,
  onClose,
  coupons = [],
  currentCartTotal = 0,
  appliedCouponCode = "",
  onSelectCoupon,
}) {
  if (!isOpen) return null;

  // Format currency
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c0e15] border-2 border-slate-200 dark:border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shadow-xs">
              <Ticket className="size-4.5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-950 dark:text-white">
                Available Offers & Coupons
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Cart subtotal: <strong>{formatINR(currentCartTotal)}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Coupon List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {coupons.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No promotional coupons currently available.
            </div>
          ) : (
            coupons.map((coupon) => {
              const isEligible = currentCartTotal >= (coupon.minOrderValue || 0);
              const shortfall = Math.max(0, (coupon.minOrderValue || 0) - currentCartTotal);
              const isCurrentlyApplied = appliedCouponCode?.toUpperCase() === coupon.code?.toUpperCase();

              // Estimated discount calculation
              let estimatedSavings = 0;
              if (coupon.discountType === "PERCENTAGE") {
                estimatedSavings = Math.round((currentCartTotal * coupon.discountValue) / 100);
                if (coupon.maxDiscountAmount) {
                  estimatedSavings = Math.min(estimatedSavings, coupon.maxDiscountAmount);
                }
              } else {
                estimatedSavings = Math.min(coupon.discountValue, currentCartTotal);
              }

              return (
                <div
                  key={coupon._id || coupon.code}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-2.5 ${
                    isCurrentlyApplied
                      ? "border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-500/[0.05]"
                      : isEligible
                      ? "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-slate-400 dark:hover:border-white/25 shadow-xs"
                      : "border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] opacity-70"
                  }`}
                >
                  {/* Top discount headline & code */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {coupon.badgeText && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 mb-1">
                          {coupon.badgeText}
                        </span>
                      )}
                      <h4 className="font-heading font-black text-sm sm:text-base text-slate-950 dark:text-white">
                        {coupon.discountType === "PERCENTAGE"
                          ? `${coupon.discountValue}% OFF`
                          : `${formatINR(coupon.discountValue)} FLAT OFF`}
                        {coupon.maxDiscountAmount && coupon.discountType === "PERCENTAGE" && (
                          <span className="text-[11px] font-normal text-slate-500 font-mono ml-1.5">
                            (Up to {formatINR(coupon.maxDiscountAmount)})
                          </span>
                        )}
                      </h4>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-dashed border-slate-300 dark:border-white/15 text-xs font-mono font-black text-slate-900 dark:text-white uppercase">
                      {coupon.code}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {coupon.description}
                  </p>

                  {/* Requirements & Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/5 gap-3">
                    <div>
                      {isEligible ? (
                        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="size-3" />
                          <span>Saves {formatINR(estimatedSavings)}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="size-3" />
                          <span>Add {formatINR(shortfall)} more</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectCoupon(coupon.code)}
                      disabled={isCurrentlyApplied || !isEligible}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrentlyApplied
                          ? "bg-emerald-600 text-white cursor-default"
                          : isEligible
                          ? "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-xs hover:scale-102"
                          : "bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-white/40 cursor-not-allowed"
                      }`}
                    >
                      {isCurrentlyApplied ? "Applied" : "Apply Offer"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
