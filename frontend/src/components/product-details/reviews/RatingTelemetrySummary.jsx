import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  ShieldCheck,
  Sparkles,
  Edit3,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";

const STAR_DESCRIPTIONS = {
  1: "1★ Poor",
  2: "2★ Fair",
  3: "3★ Good",
  4: "4★ Very Good",
  5: "5★ Elite Tier",
};

/**
 * RatingTelemetrySummary component
 * Compact, industrial-grade unified rating and interactive review bar.
 *
 * @param {Object} props
 * @param {Object} props.ratingStats - { averageRating, totalReviews }
 * @param {Function} props.onRate - callback when user clicks a star (1-5)
 * @param {Function} props.onOpenWriteModal - callback to open write review dialog
 * @param {Function} props.onOpenEditModal - callback to open edit review dialog
 * @param {Object} [props.eligibilityData] - { canReview, hasReviewed, existingReview }
 * @param {boolean} [props.isLoadingEligibility] - loading state for eligibility
 * @param {boolean} [props.isAuthenticated] - whether current user is logged in
 */
export default function RatingTelemetrySummary({
  ratingStats,
  onRate,
  onOpenWriteModal,
  onOpenEditModal,
  eligibilityData,
  isLoadingEligibility = false,
  isAuthenticated = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const averageRating = Number(ratingStats?.averageRating || 0);
  const totalReviews = Number(ratingStats?.totalReviews || 0);

  const { canReview, hasReviewed, existingReview } = eligibilityData || {};
  const userRating = existingReview?.rating || null;
  const activeRating = hoverRating || userRating || 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 shadow-xs transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        {/* Left: Overall Score & Verified Badge */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-baseline gap-2.5">
            <span className="font-heading font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight leading-none">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>

            <div className="space-y-0.5">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200 dark:text-white/15"
                    }`}
                  />
                ))}
              </div>

              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {totalReviews > 0 ? (
                  <>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {totalReviews}
                    </span>{" "}
                    {totalReviews === 1 ? "verified review" : "verified reviews"}
                  </>
                ) : (
                  "No ratings yet"
                )}
              </p>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-white/10" />

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        </div>

        {/* Center: Compact Interactive Click-to-Rate Stars */}
        <div className="flex items-center justify-between sm:justify-start gap-3 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              {hasReviewed ? "Your Rating" : "Rate Hardware"}
            </span>
            <span className="text-xs font-heading font-semibold text-amber-600 dark:text-amber-400 truncate max-w-[120px] block">
              {hoverRating
                ? STAR_DESCRIPTIONS[hoverRating]
                : hasReviewed
                ? `Rated ${userRating} ★`
                : "Click star to rate"}
            </span>
          </div>

          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                aria-label={`Rate ${star} star`}
                className="p-1 rounded-lg hover:scale-125 transition-transform duration-150 cursor-pointer focus:outline-hidden"
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
                    star <= activeRating
                      ? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_4px_rgba(251,191,36,0.4)]"
                      : "text-slate-300 dark:text-white/20 hover:text-amber-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Primary Contextual Action Button */}
        <div className="shrink-0 flex items-center">
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-heading font-bold text-xs transition-all shadow-xs active:scale-95 w-full sm:w-auto"
            >
              <span>Sign in to Rate</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : isLoadingEligibility ? (
            <div className="h-8 w-28 bg-slate-100 dark:bg-white/10 rounded-xl animate-pulse" />
          ) : hasReviewed && existingReview ? (
            <button
              type="button"
              onClick={() => onOpenEditModal(existingReview)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-heading font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              <Edit3 className="h-3.5 w-3.5 text-amber-500" />
              <span>Edit Your Review</span>
            </button>
          ) : canReview ? (
            <button
              type="button"
              onClick={onOpenWriteModal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-xs shadow-orange-500/25 active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              <Sparkles className="h-3.5 w-3.5 fill-white" />
              <span>Write Review</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-[11px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-white/5">
              <Lock className="h-3 w-3 text-slate-400" />
              <span>Verified buyers only</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
