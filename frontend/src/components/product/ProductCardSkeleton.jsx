import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="relative rounded-xl sm:rounded-2xl border-2 border-slate-400/30 bg-[#0e1117] flex flex-col h-full animate-pulse overflow-hidden">
        {/* Full-width Top Image Skeleton */}
        <div className="w-full aspect-[4/3] xs:aspect-square sm:aspect-auto sm:h-64 lg:h-72 bg-white/[0.04] border-b border-white/[0.06] rounded-t-xl sm:rounded-t-2xl" />

        {/* Bottom Metadata Skeleton */}
        <div className="p-2.5 sm:p-4 md:p-5 flex flex-col flex-1 space-y-2 sm:space-y-3">
          <div className="flex justify-between">
            <div className="h-3 w-16 sm:w-20 rounded bg-white/[0.05]" />
            <div className="h-3 w-10 sm:w-14 rounded bg-white/[0.05]" />
          </div>

          <div className="h-3.5 sm:h-4 w-full rounded bg-white/[0.05]" />
          <div className="h-3.5 sm:h-4 w-3/4 rounded bg-white/[0.05]" />

          <div className="h-3 w-20 sm:w-28 rounded bg-white/[0.05]" />

          <div className="mt-auto pt-2 sm:pt-3 border-t border-white/[0.06] space-y-2 sm:space-y-3">
            <div className="h-4 sm:h-5 w-20 sm:w-24 rounded bg-white/[0.05]" />
            <div className="h-8 sm:h-10 w-full rounded-lg sm:rounded-xl bg-white/[0.08]" />
          </div>
        </div>
      </div>
    );
  }
