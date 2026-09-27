import React, { useState } from "react";
import {
  RotateCcw,
  X,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Package,
  AlertCircle,
} from "lucide-react";
import { useSubmitReturnMutation } from "@/hooks/useOrders";

const RETURN_REASONS = [
  "Hardware Defect / Dead on Arrival (DOA)",
  "Damaged in courier transit",
  "Missing cables, manual, or accessories",
  "Wrong model or specifications delivered",
  "Performance / benchmarks not matching spec sheet",
  "Other hardware fault",
];

export default function OrderReturnModal({
  isOpen,
  onClose,
  order,
  item,
  onSuccess,
}) {
  const [requestType, setRequestType] = useState("RETURN_AND_REFUND");
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [description, setDescription] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const submitReturnMutation = useSubmitReturnMutation();

  if (!isOpen || !item || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage("Please describe the issue in at least 10 characters.");
      return;
    }

    try {
      await submitReturnMutation.mutateAsync({
        orderId: order._id,
        orderItemId: item._id,
        requestType,
        reason,
        description: description.trim(),
        serialNumber: serialNumber.trim(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit return request. You may have an existing request in review."
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
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Return / Replacement Request
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              7-day Hassle-Free Concierge Service for Order #{order.orderNumber}
            </p>
          </div>
        </div>

        {/* Item Preview */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
          <div className="h-12 w-12 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shrink-0 p-1 flex items-center justify-center overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
            ) : (
              <Package className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {item.title}
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Qty: {item.quantity} • Purchase: ₹{(item.price || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="font-heading font-black text-lg text-slate-900 dark:text-white">
              Return Request Filed
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Our hardware QA concierge has logged your request. Doorstep courier pickup will be scheduled upon review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Request Type Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Resolution Preference <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRequestType("RETURN_AND_REFUND")}
                  className={`p-3 rounded-xl border text-xs font-heading font-bold transition-all cursor-pointer ${
                    requestType === "RETURN_AND_REFUND"
                      ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Return & Refund
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType("REPLACEMENT")}
                  className={`p-3 rounded-xl border text-xs font-heading font-bold transition-all cursor-pointer ${
                    requestType === "REPLACEMENT"
                      ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Replacement Unit
                </button>
              </div>
            </div>

            {/* Reason Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Reason for Return <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500 cursor-pointer"
              >
                {RETURN_REASONS.map((r) => (
                  <option key={r} value={r} className="bg-white dark:bg-[#0c0f17]">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Serial Number */}
            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Hardware Serial Number / IMEI (Optional)
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Printed on box or device barcode"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* Detailed Description */}
            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Defect / Issue Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe symptoms, temperature spikes, or transit damages..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={submitReturnMutation.isPending}
                className="px-4 py-2.5 rounded-xl text-xs font-heading font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitReturnMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitReturnMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Submit Return Request</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
