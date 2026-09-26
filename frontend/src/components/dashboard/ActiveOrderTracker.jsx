import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Copy,
  Check,
  MapPin,
  Calendar,
} from "lucide-react";

export default function ActiveOrderTracker({ activeOrders = [] }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!activeOrders || activeOrders.length === 0) {
    return (
      <div className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 text-center space-y-4 shadow-xs">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white">
            All Deliveries Completed & Up to Date
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You have no active orders in transit right now. Looking for cutting-edge GPUs, audio gear, or laptops?
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Explore Precision Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  // Primary active order to highlight
  const primaryOrder = activeOrders[0];
  const steps = [
    { label: "Placed", desc: "Order Logged" },
    { label: "Confirmed", desc: "Payment Verified" },
    { label: "Processing", desc: "Packed at Hub" },
    { label: "In Transit", desc: "Out for Delivery" },
    { label: "Delivered", desc: "Handover Complete" },
  ];

  const currentStep = Math.min(steps.length - 1, Math.max(0, primaryOrder.stepIndex ?? 0));

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                Live Shipment Tracking
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping" />
                Active Route
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Order #{primaryOrder.orderNumber} • ₹{(primaryOrder.totalAmount || 0).toLocaleString("en-IN")} • {primaryOrder.itemsCount} {primaryOrder.itemsCount === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        <Link
          to={`/orders`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-heading font-bold text-slate-700 dark:text-slate-200 transition-colors w-fit"
        >
          <span>View All Orders</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Item Snapshot Preview */}
      {primaryOrder.previewItem && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
          <div className="flex items-center gap-3.5 min-w-0">
            {primaryOrder.previewItem.image ? (
              <img
                src={primaryOrder.previewItem.image}
                alt={primaryOrder.previewItem.title}
                className="h-14 w-14 rounded-xl object-cover bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-0.5">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                {primaryOrder.previewItem.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Qty: {primaryOrder.previewItem.quantity} • Value: ₹{(primaryOrder.previewItem.price || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Courier & Tracking Number with Copy Button */}
          {primaryOrder.tracking?.trackingNumber ? (
            <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-white/5">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase font-tech block">
                  {primaryOrder.tracking.courierPartner || "Express Logistics"}
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {primaryOrder.tracking.trackingNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(primaryOrder.tracking.trackingNumber)}
                title="Copy Tracking Number"
                className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {copiedId === primaryOrder.tracking.trackingNumber ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ) : (
            <div className="text-left sm:text-right text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 sm:justify-end">
                <Clock className="h-3 w-3 text-amber-500" />
                Dispatch Assignment In Progress
              </span>
            </div>
          )}
        </div>
      )}

      {/* 5-Step Horizontal Shipment Stepper (Responsive) */}
      <div className="pt-2 px-1">
        <div className="relative flex items-center justify-between">
          {/* Background Connecting Line */}
          <div className="absolute top-4 left-4 right-4 h-1 bg-slate-200 dark:bg-white/10 -z-0 rounded-full" />
          {/* Active Fill Line */}
          <div
            className="absolute top-4 left-4 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 -z-0 rounded-full transition-all duration-700"
            style={{ width: `${(currentStep / (steps.length - 1)) * 92}%` }}
          />

          {steps.map((st, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={st.label} className="relative z-10 flex flex-col items-center text-center">
                <div
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCurrent
                      ? "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/40 scale-110"
                      : isCompleted
                      ? "bg-emerald-500 border-emerald-400 text-white"
                      : "bg-white dark:bg-[#0c0f17] border-slate-300 dark:border-white/20 text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Clock className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <span className="text-[11px] sm:text-xs font-bold font-mono">{idx + 1}</span>
                  )}
                </div>

                <div className="mt-2 space-y-0.5 max-w-[60px] sm:max-w-none">
                  <span
                    className={`block text-[10px] sm:text-xs font-heading font-bold truncate ${
                      isCurrent
                        ? "text-orange-600 dark:text-orange-400"
                        : isCompleted
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {st.label}
                  </span>
                  <span className="hidden md:block text-[10px] text-slate-400 font-mono">
                    {st.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
