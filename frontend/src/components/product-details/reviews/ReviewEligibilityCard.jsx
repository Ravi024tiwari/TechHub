import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Star,
  Edit3,
  Lock,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * ReviewEligibilityCard component
 * Informs the user of their review status (verified purchase confirmed, already reviewed, or login/delivery required).
 */
export default function ReviewEligibilityCard({
  eligibilityData,
  isLoadingEligibility,
  onOpenWriteModal,
  onOpenEditModal,
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 1. Not Authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-[#0d111a] dark:to-[#07090e] border border-slate-700/60 dark:border-white/10 text-white shadow-md flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Star className="h-4 w-4 fill-amber-400" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Verified Hardware Feedback
            </span>
          </div>

          <h3 className="font-heading font-black text-xl text-white">
            Have hands-on experience with this device?
          </h3>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Sign in to check verified buyer eligibility and share your authentic benchmarks with the community.
          </p>
        </div>

        <div className="pt-5 mt-4 border-t border-white/10">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            <span>Sign in to Review</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // 2. Loading Eligibility
  if (isLoadingEligibility) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 animate-pulse space-y-4">
        <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-full" />
        <div className="h-6 w-48 bg-slate-200 dark:bg-white/10 rounded-md" />
        <div className="h-10 w-full bg-slate-200 dark:bg-white/10 rounded-2xl" />
      </div>
    );
  }

  const { canReview, hasReviewed, existingReview } = eligibilityData || {};

  // 3. Already Reviewed (Allow Edit)
  if (hasReviewed && existingReview) {
    return (
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-white dark:from-emerald-500/10 dark:via-[#0c0f17] dark:to-[#080b12] border border-emerald-500/30 shadow-sm flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Review Submitted
            </span>
          </div>

          <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">
            Your review is live
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
            Thank you for contributing verified benchmarks! You rated this product{" "}
            <span className="font-bold text-amber-500">{existingReview.rating} Stars</span>. You can update your feedback anytime.
          </p>
        </div>

        <div className="pt-5 mt-4 border-t border-slate-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={() => onOpenEditModal(existingReview)}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            <span>Update Your Review</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Eligible to Review (Verified Buyer with Delivered Order)
  if (canReview) {
    return (
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent dark:from-amber-500/20 dark:via-orange-500/10 dark:to-transparent border-2 border-amber-500/40 shadow-lg shadow-amber-500/5 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <Sparkles className="h-4 w-4 fill-amber-400 text-amber-400" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Verified Order Delivered
            </span>
          </div>

          <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">
            Write a Verified Review
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
            Your delivery for this product was confirmed! Help other electronics enthusiasts by rating thermals, battery life, and build quality.
          </p>
        </div>

        <div className="pt-5 mt-4 border-t border-amber-500/20">
          <button
            type="button"
            onClick={onOpenWriteModal}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-heading font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer"
          >
            <Star className="h-4 w-4 fill-white" />
            <span>Write a Verified Review</span>
          </button>
        </div>
      </div>
    );
  }

  // 5. Ineligible (Has not purchased or order is not yet delivered)
  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 shadow-xs flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-400 border border-slate-200 dark:border-white/10">
            <Lock className="h-4 w-4" />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Verified Buyers Only
          </span>
        </div>

        <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
          Authentic Benchmarks
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
          To ensure 100% genuine feedback, only customers with confirmed, delivered orders can write reviews for this product.
        </p>
      </div>

      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2 text-[11px] text-slate-400">
        <Info className="h-4 w-4 shrink-0 text-slate-400" />
        <span>Order status must be "Delivered" to unlock review privileges.</span>
      </div>
    </div>
  );
}
