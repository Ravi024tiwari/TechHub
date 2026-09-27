import React, { useState } from "react";
import {
  Star,
  X,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useSubmitReviewMutation } from "@/hooks/useOrders";
import { useUpdateReviewMutation } from "@/hooks/useReviews";

const RATING_LABELS = {
  1: "Poor - Significant Hardware Issues",
  2: "Fair - Needs Substantial Polish",
  3: "Good - Meets Baseline Expectations",
  4: "Very Good - Highly Satisfied Performance",
  5: "Exceptional - Elite Tier Hardware",
};

export default function OrderReviewModal({
  isOpen,
  onClose,
  item,
  initialRating = 5,
  onSuccess,
}) {
  const existingReview = item?.userReview || null;
  const isEditing = Boolean(existingReview);

  const [rating, setRating] = useState(existingReview?.rating || initialRating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync state whenever modal opens or item changes
  React.useEffect(() => {
    if (isOpen && item) {
      setRating(item.userReview?.rating || initialRating || 5);
      setTitle(item.userReview?.title || "");
      setComment(item.userReview?.comment || "");
      setErrorMessage("");
      setIsSuccess(false);
    }
  }, [isOpen, item, initialRating]);

  const submitReviewMutation = useSubmitReviewMutation();
  const updateReviewMutation = useUpdateReviewMutation();

  if (!isOpen || !item) return null;

  const productId = item.product?._id || item.product;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage("Review headline must be at least 3 characters long.");
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      setErrorMessage("Review comments must be at least 10 characters long.");
      return;
    }

    try {
      if (isEditing && existingReview?._id) {
        await updateReviewMutation.mutateAsync({
          reviewId: existingReview._id,
          productId,
          reviewData: {
            rating,
            title: title.trim(),
            comment: comment.trim(),
          },
        });
      } else {
        await submitReviewMutation.mutateAsync({
          productId,
          reviewData: {
            rating,
            title: title.trim(),
            comment: comment.trim(),
          },
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit review. You may have already reviewed this product."
      );
    }
  };

  const isPending = submitReviewMutation.isPending || updateReviewMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                {isEditing ? "Update Your Review" : "Verified Owner Review"}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Share real-world benchmarks and feedback with the community
            </p>
          </div>
        </div>

        {/* Item Preview Snapshot */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
          <div className="h-12 w-12 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shrink-0 p-1 flex items-center justify-center overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
            ) : (
              <Package className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {item.title}
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Purchased Unit
            </span>
          </div>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="font-heading font-black text-lg text-slate-900 dark:text-white">
              Thank You For Your Review!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Your verified review and benchmark scores have been published to the community catalog.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Star Rating Picker */}
            <div className="space-y-1.5 text-center p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Overall Rating <span className="text-amber-500">*</span>
              </label>

              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-500 text-amber-500"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-heading font-semibold text-amber-600 dark:text-amber-400 block">
                {RATING_LABELS[hoverRating || rating]}
              </span>
            </div>

            {/* Headline Title */}
            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Review Headline <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unbelievable graphics power and whisper quiet fans"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Detailed Comments */}
            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Detailed Feedback & Benchmarks <span className="text-amber-500">*</span>
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you love? How are thermals, build quality, and software drivers? (min 10 chars)"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl text-xs font-heading font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isEditing ? "Saving Changes..." : "Publishing Review..."}</span>
                  </>
                ) : (
                  <span>{isEditing ? "Save Changes" : "Publish Verified Review"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
