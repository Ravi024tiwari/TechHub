import React from "react";

export default function AdminOrdersSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/30 shadow-xs animate-pulse space-y-4"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10" />
              <div className="space-y-1.5">
                <div className="w-28 h-4 rounded-md bg-slate-200 dark:bg-white/10" />
                <div className="w-36 h-3 rounded-md bg-slate-100 dark:bg-white/5" />
              </div>
            </div>
            <div className="w-24 h-7 rounded-xl bg-slate-200 dark:bg-white/10" />
          </div>

          {/* Thumbnails */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10" />
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10" />
              <div className="w-32 h-4 rounded-md bg-slate-200 dark:bg-white/10" />
            </div>
            <div className="w-20 h-5 rounded-md bg-slate-200 dark:bg-white/10" />
          </div>

          {/* Bottom Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="w-32 h-3 rounded-md bg-slate-100 dark:bg-white/5" />
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 w-full sm:w-auto">
              <div className="h-8 rounded-xl bg-slate-200 dark:bg-white/10" />
              <div className="h-8 rounded-xl bg-slate-200 dark:bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
