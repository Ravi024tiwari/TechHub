import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Gift,
  Crown,
  Percent,
  Tag,
  Flame,
  ShieldCheck,
  Copy,
  Check,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Power,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Ticket,
} from "lucide-react";

// Curated icon mapping with tailored theme accents
const ICON_MAP = {
  gift: {
    icon: Gift,
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-500/30",
    glow: "rgba(244, 63, 94, 0.4)",
    pill: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
  },
  sparkles: {
    icon: Sparkles,
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-500/30",
    glow: "rgba(99, 102, 241, 0.4)",
    pill: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30",
  },
  zap: {
    icon: Zap,
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/30",
    glow: "rgba(245, 158, 11, 0.4)",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  },
  crown: {
    icon: Crown,
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-500/30",
    glow: "rgba(245, 158, 11, 0.4)",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  },
  percent: {
    icon: Percent,
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-500/30",
    glow: "rgba(59, 130, 246, 0.4)",
    pill: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
  },
  flame: {
    icon: Flame,
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-500/30",
    glow: "rgba(249, 115, 22, 0.4)",
    pill: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30",
  },
  "shield-check": {
    icon: ShieldCheck,
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/30",
    glow: "rgba(16, 185, 129, 0.4)",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
  },
  tag: {
    icon: Tag,
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-500/30",
    glow: "rgba(100, 116, 139, 0.4)",
    pill: "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10",
  },
};

/**
 * Universal Production-Grade Coupon Voucher Card
 * Supports both Admin management and Customer Cart/Checkout
 */
export default function CouponCard({
  coupon,
  mode = "admin",
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling = false,
  onApply,
  isApplied = false,
  currentCartTotal = 0,
}) {
  const [copied, setCopied] = useState(false);

  if (!coupon) return null;

  // Resolve icon branding
  const iconConfig = ICON_MAP[coupon.icon] || ICON_MAP.percent;
  const IconComponent = iconConfig.icon;

  // Status computation
  const now = new Date();
  const expiryDate = new Date(coupon.expiryDate);
  const startDate = coupon.startDate ? new Date(coupon.startDate) : null;
  const isExpired = expiryDate <= now;
  const isUpcoming = startDate && startDate > now;
  const isExhausted = coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit;
  const isLive = coupon.isActive && !isExpired && !isUpcoming && !isExhausted;

  // Currency Formatter
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Short Date Formatter
  const formatShortDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // Days remaining
  const daysRemaining = Math.max(
    0,
    Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
  );

  // Copy code handler
  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Customer eligibility
  const isCustomerEligible = currentCartTotal >= (coupon.minOrderValue || 0);
  const shortfall = Math.max(0, (coupon.minOrderValue || 0) - currentCartTotal);

  // Redemption calculation
  const usageLimit = coupon.usageLimit || 0;
  const usedCount = coupon.usedCount || 0;
  const usagePercent = usageLimit > 0 ? Math.min(100, Math.round((usedCount / usageLimit) * 100)) : 0;

  return (
    <div
      className={`group relative rounded-3xl transition-all duration-300 ease-out flex flex-col justify-between select-none overflow-hidden ${
        isLive
          ? "border-2 border-slate-200/90 dark:border-white/35 hover:border-slate-900 dark:hover:border-white bg-white dark:bg-[#0c0e15] shadow-xs hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.14)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.12),0_20px_45px_-12px_rgba(0,0,0,0.9)] hover:-translate-y-1.5"
          : "border-2 border-slate-200/80 dark:border-white/25 hover:border-slate-400 dark:hover:border-white/45 bg-slate-50/70 dark:bg-[#080a0f] opacity-80"
      }`}
    >
      {/* Corner Theme Ambient Glow on Card Hover */}
      <div
        className="absolute -top-12 -right-12 size-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
        style={{ background: iconConfig.glow }}
      />

      {/* Main Ticket Content Wrapper */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col h-full justify-between space-y-3.5 sm:space-y-4">
        {/* =========================================================
            HEADER: Brand Icon Pod + Discount Value + Status Badge
            ========================================================= */}
        <div className="flex items-start justify-between gap-2.5 sm:gap-3">
          <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            {/* Theme Icon Pod */}
            <div
              className={`size-10 sm:size-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md ${iconConfig.bg} ${iconConfig.border} ${iconConfig.text}`}
            >
              <IconComponent className="size-5 sm:size-6 transition-transform duration-300 group-hover:scale-105" />
            </div>

            {/* Discount Headline & Badge (NO TRUNCATION) */}
            <div className="min-w-0 flex-1">
              {coupon.badgeText && (
                <div className="mb-0.5 sm:mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/20 shadow-2xs">
                    {coupon.badgeText}
                  </span>
                </div>
              )}

              {/* Discount Amount + Max Cap in clear flex row */}
              <div className="flex flex-wrap items-baseline gap-x-1.5 sm:gap-x-2 gap-y-0.5 sm:gap-y-1">
                <span className="font-heading font-black text-lg xs:text-xl sm:text-2xl text-slate-950 dark:text-white tracking-tight leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}% OFF`
                    : `${formatINR(coupon.discountValue)} FLAT OFF`}
                </span>

                {coupon.discountType === "PERCENTAGE" && coupon.maxDiscountAmount && (
                  <span className="inline-flex items-center text-[10px] sm:text-[11px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 border border-slate-200 dark:border-white/20 whitespace-nowrap">
                    Max {formatINR(coupon.maxDiscountAmount)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {isExpired ? (
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30">
                <Clock className="size-3" /> Expired
              </span>
            ) : isExhausted ? (
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
                <AlertCircle className="size-3" /> Limit Reached
              </span>
            ) : isUpcoming ? (
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30">
                <Calendar className="size-3" /> Upcoming
              </span>
            ) : coupon.isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 shadow-2xs">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-slate-200 text-slate-700 border border-slate-300 dark:bg-white/10 dark:text-slate-300 dark:border-white/20">
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* =========================================================
            PROMO CODE BOX WITH 1-CLICK COPY
            ========================================================= */}
        <div
          onClick={handleCopyCode}
          title="Click to copy voucher code"
          className="group/code relative flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100/90 dark:bg-white/[0.05] border-2 border-dashed border-slate-300/90 dark:border-white/30 hover:border-slate-800 dark:hover:border-white/70 hover:bg-slate-200/60 dark:hover:bg-white/[0.09] transition-all duration-200 cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Ticket className="size-3.5 sm:size-4 text-slate-400 dark:text-slate-500 group-hover/code:text-indigo-500 dark:group-hover/code:text-indigo-400 shrink-0 transition-colors" />
            <span className="font-mono font-black text-xs xs:text-sm sm:text-base tracking-wider sm:tracking-widest text-slate-950 dark:text-white uppercase select-all truncate group-hover/code:text-indigo-600 dark:group-hover/code:text-indigo-300 transition-colors">
              {coupon.code}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95 ${
              copied
                ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20"
                : "bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20 dark:text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="size-3 sm:size-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3 sm:size-3.5 group-hover/code:scale-110 transition-transform" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* =========================================================
            TERMS & DESCRIPTION
            ========================================================= */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
          {coupon.description}
        </p>

        {/* Requirements Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
          {coupon.minOrderValue > 0 ? (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/20">
              Min. Cart: <strong>{formatINR(coupon.minOrderValue)}</strong>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              No Minimum Order
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <Clock className="size-3 shrink-0" />
            <span>Valid till {formatShortDate(coupon.expiryDate)}</span>
            {isLive && daysRemaining <= 7 && (
              <strong className="text-amber-600 dark:text-amber-400 font-bold">
                ({daysRemaining}d left)
              </strong>
            )}
          </span>
        </div>

        {/* =========================================================
            ADMIN CONTROLS: REDEMPTION BAR & ACTION BUTTONS
            ========================================================= */}
        {mode === "admin" && (
          <div className="pt-2.5 sm:pt-3 border-t border-slate-200 dark:border-white/20 space-y-2.5 sm:space-y-3.5">
            {/* Redemption Progress Indicator */}
            {coupon.usageLimit ? (
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Usage Redemptions</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {usedCount} / {usageLimit} ({usagePercent}%)
                  </span>
                </div>
                <div className="h-1.5 sm:h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usagePercent >= 85
                        ? "bg-gradient-to-r from-amber-500 to-rose-500"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Total Redemptions</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {usedCount} (Unlimited)
                </span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
              {/* Toggle Active Button */}
              <button
                type="button"
                onClick={() => onToggleStatus && onToggleStatus(coupon)}
                disabled={isToggling}
                title={coupon.isActive ? "Deactivate promo code" : "Activate promo code"}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-102 active:scale-98 ${
                  coupon.isActive
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20 dark:text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                }`}
              >
                <Power
                  className={`size-3.5 ${
                    coupon.isActive ? "text-emerald-500" : "text-white"
                  }`}
                />
                <span>{coupon.isActive ? "Deactivate" : "Activate"}</span>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Edit Button */}
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(coupon)}
                    title="Edit campaign settings"
                    className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20 dark:text-white text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Edit2 className="size-3.5" />
                    <span>Edit</span>
                  </button>
                )}

                {/* Delete Button */}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(coupon)}
                    title="Archive or delete coupon"
                    className="inline-flex items-center justify-center size-8 sm:size-8.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-200 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:border-rose-500/40 dark:text-rose-400 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="size-3.5 sm:size-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            CUSTOMER ACTIONS (Cart / Checkout)
            ========================================================= */}
        {mode === "customer" && (
          <div className="pt-3 border-t border-slate-200 dark:border-white/20 flex items-center justify-between gap-3">
            <div>
              {currentCartTotal > 0 && (
                <>
                  {isCustomerEligible ? (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="size-3" /> Eligible for your cart
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="size-3" /> Add {formatINR(shortfall)} more
                    </span>
                  )}
                </>
              )}
            </div>

            {onApply && (
              <button
                type="button"
                onClick={() => onApply(coupon.code)}
                disabled={isApplied || (!isCustomerEligible && currentCartTotal > 0)}
                className={`group/btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isApplied
                    ? "bg-emerald-600 text-white cursor-default shadow-sm ring-2 ring-emerald-500/20"
                    : isCustomerEligible || currentCartTotal === 0
                    ? "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    : "bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-white/40 cursor-not-allowed"
                }`}
              >
                <span>{isApplied ? "Applied" : "Apply Code"}</span>
                {!isApplied && (
                  <ArrowRight className="size-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
