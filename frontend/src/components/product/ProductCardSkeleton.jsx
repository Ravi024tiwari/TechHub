import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="relative rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1117] flex flex-col h-full animate-pulse overflow-hidden">
      {/* Aspect-ratio matched Image skeleton */}
      <div className="w-full aspect-[4/3] xs:aspect-square sm:aspect-auto sm:h-52 lg:h-56 bg-slate-200 dark:bg-white/[0.04] border-b border-slate-100 dark:border-white/[0.06]" />

      {/* Metadata skeleton */}
      <div className="p-2.5 sm:p-3.5 md:p-4 flex flex-col flex-1 space-y-2 sm:space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="h-3 w-16 sm:w-20 rounded bg-slate-200 dark:bg-white/[0.05]" />
          <div className="h-3 w-12 sm:w-16 rounded bg-slate-200 dark:bg-white/[0.05]" />
        </div>

        <div className="h-3.5 sm:h-4 w-full rounded bg-slate-200 dark:bg-white/[0.05]" />
        <div className="h-3.5 sm:h-4 w-3/4 rounded bg-slate-200 dark:bg-white/[0.05]" />

        <div className="h-3 w-16 sm:w-24 rounded bg-slate-200 dark:bg-white/[0.05]" />

        <div className="mt-auto pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
          <div className="h-4 sm:h-5 w-20 sm:w-24 rounded bg-slate-200 dark:bg-white/[0.05]" />
          <div className="h-7.5 sm:h-9 w-full rounded-lg sm:rounded-xl bg-slate-200 dark:bg-white/[0.08]" />
        </div>
      </div>
    </div>
  );
}
