import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="relative rounded-2xl border-2 border-slate-400/30 bg-[#0e1117] flex flex-col h-full animate-pulse overflow-hidden">
        {/* Full-width Top Image Skeleton */}
        <div className="w-full h-64 sm:h-72 bg-white/[0.04] border-b border-white/[0.06] rounded-t-2xl" />

        {/* Bottom Metadata Skeleton */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 space-y-3">
          <div className="flex justify-between">
            <div className="h-3 w-20 rounded bg-white/[0.05]" />
            <div className="h-3 w-14 rounded bg-white/[0.05]" />
          </div>

          <div className="h-4 w-full rounded bg-white/[0.05]" />
          <div className="h-4 w-3/4 rounded bg-white/[0.05]" />

          <div className="h-3 w-28 rounded bg-white/[0.05]" />

          <div className="mt-auto pt-3 border-t border-white/[0.06] space-y-3">
            <div className="h-5 w-24 rounded bg-white/[0.05]" />
            <div className="h-10 w-full rounded-xl bg-white/[0.08]" />
          </div>
        </div>
      </div>
    );
  }
