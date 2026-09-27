import React, { useState, useEffect } from "react";
import {
  Star,
  X,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from "@/hooks/useReviews";

const RATING_LABELS = {
  1: "1 Star - Significant Deficiencies / Poor",
  2: "2 Stars - Mediocre / Needs Improvement",
  3: "3 Stars - Meets Standard Baseline",
  4: "4 Stars - High Performance / Satisfied",
  5: "5 Stars - Elite Tier / Highly Recommended",
};

export default function ProductReviewModal({
  isOpen,
  onClose,
  product,
  initialRating = 5,
  existingReview = null,
  onSuccess,
}) {
  const isEditing = Boolean(existingReview);

  const [rating, setRating] = useState(initialRating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [pros, setPros] = useState([]);
  const [cons, setCons] = useState([]);
  const [proInput, setProInput] = useState("");
  const [conInput, setConInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const createMutation = useCreateReviewMutation();
  const updateMutation = useUpdateReviewMutation();

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || initialRating || 5);
      setTitle(existingReview.title || "");
      setComment(existingReview.comment || "");
      setPros(Array.isArray(existingReview.pros) ? existingReview.pros : []);
      setCons(Array.isArray(existingReview.cons) ? existingReview.cons : []);
    } else {
      setRating(initialRating || 5);
      setTitle("");
      setComment("");
      setPros([]);
      setCons([]);
    }
    setErrorMessage("");
    setIsSuccess(false);
  }, [existingReview, isOpen, initialRating]);

  if (!isOpen || !product) return null;

  const handleAddPro = (e) => {
    e?.preventDefault();
    const val = proInput.trim();
    if (val && !pros.includes(val) && pros.length < 5) {
      setPros([...pros, val]);
      setProInput("");
    }
  };

  const handleRemovePro = (index) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleAddCon = (e) => {
    e?.preventDefault();
    const val = conInput.trim();
    if (val && !cons.includes(val) && cons.length < 5) {
      setCons([...cons, val]);
      setConInput("");
    }
  };

  const handleRemoveCon = (index) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage("Review headline must be at least 3 characters long.");
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      setErrorMessage("Review comment must be at least 10 characters long.");
      return;
    }

    const payload = {
      rating,
      title: title.trim(),
      comment: comment.trim(),
      pros,
      cons,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          reviewId: existingReview._id,
          productId: product._id,
          reviewData: payload,
        });
      } else {
        await createMutation.mutateAsync({
          productId: product._id,
          reviewData: payload,
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
          "Failed to save review. Please verify your connection."
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Star className="h-6 w-6 fill-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                {isEditing ? "Update Your Review" : "Write Verified Review"}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" />
                Verified Purchase
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">
              {product.title}
            </p>
          </div>
        </div>

        {/* Success Splash */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="font-heading font-black text-lg text-slate-900 dark:text-white">
              {isEditing ? "Review Updated!" : "Review Published!"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Your feedback is now live on the product telemetry leaderboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Star Rating Picker */}
            <div className="space-y-1.5 text-center p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
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
                          : "text-slate-200 dark:text-slate-700"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <span className="text-xs font-heading font-semibold text-amber-600 dark:text-amber-400 block">
                {RATING_LABELS[hoverRating || rating]}
              </span>
            </div>

            {/* Headline Title */}
            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Headline <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Incredible speed and buttery smooth display"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Review Comment */}
            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Detailed Feedback & Experience <span className="text-amber-500">*</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share hands-on insights on battery life, thermals, performance under load, and ergonomics (min 10 characters)..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 resize-none"
              />
            </div>

            {/* Pros Section */}
            <div className="space-y-1.5">
              <label className="block text-xs font-heading font-bold text-emerald-600 dark:text-emerald-400">
                Key Pros (Optional, up to 5)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={proInput}
                  onChange={(e) => setProInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPro())}
                  placeholder="e.g., Long battery life"
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddPro}
                  disabled={!proInput.trim() || pros.length >= 5}
                  className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {pros.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pros.map((p, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    >
                      <span>+ {p}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePro(idx)}
                        className="hover:text-rose-500 ml-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cons Section */}
            <div className="space-y-1.5">
              <label className="block text-xs font-heading font-bold text-rose-600 dark:text-rose-400">
                Key Cons (Optional, up to 5)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={conInput}
                  onChange={(e) => setConInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCon())}
                  placeholder="e.g., Heavy power brick"
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddCon}
                  disabled={!conInput.trim() || cons.length >= 5}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {cons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cons.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    >
                      <span>- {c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCon(idx)}
                        className="hover:text-rose-500 ml-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>{isEditing ? "Update Review" : "Publish Review"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
