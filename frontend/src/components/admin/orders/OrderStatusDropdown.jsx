import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  Navigation,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Loader2,
  Check,
  X,
} from "lucide-react";

export const STATUS_CONFIG = {
  PLACED: {
    label: "Placed",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    dot: "bg-amber-500",
    icon: Clock,
    desc: "Order received, awaiting confirmation",
  },
  CONFIRMED: {
    label: "Confirmed",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
    dot: "bg-sky-500",
    icon: CheckCircle,
    desc: "Order verified & accepted by store",
  },
  PROCESSING: {
    label: "Processing",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
    dot: "bg-blue-500",
    icon: Package,
    desc: "Packaging & warehouse allocation",
  },
  SHIPPED: {
    label: "Shipped",
    badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
    dot: "bg-indigo-500",
    icon: Truck,
    desc: "Dispatched with logistics carrier",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
    dot: "bg-purple-500",
    icon: Navigation,
    desc: "Courier out for final mile delivery",
  },
  DELIVERED: {
    label: "Delivered",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
    desc: "Successfully delivered to customer",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
    dot: "bg-rose-500",
    icon: XCircle,
    desc: "Order revoked & restocked",
  },
};

const STATUS_KEYS = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export default function OrderStatusDropdown({
  currentStatus,
  onSelectStatus,
  isUpdating = false,
  disabled = false,
  prefixLabel = "",
  align = "right",
  onOpenChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    if (disabled || isUpdating) return;
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (onOpenChange) onOpenChange(nextState);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onOpenChange) onOpenChange(false);
  };

  const handleSelect = (statusKey) => {
    handleClose();
    if (statusKey === currentStatus) return;
    onSelectStatus(statusKey);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const currentConfig = STATUS_CONFIG[currentStatus] || {
    label: currentStatus || "UNKNOWN",
    badge: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30",
    dot: "bg-slate-400",
    icon: Package,
    desc: "Order status",
  };

  const CurrentIcon = currentConfig.icon;
  const isTerminalState =
    currentStatus === "DELIVERED" || currentStatus === "CANCELLED";

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isUpdating}
        onClick={handleToggle}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-sans font-semibold border transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
          currentConfig.badge
        } ${
          disabled || isTerminalState
            ? "opacity-90"
            : "hover:brightness-105 active:scale-95"
        }`}
        title={
          isTerminalState
            ? `Order is ${currentStatus} (Click to change lifecycle state if required)`
            : "Click to change fulfillment status"
        }
      >
        {isUpdating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${currentConfig.dot} animate-pulse`} />
        )}
        <CurrentIcon className="w-3.5 h-3.5 opacity-80 shrink-0" />
        <span className="truncate">
          {prefixLabel && <span className="hidden sm:inline">{prefixLabel} </span>}
          {currentConfig.label}
        </span>
        <ChevronDown
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Container */}
      {isOpen && (
        <>
          {/* Backdrop Click Dismiss */}
          <div
            className="fixed inset-0 z-40 bg-slate-950/30 dark:bg-black/50 backdrop-blur-[1.5px] transition-opacity"
            onClick={handleClose}
          />

          {/* 1. Desktop Popover Menu (hidden on mobile, visible on sm and up) */}
          <div
            className={`hidden sm:block absolute ${
              align === "left" ? "left-0" : "right-0"
            } top-full mt-2 w-72 z-50 rounded-2xl bg-white dark:bg-[#121623] border border-slate-300 dark:border-white/20 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150`}
          >
            <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Update Lifecycle
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                  Select new fulfillment state
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-1 space-y-0.5 max-h-72 overflow-y-auto scrollbar-thin">
              {STATUS_KEYS.map((key) => {
                const config = STATUS_CONFIG[key];
                const Icon = config.icon;
                const isSelected = currentStatus === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelect(key)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-sans transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/20"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${config.badge}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{config.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-orange-500 shrink-0 ml-1" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {config.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Mobile Responsive Bottom Sheet Drawer (visible on mobile < 640px) */}
          <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 p-4 pb-6 bg-white dark:bg-[#121623] rounded-t-3xl border-t border-slate-300 dark:border-white/20 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col">
            {/* Drawer Pull Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-2">
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Update Order Status
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  Tap to set fulfillment milestone
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {STATUS_KEYS.map((key) => {
                const config = STATUS_CONFIG[key];
                const Icon = config.icon;
                const isSelected = currentStatus === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelect(key)}
                    className={`w-full text-left p-3 rounded-2xl text-xs font-sans transition-all flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold border-orange-500/30"
                        : "bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 active:scale-98"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${config.badge}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm leading-tight">
                          {config.label}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {config.desc}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-orange-500 text-white shrink-0 ml-2">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full py-2.5 rounded-xl text-xs font-sans font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors text-center"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
