import React, { useState } from "react";
import {
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useCancelOrderMutation } from "@/hooks/useOrders";

const CANCELLATION_REASONS = [
  "Ordered by mistake / Duplicate order",
  "Found better price / alternative hardware",
  "Estimated delivery timeframe is too long",
  "Incorrect shipping address or recipient contact",
  "Changed mind / Financial rescheduling",
  "Other reason (specify below)",
];

export default function OrderCancelModal({ isOpen, onClose, order }) {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customComment, setCustomComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const cancelMutation = useCancelOrderMutation();

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const finalReason =
      selectedReason.startsWith("Other") && customComment.trim()
        ? `Other: ${customComment.trim()}`
        : selectedReason;

    try {
      await cancelMutation.mutateAsync({
        orderId: order._id,
        reason: finalReason,
      });
      onClose();
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to cancel order. Please refresh and try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Cancel Order #{order.orderNumber}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Immediate order release & payment reversal
            </p>
          </div>
        </div>

        {/* Informative notice */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-sans space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Order Cancellation Terms:</span>
          </p>
          <p className="text-[11px] leading-relaxed">
            Cancelling this order will release the reserved hardware units back to catalog inventory. For online prepaid orders, refunds are credited back to your original payment method in 3–5 business days.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
              Reason for Cancellation <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {CANCELLATION_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-sans cursor-pointer transition-all ${
                    selectedReason === reason
                      ? "bg-rose-500/5 border-rose-500/50 text-slate-900 dark:text-white font-semibold"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional custom notes */}
          <div className="space-y-1">
            <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Tell our concierge team any additional specifics..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={cancelMutation.isPending}
              className="px-4 py-2.5 rounded-xl text-xs font-heading font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Keep Order
            </button>

            <button
              type="submit"
              disabled={cancelMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cancelling Order...</span>
                </>
              ) : (
                <span>Confirm Order Cancellation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
