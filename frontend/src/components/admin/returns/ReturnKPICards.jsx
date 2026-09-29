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
 * ReturnKPICards — Matches the AdminInventory KPI tile style:
 * - Clean white cards with border-2 color-coded active state (no dark gradient overlay).
 * - Compact mobile: w-[145px] with horizontal snap scroll.
 * - Colored accent label + icon; value in neutral slate-900 / white.
 * - Absolute bottom accent line for visual identity.
 * - Interactive: tap to filter, scroll chevrons on mobile.
 */
export default function ReturnKPICards({ metrics, statusFilter, onSelectFilter }) {
  const kpiScrollRef = useRef(null);

  const scrollKpis = (direction) => {
    if (kpiScrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
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

  const cards = [
    {
      filterKey: "",
      label: "Total RMAs",
      accentClass: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      borderActive: "border-amber-500 ring-2 ring-amber-500/25",
      borderHover: "hover:border-amber-500/40",
      accentBar: "bg-amber-500",
      icon: RotateCcw,
      value: metrics.total,
      sub: "All reverse tickets",
    },
    {
      filterKey: "REQUESTED",
      label: "Pending QA",
      accentClass: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      borderActive: "border-rose-500 ring-2 ring-rose-500/30",
      borderHover: "hover:border-rose-500/40",
      accentBar: "bg-rose-500",
      icon: Clock,
      value: metrics.requested,
      sub: "Awaiting triage",
      pulse: true,
    },
    {
      filterKey: "APPROVED",
      label: "Pickup En-Route",
      accentClass: "text-sky-600 dark:text-sky-400",
      iconBg: "bg-sky-500/10 text-sky-500 border-sky-500/20",
      borderActive: "border-sky-500 ring-2 ring-sky-500/30",
      borderHover: "hover:border-sky-500/40",
      accentBar: "bg-sky-500",
      icon: Truck,
      value: metrics.approved,
      sub: "Reverse courier en-route",
    },
    {
      filterKey: "REFUND_PROCESSED",
      label: "Settled",
      accentClass: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      borderActive: "border-emerald-500 ring-2 ring-emerald-500/30",
      borderHover: "hover:border-emerald-500/40",
      accentBar: "bg-emerald-500",
      icon: CheckCircle2,
      value: metrics.completed,
      sub: "Refunds & replacement",
    },
  ];

  return (
    <div className="space-y-1.5 w-full max-w-full">
      {/* Mobile Scroll Controls */}
      <div className="flex lg:hidden items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-sans font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
          <span>Tap metrics to filter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollKpis("left")}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer active:scale-90"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollKpis("right")}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer active:scale-90"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Track */}
      <div
        ref={kpiScrollRef}
        className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 overflow-x-auto sm:overflow-visible pb-1.5 sm:pb-0 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 snap-x snap-mandatory no-scrollbar touch-pan-x scroll-smooth"
      >
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const isActive =
            card.filterKey === ""
              ? statusFilter === ""
              : statusFilter === card.filterKey ||
                (card.filterKey === "REFUND_PROCESSED" &&
                  statusFilter === "REPLACEMENT_DISPATCHED");

          return (
            <div
              key={idx}
              onClick={() =>
                card.filterKey === ""
                  ? onSelectFilter("")
                  : onSelectFilter(isActive ? "" : card.filterKey)
              }
              className={`w-[145px] xs:w-[165px] sm:w-auto flex-shrink-0 sm:flex-shrink snap-start p-2.5 xs:p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0e121b] border-2 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden group select-none active:scale-[0.98] touch-manipulation ${
                isActive
                  ? `${card.borderActive} dark:${card.borderActive}`
                  : `border-slate-200 dark:border-white/10 ${card.borderHover}`
              }`}
            >
              {/* Label + Icon row */}
              <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
                <span className={`text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider truncate ${card.accentClass}`}>
                  {card.label}
                </span>
                <div className={`p-1 sm:p-2 rounded-lg sm:rounded-xl border shrink-0 ${card.iconBg}`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${card.pulse && card.value > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>

              {/* Value */}
              <div className="text-lg xs:text-xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white truncate leading-none sm:leading-tight">
                {card.value}
              </div>

              {/* Sub label */}
              <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono truncate">
                {card.sub}
              </p>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${card.accentBar} opacity-${isActive ? "100" : "60"} transition-opacity`} />
            </div>
          );
        })}
      </div>

      {/* Mobile Dot Indicator + Swipe Hint */}
      <div className="sm:hidden flex items-center justify-between px-1 pt-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500">
        <span className="opacity-70">← Swipe metrics →</span>
        <div className="flex items-center gap-1">
          {cards.map((card, idx) => {
            const isActive =
              card.filterKey === ""
                ? statusFilter === ""
                : statusFilter === card.filterKey ||
                  (card.filterKey === "REFUND_PROCESSED" &&
                    statusFilter === "REPLACEMENT_DISPATCHED");
            return (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToCard(idx, card.filterKey)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? `w-4 h-1.5 ${card.accentBar}`
                    : "w-1.5 h-1.5 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40"
                }`}
                aria-label={`Jump to ${card.label}`}
                title={card.label}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
