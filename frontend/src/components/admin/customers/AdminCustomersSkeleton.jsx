import React from "react";

export default function AdminCustomersSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 shadow-xs animate-pulse space-y-4"
        >
          {/* Top Header Row */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
              <div className="space-y-1.5">
                <div className="w-32 h-4 rounded-md bg-slate-200 dark:bg-white/10" />
                <div className="w-24 h-3 rounded-md bg-slate-100 dark:bg-white/5" />
              </div>
            </div>
            <div className="w-24 h-7 rounded-xl bg-slate-200 dark:bg-white/10" />
          </div>

          {/* Contact Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5" />
              <div className="w-44 h-3 rounded-md bg-slate-200 dark:bg-white/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5" />
              <div className="w-28 h-3 rounded-md bg-slate-200 dark:bg-white/10" />
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="w-36 h-3 rounded-md bg-slate-100 dark:bg-white/5 hidden sm:block" />
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2.5 w-full sm:w-auto">
              <div className="h-9 rounded-xl bg-slate-200 dark:bg-white/10" />
              <div className="h-9 rounded-xl bg-slate-200 dark:bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
