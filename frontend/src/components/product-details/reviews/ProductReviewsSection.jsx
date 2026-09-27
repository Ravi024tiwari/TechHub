import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  ArrowUpDown,
  Filter,
  Loader2,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";
import RatingTelemetrySummary from "./RatingTelemetrySummary";
import ReviewCard from "./ReviewCard";
import ProductReviewModal from "./ProductReviewModal";
import {
  useInfiniteProductReviewsQuery,
  useReviewEligibilityQuery,
  useDeleteReviewMutation,
  useToggleHelpfulVoteMutation,
} from "@/hooks/useReviews";
import { useAuthStore } from "@/store/useAuthStore";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "highest_rating", label: "Highest Rating" },
  { value: "lowest_rating", label: "Lowest Rating" },
  { value: "most_helpful", label: "Most Helpful" },
];

export default function ProductReviewsSection({ product }) {
  const productId = product?._id;
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Filter & Sort State
  const [sortBy, setSortBy] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState(null); // null or 1..5

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [initialRating, setInitialRating] = useState(5);
  const [eligibilityNotice, setEligibilityNotice] = useState("");

  // TanStack Infinite Query for reviews
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteProductReviewsQuery({
    productId,
    sortBy,
    ratingFilter,
    limit: 6,
  });

  // Query for user review eligibility
  const {
    data: eligibilityData,
    isLoading: isLoadingEligibility,
  } = useReviewEligibilityQuery(productId);

  // Mutations
  const deleteMutation = useDeleteReviewMutation();
  const toggleHelpfulMutation = useToggleHelpfulVoteMutation();

  // Extract flattened list of reviews across all infinite pages
  const allReviews = data?.pages?.flatMap((page) => page.reviews || []) || [];

  // Get initial page rating stats (returned with first page)
  const ratingStats = data?.pages?.[0]?.ratingStats || {
    averageRating: product?.rating || 0,
    totalReviews: product?.numReviews || 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  // Infinite Scroll IntersectionObserver on sentinel
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "250px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Actions
  const handleRateStar = (star) => {
    setEligibilityNotice("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // If user has already reviewed, open in edit mode with clicked star
    if (eligibilityData?.hasReviewed && eligibilityData?.existingReview) {
      setInitialRating(star);
      setEditingReview(eligibilityData.existingReview);
      setIsModalOpen(true);
      return;
    }

    // If eligible to review, open in create mode with clicked star
    if (eligibilityData?.canReview) {
      setInitialRating(star);
      setEditingReview(null);
      setIsModalOpen(true);
      return;
    }

    // Ineligible buyer notice (orders not yet delivered)
    setEligibilityNotice(
      eligibilityData?.reason ||
        "Verified purchase required: Only customers who have purchased and received this product (order marked 'Delivered') can submit ratings."
    );
    setTimeout(() => setEligibilityNotice(""), 6000);
  };

  const handleOpenWriteModal = () => {
    setEligibilityNotice("");
    setInitialRating(5);
    setEditingReview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (review) => {
    setEligibilityNotice("");
    setInitialRating(review?.rating || 5);
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this verified review?")) {
      await deleteMutation.mutateAsync({ reviewId, productId });
    }
  };

  const handleToggleHelpful = async (reviewId) => {
    await toggleHelpfulMutation.mutateAsync({ reviewId });
  };

  return (
    <section
      id="product-reviews"
      aria-label="Verified Customer Reviews and Hardware Telemetry"
      className="mt-16 pt-12 border-t border-slate-200 dark:border-white/10"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <MessageSquare className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Community Benchmarks
            </span>
          </div>

          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Real performance benchmarks and verified customer ownership reports
          </p>
        </div>
      </div>

      {/* Compact Unified Rating & Quick-Rate Bar */}
      <div className="mb-5">
        <RatingTelemetrySummary
          ratingStats={ratingStats}
          onRate={handleRateStar}
          onOpenWriteModal={handleOpenWriteModal}
          onOpenEditModal={handleOpenEditModal}
          eligibilityData={eligibilityData}
          isLoadingEligibility={isLoadingEligibility}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Temporary Ineligibility Notice (Shown if user clicks a star without a delivered order) */}
      {eligibilityNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center gap-3 animate-in fade-in duration-200">
          <Info className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="flex-1 leading-relaxed">{eligibilityNotice}</p>
          <button
            type="button"
            onClick={() => setEligibilityNotice("")}
            className="text-xs font-bold underline hover:opacity-75 cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar: Star Rating Quick Filter Chips & Sorting Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 shadow-xs mb-5">
        {/* Star Rating Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-mono font-semibold text-slate-400 mr-1.5 shrink-0 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </span>

          <button
            type="button"
            onClick={() => setRatingFilter(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
              ratingFilter === null
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"
            }`}
          >
            All Reviews
          </button>

          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                ratingFilter === star
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"
              }`}
            >
              {star} ★
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort:</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-heading font-semibold bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Review Cards Stream */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-white/10 rounded-md" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded-md" />
                </div>
              </div>
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-white/10 rounded-md" />
              <div className="h-12 w-full bg-slate-200 dark:bg-white/10 rounded-md" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
          <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            Unable to Retrieve Reviews
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {error?.message || "A network error occurred while loading community reviews."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold transition-all cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : allReviews.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading font-black text-lg text-slate-900 dark:text-white">
              {ratingFilter
                ? `No ${ratingFilter}-Star Reviews Found`
                : "No Customer Reviews Yet"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-sans">
              {ratingFilter
                ? "Try clearing the rating filter to inspect reviews across all star tiers."
                : "Be among the first verified owners to evaluate this device once delivered!"}
            </p>
          </div>
          {ratingFilter && (
            <button
              type="button"
              onClick={() => setRatingFilter(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold text-slate-800 dark:text-white transition-colors cursor-pointer"
            >
              Clear Star Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {allReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteReview}
                onToggleHelpful={handleToggleHelpful}
                isTogglingHelpful={toggleHelpfulMutation.isPending}
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel and Loaders */}
          <div ref={sentinelRef} className="py-6 text-center">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                <span>Loading more verified benchmarks...</span>
              </div>
            )}

            {!hasNextPage && allReviews.length > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/[0.04] text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>All {allReviews.length} verified reviews loaded</span>
              </div>
            )}

            {/* Fallback Manual Button for Accessibility */}
            {hasNextPage && !isFetchingNextPage && (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                className="px-5 py-2.5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/30 text-xs font-heading font-bold text-slate-800 dark:text-white transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                Load More Reviews
              </button>
            )}
          </div>
        </div>
      )}

      {/* Review Create/Edit Modal */}
      <ProductReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        initialRating={initialRating}
        existingReview={editingReview}
        onSuccess={() => refetch()}
      />
    </section>
  );
}
