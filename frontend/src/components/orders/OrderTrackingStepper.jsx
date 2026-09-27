import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Navigation,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const MILESTONES = [
  { key: "PLACED", label: "Placed", desc: "Order recorded in cloud", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", desc: "Payment & specs verified", icon: CheckCircle2 },
  { key: "PROCESSING", label: "Processing", desc: "Hub QA & secure packing", icon: Package },
  { key: "SHIPPED", label: "Dispatched", desc: "Handed over to carrier", icon: Truck },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "On courier final route", icon: Navigation },
  { key: "DELIVERED", label: "Delivered", desc: "Handover completed", icon: CheckCircle2 },
];

const ORDER_STATUS_HIERARCHY = {
  PLACED: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
};

export default function OrderTrackingStepper({ order }) {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  const status = order?.orderStatus || "PLACED";
  const isCancelled = status === "CANCELLED";
  const isReturned = status === "RETURNED";

  const trackingInfo = order?.trackingInfo || {};
  const statusTimeline = order?.statusTimeline || [];

  const currentStepIndex = ORDER_STATUS_HIERARCHY[status] ?? 0;

  const handleCopyTracking = (num) => {
    if (!num) return;
    navigator.clipboard?.writeText(num);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const formatTimelineDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEstimatedDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getMilestoneTimestamp = (key) => {
    const entry = [...statusTimeline].reverse().find((item) => item.status === key);
    return entry ? formatTimelineDate(entry.timestamp) : null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all space-y-6">
      {/* Section Header matching Admin Order Detail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <Truck className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                Fulfillment & Courier Telemetry
              </h3>
              {!isCancelled && !isReturned && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 ring-1 ring-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Air express courier routing with real-time waypoint telemetry
            </p>
          </div>
        </div>

        {/* Courier Partner & AWB Quick Pill */}
        {trackingInfo.trackingNumber && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 px-3 py-1.5 rounded-xl shadow-xs">
            <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {trackingInfo.courierPartner || "Carrier"}:
            </span>
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {trackingInfo.trackingNumber}
            </span>
            <button
              type="button"
              onClick={() => handleCopyTracking(trackingInfo.trackingNumber)}
              title="Copy AWB Tracking Number"
              className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {copiedTracking ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Cancelled Alert Banner */}
      {isCancelled && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3.5 text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div className="space-y-1 text-xs">
            <h4 className="font-heading font-black text-sm text-rose-800 dark:text-rose-300">
              Order Cancelled
            </h4>
            <p className="text-rose-700 dark:text-rose-300/90 leading-relaxed font-sans">
              {order.cancellation?.reason
                ? `Cancellation Reason: "${order.cancellation.reason}"`
                : "This order has been cancelled. Any pre-authorized charges will be refunded to your source account."}
            </p>
            {order.cancellation?.cancelledAt && (
              <p className="font-mono text-[11px] text-rose-500 pt-0.5">
                Cancelled on: {formatTimelineDate(order.cancellation.cancelledAt)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Returned Alert Banner */}
      {isReturned && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
          <div className="space-y-1 text-xs">
            <h4 className="font-heading font-black text-sm text-amber-800 dark:text-amber-300">
              Order Returned & Processed
            </h4>
            <p className="text-amber-700 dark:text-amber-300/90 leading-relaxed font-sans">
              The package has been received by our fulfillment center. Refund or replacement unit is being dispatched.
            </p>
          </div>
        </div>
      )}

      {/* Estimated Delivery Banner with Admin Amber/Orange Polish */}
      {!isCancelled && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                {status === "DELIVERED" ? "Package Status" : "Estimated Arrival Date"}
              </span>
              <p className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
                {status === "DELIVERED"
                  ? trackingInfo.deliveredAt
                    ? `Delivered on ${formatEstimatedDate(trackingInfo.deliveredAt)}`
                    : "Delivered Successfully"
                  : trackingInfo.estimatedDelivery
                  ? formatEstimatedDate(trackingInfo.estimatedDelivery)
                  : "Within 2 - 4 Business Days"}
              </p>
            </div>
          </div>

          {trackingInfo.trackingUrl && (
            <a
              href={trackingInfo.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold bg-white dark:bg-white/10 hover:border-orange-500 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white shadow-xs transition-all w-fit cursor-pointer"
            >
              <span>Track on Carrier Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
            </a>
          )}
        </div>
      )}

      {/* Multi-Stage Visual Stepper */}
      {!isCancelled && (
        <div className="pt-3 pb-2 px-1">
          {/* Desktop Horizontal View */}
          <div className="hidden sm:block">
            <div className="relative flex items-center justify-between">
              {/* Background Connecting Line */}
              <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 dark:bg-white/10 -z-0 rounded-full" />
              {/* Active Gradient Fill Line */}
              <div
                className="absolute top-5 left-6 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 -z-0 rounded-full transition-all duration-700"
                style={{
                  width: `${(Math.min(currentStepIndex, MILESTONES.length - 1) / (MILESTONES.length - 1)) * 92}%`,
                }}
              />

              {MILESTONES.map((step, idx) => {
                const IconComponent = step.icon;
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const stepDate = getMilestoneTimestamp(step.key);

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center text-center max-w-[120px]">
                    {/* Stepper Node Circle */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCurrent
                          ? "bg-gradient-to-br from-orange-500 to-amber-500 border-orange-300 text-white shadow-lg shadow-orange-500/40 scale-110 ring-4 ring-orange-500/20"
                          : isCompleted
                          ? "bg-emerald-500 border-emerald-400 text-white shadow-sm"
                          : "bg-white dark:bg-[#0c0f17] border-slate-300 dark:border-white/20 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <IconComponent className={`w-4 h-4 ${isCurrent ? "animate-pulse" : ""}`} />
                      )}
                    </div>

                    {/* Step Labels */}
                    <div className="mt-2.5 space-y-0.5">
                      <span
                        className={`block text-xs font-heading font-black ${
                          isCurrent
                            ? "text-orange-600 dark:text-orange-400"
                            : isCompleted
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-tight">
                        {step.desc}
                      </span>
                      {stepDate && (
                        <span className="block text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                          {stepDate}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Vertical Stepper View */}
          <div className="sm:hidden space-y-4 relative pl-3">
            <div className="absolute top-3 bottom-3 left-6 w-0.5 bg-slate-200 dark:bg-white/10 -z-0" />
            {MILESTONES.map((step, idx) => {
              const IconComponent = step.icon;
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const stepDate = getMilestoneTimestamp(step.key);

              return (
                <div key={step.key} className="flex items-start gap-3.5 relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 ${
                      isCurrent
                        ? "bg-orange-500 border-orange-300 text-white shadow-md shadow-orange-500/40 ring-2 ring-orange-500/20"
                        : isCompleted
                        ? "bg-emerald-500 border-emerald-400 text-white"
                        : "bg-white dark:bg-[#0c0f17] border-slate-300 dark:border-white/20 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <IconComponent className="w-3 h-3" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-heading font-bold ${
                          isCurrent
                            ? "text-orange-600 dark:text-orange-400"
                            : isCompleted
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                      {stepDate && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          {stepDate}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable Audit Log */}
      {statusTimeline.length > 0 && (
        <div className="pt-3 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setShowFullTimeline(!showFullTimeline)}
            className="flex items-center justify-between w-full text-xs font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors py-1 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Full Status Milestone Logs ({statusTimeline.length} entries)</span>
            </span>
            {showFullTimeline ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showFullTimeline && (
            <div className="mt-3 space-y-2 bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-300 dark:border-white/20">
              {statusTimeline.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs py-1.5 border-b last:border-b-0 border-slate-200/60 dark:border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.status}
                    </span>
                    {item.note && (
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-sans">
                        - {item.note}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {formatTimelineDate(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
