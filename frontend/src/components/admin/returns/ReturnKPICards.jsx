import React, { useRef } from "react";
import {
  RotateCcw,
  Clock,
  Truck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

/**
 * ReturnKPICards - Responsive, swipeable telemetry cards with horizontal snapping
 * and compact mobile layout for RMA metrics.
 */
export default function ReturnKPICards({ metrics, statusFilter, onSelectFilter }) {
  const kpiScrollRef = useRef(null);

  const scrollKpis = (direction) => {
    if (kpiScrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      kpiScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollToCard = (index, filterValue) => {
    if (kpiScrollRef.current) {
      const cards = kpiScrollRef.current.children;
      if (cards && cards[index]) {
        cards[index].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }
    }
    if (filterValue !== undefined) {
      onSelectFilter(filterValue);
    }
  };

  return (
    <div className="space-y-2.5 w-full max-w-full">
      {/* Mobile Swipe Navigation Controls Bar (< lg) */}
      <div className="flex lg:hidden items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 text-[11px] font-sans font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
          <span>Swipe or tap metrics to filter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollKpis("left")}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer active:scale-90"
            aria-label="Scroll metrics left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollKpis("right")}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer active:scale-90"
            aria-label="Scroll metrics right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Track on Mobile/Tablet (<lg), 4-column Grid on Desktop (lg:) */}
      <div
        ref={kpiScrollRef}
        className="flex lg:grid lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 overflow-x-auto lg:overflow-x-visible pb-2 pt-0.5 scroll-smooth snap-x snap-mandatory overscroll-x-contain scrollbar-none touch-pan-x [-webkit-overflow-scrolling:touch] w-full max-w-full"
      >
        {/* Card 1: Total RMA Cases */}
        <button
          type="button"
          onClick={() => onSelectFilter("")}
          className={`group relative text-left p-3 sm:p-4 lg:p-5 rounded-2xl lg:rounded-3xl border transition-all duration-200 cursor-pointer overflow-hidden w-[168px] xs:w-[185px] sm:w-[210px] lg:w-auto shrink-0 snap-start lg:shrink lg:flex-1 flex flex-col justify-between active:scale-[0.98] select-none touch-manipulation ${
            statusFilter === ""
              ? "bg-gradient-to-br from-indigo-500/15 via-slate-900/40 to-slate-900/80 dark:from-indigo-500/20 dark:via-[#0c0f17] dark:to-[#0c0f17] border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30"
              : "bg-white dark:bg-[#0c0f17] border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] shadow-xs hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-xl sm:rounded-2xl bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
            {statusFilter === "" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-wider bg-indigo-500 text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Active
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-sans text-slate-400 group-hover:text-indigo-400 transition-colors">
                View All ↗
              </span>
            )}
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-black tracking-tight text-indigo-500 dark:text-indigo-400">
              {metrics.total}
            </div>
            <div className="text-[11px] sm:text-xs lg:text-sm font-heading font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
              Total Reverse RMAs
            </div>
            <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-sans text-slate-400 dark:text-slate-500 truncate">
              All registered reverse cases
            </div>

            {/* Micro Progress Track */}
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1 sm:h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-500 w-full" />
            </div>
          </div>
        </button>

        {/* Card 2: Pending Concierge QA Review */}
        <button
          type="button"
          onClick={() => onSelectFilter(statusFilter === "REQUESTED" ? "" : "REQUESTED")}
          className={`group relative text-left p-3 sm:p-4 lg:p-5 rounded-2xl lg:rounded-3xl border transition-all duration-200 cursor-pointer overflow-hidden w-[168px] xs:w-[185px] sm:w-[210px] lg:w-auto shrink-0 snap-start lg:shrink lg:flex-1 flex flex-col justify-between active:scale-[0.98] select-none touch-manipulation ${
            statusFilter === "REQUESTED"
              ? "bg-gradient-to-br from-amber-500/15 via-slate-900/40 to-slate-900/80 dark:from-amber-500/20 dark:via-[#0c0f17] dark:to-[#0c0f17] border-amber-500/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30"
              : "bg-white dark:bg-[#0c0f17] border-slate-200 dark:border-white/10 hover:border-amber-500/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] shadow-xs hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-xl sm:rounded-2xl bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 animate-pulse" />
            </div>
            {statusFilter === "REQUESTED" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Active
              </span>
            ) : metrics.requested > 0 ? (
              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-heading font-bold bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Action Req.
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-sans text-slate-400 group-hover:text-amber-500 transition-colors">
                Filter ↗
              </span>
            )}
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-amber-500 dark:text-amber-400 tracking-tight">
              {metrics.requested}
            </div>
            <div className="text-[11px] sm:text-xs lg:text-sm font-heading font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
              Pending QA Review
            </div>
            <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-sans text-slate-400 dark:text-slate-500 truncate">
              {metrics.requested === 1 ? "1 item awaiting triage" : `${metrics.requested} items awaiting triage`}
            </div>

            {/* Micro Progress Track */}
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1 sm:h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${metrics.total > 0 ? Math.min(100, Math.round((metrics.requested / metrics.total) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
        </button>

        {/* Card 3: Reverse Pickup Scheduled */}
        <button
          type="button"
          onClick={() => onSelectFilter(statusFilter === "APPROVED" ? "" : "APPROVED")}
          className={`group relative text-left p-3 sm:p-4 lg:p-5 rounded-2xl lg:rounded-3xl border transition-all duration-200 cursor-pointer overflow-hidden w-[168px] xs:w-[185px] sm:w-[210px] lg:w-auto shrink-0 snap-start lg:shrink lg:flex-1 flex flex-col justify-between active:scale-[0.98] select-none touch-manipulation ${
            statusFilter === "APPROVED"
              ? "bg-gradient-to-br from-sky-500/15 via-slate-900/40 to-slate-900/80 dark:from-sky-500/20 dark:via-[#0c0f17] dark:to-[#0c0f17] border-sky-500/80 shadow-lg shadow-sky-500/10 ring-2 ring-sky-500/30"
              : "bg-white dark:bg-[#0c0f17] border-slate-200 dark:border-white/10 hover:border-sky-500/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] shadow-xs hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-xl sm:rounded-2xl bg-sky-500/15 text-sky-500 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
            {statusFilter === "APPROVED" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-wider bg-sky-500 text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Active
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-sans text-slate-400 group-hover:text-sky-400 transition-colors">
                Filter ↗
              </span>
            )}
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-sky-500 dark:text-sky-400 tracking-tight">
              {metrics.approved}
            </div>
            <div className="text-[11px] sm:text-xs lg:text-sm font-heading font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
              Pickup Scheduled
            </div>
            <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-sans text-slate-400 dark:text-slate-500 truncate">
              Reverse courier en-route
            </div>

            {/* Micro Progress Track */}
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1 sm:h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${metrics.total > 0 ? Math.min(100, Math.round((metrics.approved / metrics.total) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
        </button>

        {/* Card 4: Completed Resolutions */}
        <button
          type="button"
          onClick={() =>
            onSelectFilter(
              statusFilter === "REFUND_PROCESSED" || statusFilter === "REPLACEMENT_DISPATCHED"
                ? ""
                : "REFUND_PROCESSED"
            )
          }
          className={`group relative text-left p-3 sm:p-4 lg:p-5 rounded-2xl lg:rounded-3xl border transition-all duration-200 cursor-pointer overflow-hidden w-[168px] xs:w-[185px] sm:w-[210px] lg:w-auto shrink-0 snap-start lg:shrink lg:flex-1 flex flex-col justify-between active:scale-[0.98] select-none touch-manipulation ${
            statusFilter === "REFUND_PROCESSED" || statusFilter === "REPLACEMENT_DISPATCHED"
              ? "bg-gradient-to-br from-emerald-500/15 via-slate-900/40 to-slate-900/80 dark:from-emerald-500/20 dark:via-[#0c0f17] dark:to-[#0c0f17] border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30"
              : "bg-white dark:bg-[#0c0f17] border-slate-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] shadow-xs hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
            {statusFilter === "REFUND_PROCESSED" || statusFilter === "REPLACEMENT_DISPATCHED" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Active
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-sans text-slate-400 group-hover:text-emerald-400 transition-colors">
                Filter ↗
              </span>
            )}
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-emerald-500 dark:text-emerald-400 tracking-tight">
              {metrics.completed}
            </div>
            <div className="text-[11px] sm:text-xs lg:text-sm font-heading font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
              Resolved &amp; Settled
            </div>
            <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-sans text-slate-400 dark:text-slate-500 truncate">
              Refunds &amp; replacements
            </div>

            {/* Micro Progress Track */}
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1 sm:h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${metrics.total > 0 ? Math.min(100, Math.round((metrics.completed / metrics.total) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
        </button>
      </div>

      {/* Mobile Interactive KPI Indicator Dots (< lg) */}
      <div className="flex lg:hidden items-center justify-center gap-1.5 pt-0.5 pb-0.5">
        {[
          { label: "Total", value: "", color: "bg-indigo-500" },
          { label: "Pending", value: "REQUESTED", color: "bg-amber-500" },
          { label: "Pickup", value: "APPROVED", color: "bg-sky-500" },
          { label: "Settled", value: "REFUND_PROCESSED", color: "bg-emerald-500" },
        ].map((item, idx) => {
          const isActive =
            item.value === ""
              ? statusFilter === ""
              : statusFilter === item.value ||
                (item.value === "REFUND_PROCESSED" && statusFilter === "REPLACEMENT_DISPATCHED");

          return (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToCard(idx, item.value)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                isActive
                  ? `w-5 h-1.5 ${item.color} shadow-xs ring-1 ring-white/20`
                  : "w-1.5 h-1.5 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40"
              }`}
              aria-label={`Jump to ${item.label} metric`}
              title={item.label}
            />
          );
        })}
      </div>
    </div>
  );
}
