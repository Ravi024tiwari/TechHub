import React from "react";
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * ReviewCard component
 * Compact, responsive customer review card optimized for all screen sizes.
 */
export default function ReviewCard({
  review,
  onEdit,
  onDelete,
  onToggleHelpful,
  isTogglingHelpful,
}) {
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const authorName = review.user?.name || "Verified Customer";
  const authorAvatar = review.user?.avatar?.url || review.user?.avatar || null;
  const initial = authorName.charAt(0).toUpperCase();

  const isOwner =
    isAuthenticated &&
    currentUser?._id &&
    review.user?._id &&
    String(currentUser._id) === String(review.user._id);

  const isAdmin = currentUser?.role === "admin";

  // Check if current user has already voted helpful
  const hasVotedHelpful =
    isAuthenticated &&
    currentUser?._id &&
    Array.isArray(review.helpfulUsers) &&
    review.helpfulUsers.some((uid) => String(uid) === String(currentUser._id));

  // Date formatter
  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <article className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header: User Info & Actions (Ultra-compact on mobile) */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* User Avatar */}
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-white/10 shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-heading font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                {initial}
              </div>
            )}

            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-none">
                  {authorName}
                </span>

                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Verified
                  </span>
                )}
              </div>

              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Action Menu (Edit / Delete if authorized) */}
          {(isOwner || isAdmin) && (
            <div className="flex items-center gap-0.5 shrink-0">
              {isOwner && (
                <button
                  type="button"
                  onClick={() => onEdit(review)}
                  title="Edit Review"
                  className="p-1 rounded-md text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onDelete(review._id)}
                title="Delete Review"
                className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Rating Stars & Title (Compact inline grouping) */}
        <div className="space-y-1 mb-2 sm:mb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200 dark:text-white/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
              {review.rating}.0
            </span>
          </div>

          <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
            {review.title}
          </h4>
        </div>

        {/* Review Comment Body */}
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line mb-3">
          {review.comment}
        </p>

        {/* Pros & Cons Tags (Compact chips) */}
        {(review.pros?.length > 0 || review.cons?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
            {review.pros?.length > 0 && (
              <div className="p-2 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/15 space-y-0.5">
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Pros
                </span>
                <ul className="space-y-0.5">
                  {review.pros.map((pro, idx) => (
                    <li
                      key={idx}
                      className="text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1"
                    >
                      <span className="text-emerald-500">•</span>
                      <span className="truncate">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {review.cons?.length > 0 && (
              <div className="p-2 rounded-lg bg-rose-500/[0.04] border border-rose-500/15 space-y-0.5">
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                  <XCircle className="h-2.5 w-2.5" />
                  Cons
                </span>
                <ul className="space-y-0.5">
                  {review.cons.map((con, idx) => (
                    <li
                      key={idx}
                      className="text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1"
                    >
                      <span className="text-rose-500">•</span>
                      <span className="truncate">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer: Helpfulness Action */}
      <div className="pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-[11px] text-slate-400 font-sans truncate">
          {review.helpfulCount > 0
            ? `${review.helpfulCount} ${
                review.helpfulCount === 1 ? "helpful" : "helpful"
              }`
            : "Helpful review?"}
        </span>

        <button
          type="button"
          onClick={() => onToggleHelpful(review._id)}
          disabled={!isAuthenticated || isOwner || isTogglingHelpful}
          title={
            !isAuthenticated
              ? "Log in to vote"
              : isOwner
              ? "You cannot upvote your own review"
              : "Mark as helpful"
          }
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            hasVotedHelpful
              ? "bg-sky-500 text-white shadow-2xs"
              : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10"
          }`}
        >
          <ThumbsUp className={`h-3 w-3 ${hasVotedHelpful ? "fill-white" : ""}`} />
          <span>Helpful ({review.helpfulCount || 0})</span>
        </button>
      </div>
    </article>
  );
}
