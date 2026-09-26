import React from "react";

export default function CustomerDashboardSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* VIP Tier Banner Skeleton */}
      <div className="h-56 rounded-3xl bg-slate-200 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-300 dark:bg-white/10 rounded-full" />
            <div className="h-7 w-64 bg-slate-300 dark:bg-white/10 rounded-xl" />
          </div>
          <div className="h-10 w-28 bg-slate-300 dark:bg-white/10 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-48 bg-slate-300 dark:bg-white/10 rounded-full" />
          <div className="h-3.5 w-full bg-slate-300 dark:bg-white/10 rounded-full" />
        </div>
      </div>

      {/* KPI Stat Cards Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-200 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-4 flex flex-col justify-between"
          >
            <div className="h-8 w-8 rounded-xl bg-slate-300 dark:bg-white/10" />
            <div className="space-y-1.5">
              <div className="h-5 w-20 bg-slate-300 dark:bg-white/10 rounded-md" />
              <div className="h-3 w-16 bg-slate-300 dark:bg-white/10 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Active Order Tracker Skeleton */}
      <div className="h-44 rounded-3xl bg-slate-200 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-6" />

      {/* Analytics Chart & Breakdown Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-3xl bg-slate-200 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-6" />
        <div className="h-72 rounded-3xl bg-slate-200 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-6" />
      </div>

      {/* Recent Orders Skeleton */}
      <div className="h-64 rounded-3xl bg-slate-200 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-6" />
    </div>
  );
}
