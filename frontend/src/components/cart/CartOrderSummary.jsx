import React from "react";
import {
  Truck,
  Tag,
  Check,
  Lock,
  Loader2,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";


export default function CartOrderSummary({
  subtotal = 0,
  totalItemsCount = 0,
  appliedDiscount = 0,
  finalTotal = 0,
  couponCode = "",
  setCouponCode,
  couponSuccess = "",
  couponError = "",
  onApplyCoupon,
  onRemoveCoupon,
  selectedAddress,
  paymentMethod = "COD",
  isSubmittingOrder = false,
  orderError = "",
  onProceedCheckout,
}) {
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-xs space-y-5">
      <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        Order Summary
      </h3>

      {/* Financial Line Items */}
      <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-white/[0.06]">
        <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1 font-sans">
          <span>Items Subtotal ({totalItemsCount})</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {formatINR(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-3 font-sans">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Insured Express Courier</span>
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
            FREE
          </span>
        </div>

        {appliedDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-3 font-sans">
            <span className="flex items-center gap-1 font-medium">
              <Tag className="h-3 w-3" />
              <span>Coupon Savings</span>
            </span>
            <span className="font-mono font-bold">
              -{formatINR(appliedDiscount)}
            </span>
          </div>
        )}

        {/* Grand Total Payable */}
        <div className="flex justify-between items-baseline text-slate-900 dark:text-white pt-4">
          <div>
            <span className="font-heading font-black text-base block">
              Total Payable
            </span>
            <span className="text-[11px] text-slate-400 font-sans block">
              Inclusive of all taxes & insurance
            </span>
          </div>
          <span className="font-mono font-black text-xl sm:text-2xl text-orange-600 dark:text-orange-500">
            {formatINR(finalTotal)}
          </span>
        </div>
      </div>

      {/* Interactive Coupon / Voucher Form */}
      <div className="pt-2 space-y-2">
        {couponSuccess ? (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold font-sans">
              <Check className="h-3.5 w-3.5" />
              <span>{couponSuccess}</span>
            </div>
            {onRemoveCoupon && (
              <button
                type="button"
                onClick={onRemoveCoupon}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                title="Remove coupon"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={onApplyCoupon} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="PROMO CODE (e.g. TECH10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs uppercase font-mono rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                className="h-9 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all cursor-pointer"
              >
                Apply
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <Sparkles className="h-3 w-3 text-orange-500 shrink-0" />
              <span>Try:</span>
              <button
                type="button"
                onClick={() => setCouponCode("TECH10")}
                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] hover:bg-orange-500/10 hover:text-orange-500 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              >
                TECH10 (10% OFF)
              </button>
              <button
                type="button"
                onClick={() => setCouponCode("PRO2000")}
                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] hover:bg-orange-500/10 hover:text-orange-500 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              >
                PRO2000 (₹2K Flat)
              </button>
            </div>

            {couponError && (
              <p className="text-[11px] text-rose-500 font-medium font-sans">
                {couponError}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Selected Delivery Destination Preview */}
      {selectedAddress && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-xs space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Shipping Destination:
          </span>
          <p className="font-bold text-slate-900 dark:text-white truncate">
            {selectedAddress.fullName}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate font-sans">
            {selectedAddress.city}, {selectedAddress.state} ({selectedAddress.pincode})
          </p>
        </div>
      )}

      {/* Error Callout */}
      {orderError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      {/* Solid Brand Orange Checkout Action */}
      <button
        type="button"
        onClick={onProceedCheckout}
        disabled={isSubmittingOrder}
        className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-heading font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmittingOrder ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        <span>
          {isSubmittingOrder
            ? "Securing & Placing Order..."
            : paymentMethod === "COD"
            ? "Confirm COD Order"
            : "Proceed to Payment Gateway"}
        </span>
      </button>

      {/* Trust & Guarantee Seals */}
      <div className="pt-2 flex items-center justify-center gap-4 text-[11px] font-sans text-slate-400">
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>256-Bit SSL</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1">
          <RotateCcw className="h-3.5 w-3.5 text-orange-500" />
          <span>7-Day Return</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1">
          <Truck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Free Express</span>
        </div>
      </div>
    </div>
  );
}
