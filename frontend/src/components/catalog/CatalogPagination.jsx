import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * Enterprise Production-Grade Pagination:
 * - Generates windowed page numbers with ellipsis.
 * - Previous/Next, First/Last quick jump controls.
 * - Smooth scroll-to-top on page change.
 */
export default function CatalogPagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      window.scrollTo({ top: 180, behavior: "smooth" });
    }
  };

  // Generate page numbers array with ellipsis
  const getPageNumbers = () => {
    const delta = 1; // Number of pages to show around current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "dots-start");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("dots-end", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    // Deduplicate array
    return Array.from(new Set(rangeWithDots));
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 select-none py-6 ${className}`}
    >
      {/* First Page */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => handlePageClick(1)}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0f17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        title="First Page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>

      {/* Prev Page */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => handlePageClick(currentPage - 1)}
        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0f17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-xs font-semibold flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === "dots-start" || p === "dots-end") {
            return (
              <span
                key={`${p}-${idx}`}
                className="px-2 py-1 text-slate-400 font-mono text-xs"
              >
                ...
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => handlePageClick(p)}
              className={`h-9 min-w-9 px-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md scale-105"
                  : "bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Next Page */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0f17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-xs font-semibold flex items-center gap-1"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Last Page */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => handlePageClick(totalPages)}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0f17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        title="Last Page"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </div>
  );
}
