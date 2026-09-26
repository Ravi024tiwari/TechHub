import React from "react";

/**
 * Enterprise Production Loading Skeleton for Admin Dashboard:
 * - Mimics full layout without layout shift (CLS).
 */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-white/10 rounded-lg" />
          <div className="h-4 w-96 bg-white/5 rounded-md" />
        </div>
        <div className="h-10 w-44 bg-white/10 rounded-xl" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 snap-x snap-mandatory no-scrollbar">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-[62vw] min-w-[210px] max-w-[245px] sm:w-auto sm:max-w-none flex-shrink-0 sm:flex-shrink snap-start h-28 sm:h-32 bg-[#121316] rounded-2xl border border-white/10 p-3.5 sm:p-5"
          />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-80 bg-[#121316] rounded-2xl border border-white/10" />
        <div className="lg:col-span-4 h-80 bg-[#121316] rounded-2xl border border-white/10" />
      </div>

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 h-72 bg-[#121316] rounded-2xl border border-white/10" />
        <div className="lg:col-span-5 h-72 bg-[#121316] rounded-2xl border border-white/10" />
      </div>
    </div>
  );
}
