import React from "react";
import { ArrowLeftRight, Check, Scale } from "lucide-react";
import { useCompareStore } from "@/store/useCompareStore";

/**
 * Production-Grade Compare Toggle Button:
 * - Supports compact mode (cards) & full mode (details page).
 * - Instant visual feedback with Cyber Orange active highlight.
 * - Handles toast/alert if 4-item capacity reached.
 */
export default function CompareButton({
  product,
  variant = "compact", // "compact" | "full" | "pill"
  className = "",
}) {
  const isInCompare = useCompareStore((state) => state.isInCompare(product?._id));
  const toggleCompare = useCompareStore((state) => state.toggleCompare);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product?._id) return;

    const res = toggleCompare(product);

    if (res?.reason === "MAX_LIMIT") {
      alert("You can compare a maximum of 4 electronics items at a time. Remove an existing item from the comparison bar to add this one.");
    }
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex-1 h-10 sm:h-11 px-4 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-heading font-bold transition-all shadow-sm cursor-pointer select-none active:scale-95 ${
          isInCompare
            ? "bg-orange-500/15 border-orange-500 text-orange-600 dark:text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]"
            : "bg-white hover:bg-slate-100 dark:bg-white/[0.05] dark:hover:bg-white/10 border-slate-300 dark:border-white/15 text-slate-800 dark:text-white"
        } ${className}`}
        aria-label={isInCompare ? "Remove from comparison" : "Add to comparison"}
      >
        <ArrowLeftRight
          className={`h-4 w-4 shrink-0 transition-transform ${
            isInCompare ? "text-orange-500 stroke-[2.5]" : "text-slate-600 dark:text-slate-300"
          }`}
        />
        <span>{isInCompare ? "In Comparison" : "Add to Compare"}</span>
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`px-3 py-1.5 rounded-full border text-xs font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-90 ${
          isInCompare
            ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
            : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/20 hover:border-orange-500"
        } ${className}`}
        title={isInCompare ? "Remove from Compare" : "Compare Specs"}
      >
        <ArrowLeftRight className="h-3 w-3 stroke-[2.5]" />
        <span>{isInCompare ? "Comparing" : "Compare"}</span>
      </button>
    );
  }

  // Default: Compact Icon Button (for Product Cards)
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isInCompare ? "Remove from comparison" : "Add to comparison"}
      title={isInCompare ? "In Comparison (Click to remove)" : "Compare Specifications"}
      className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-md border transition-all duration-200 active:scale-90 cursor-pointer shadow-xs select-none ${
        isInCompare
          ? "bg-orange-500 text-white border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)] ring-2 ring-orange-500/30"
          : "bg-white/95 hover:bg-white text-slate-700 hover:text-orange-600 border-slate-200/90 hover:border-orange-300 dark:bg-black/75 dark:hover:bg-white/15 dark:text-slate-300 dark:border-white/15"
      } ${className}`}
    >
      <ArrowLeftRight
        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${
          isInCompare ? "text-white scale-110 stroke-[2.5]" : "text-slate-600 dark:text-slate-300"
        }`}
      />
    </button>
  );
}
