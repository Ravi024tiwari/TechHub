import React, { useState } from "react";
import {
  RotateCcw,
  Truck,
  CheckCircle2,
  AlertCircle,
  X,
  DollarSign,
} from "lucide-react";
import {
  useReviewReturnStatusMutation,
  useProcessRefundMutation,
  useDispatchReplacementMutation,
} from "@/hooks/useReturns";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

/**
 * ReturnActionModal - Interactive Admin RMA Resolution Modal
 * Supports:
 * - 1. Approve / Reject with audit remarks and mandatory customer rejection justification
 * - 2. Mark Received & verified at central fulfillment center
 * - 3. Programmatic Razorpay / Ledger Refund with inventory restock option
 * - 4. Replacement hardware dispatch with courier logistics partner and tracking AWB
 */
export default function ReturnActionModal({ returnItem, onClose, onSuccess }) {
  // Form states
  const [decision, setDecision] = useState("APPROVED");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [courierPartner, setCourierPartner] = useState("Blue Dart Express");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [restockItem, setRestockItem] = useState(true);
  const [customRefundAmount, setCustomRefundAmount] = useState(
    returnItem.refundDetails?.amount ||
      returnItem.orderItem?.price * returnItem.orderItem?.quantity ||
      0
  );
  const [errorMessage, setErrorMessage] = useState("");

  const reviewStatusMutation = useReviewReturnStatusMutation();
  const processRefundMutation = useProcessRefundMutation();
  const dispatchReplacementMutation = useDispatchReplacementMutation();

  const isPending =
    reviewStatusMutation.isPending ||
    processRefundMutation.isPending ||
    dispatchReplacementMutation.isPending;

  // Handle Approve / Reject
  const handleApproveReject = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (decision === "REJECTED" && (!rejectionReason || !rejectionReason.trim())) {
      setErrorMessage("Please enter an explicit rejection reason for the customer.");
      return;
    }

    try {
      await reviewStatusMutation.mutateAsync({
        returnId: returnItem._id,
        payload: {
          status: decision,
          adminRemarks: adminRemarks.trim(),
          rejectionReason: decision === "REJECTED" ? rejectionReason.trim() : "",
        },
      });
      onSuccess(`RMA ${returnItem.returnNumber} status updated to ${decision}!`);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to update status");
    }
  };

  // Handle Mark Received at Warehouse
  const handleMarkReceived = async () => {
    setErrorMessage("");
    try {
      await reviewStatusMutation.mutateAsync({
        returnId: returnItem._id,
        payload: {
          status: "ITEM_RECEIVED",
          adminRemarks:
            adminRemarks.trim() || "Item physically received & inspected at fulfillment warehouse.",
        },
      });
      onSuccess(`RMA ${returnItem.returnNumber} marked as ITEM_RECEIVED at warehouse.`);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to update status");
    }
  };

  // Handle Process Programmatic Refund
  const handleProcessRefund = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await processRefundMutation.mutateAsync({
        returnId: returnItem._id,
        payload: {
          customAmount: Number(customRefundAmount),
          restockItem,
          notes: adminRemarks.trim(),
        },
      });
      onSuccess(`Refund of ₹${customRefundAmount} processed for RMA ${returnItem.returnNumber}!`);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Refund failed");
    }
  };

  // Handle Dispatch Replacement
  const handleDispatchReplacement = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!trackingNumber.trim()) {
      setErrorMessage("Tracking Number is required for dispatching replacement unit.");
      return;
    }

    try {
      await dispatchReplacementMutation.mutateAsync({
        returnId: returnItem._id,
        payload: {
          courierPartner: courierPartner.trim(),
          trackingNumber: trackingNumber.trim(),
          restockReturnedItem: restockItem,
          adminRemarks: adminRemarks.trim(),
        },
      });
      onSuccess(`Replacement unit dispatched via ${courierPartner} (Tracking: ${trackingNumber})!`);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Dispatch failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
              Manage RMA #{returnItem.returnNumber}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Customer: {returnItem.user?.name || "Customer"} • Current Status:{" "}
              <strong className="text-slate-900 dark:text-white">{returnItem.status}</strong>
            </p>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Form 1: Approve / Reject Decision (for REQUESTED status) */}
        {returnItem.status === "REQUESTED" && (
          <form onSubmit={handleApproveReject} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Action Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision("APPROVED")}
                  className={`p-3 rounded-2xl border text-center font-heading font-bold text-xs transition-all cursor-pointer ${
                    decision === "APPROVED"
                      ? "bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/30"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  ✓ Approve Reverse Pickup
                </button>

                <button
                  type="button"
                  onClick={() => setDecision("REJECTED")}
                  className={`p-3 rounded-2xl border text-center font-heading font-bold text-xs transition-all cursor-pointer ${
                    decision === "REJECTED"
                      ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  ✕ Reject Application
                </button>
              </div>
            </div>

            {decision === "REJECTED" && (
              <div className="space-y-1">
                <label className="block text-xs font-heading font-bold text-rose-600 dark:text-rose-400">
                  Rejection Reason (Mandatory for customer notice) *
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Physical customer-induced impact damage not covered under DOA warranty..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-rose-500/40 text-slate-900 dark:text-white focus:outline-hidden resize-none font-sans"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Quality Inspection Remarks
              </label>
              <textarea
                rows={2}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Internal audit note or pickup courier assignment..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-heading font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={`px-5 py-2.5 rounded-xl text-xs font-heading font-bold text-white shadow-md transition-all cursor-pointer ${
                  decision === "REJECTED" ? "bg-rose-600 hover:bg-rose-500" : "bg-sky-600 hover:bg-sky-500"
                }`}
              >
                {isPending ? "Updating..." : `Confirm ${decision === "APPROVED" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </form>
        )}

        {/* Action Form 2: Mark Item Received at Warehouse */}
        {["APPROVED", "PICKUP_SCHEDULED"].includes(returnItem.status) && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/25 space-y-2 text-xs">
              <div className="font-heading font-bold text-sky-800 dark:text-sky-300 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Pickup In Progress</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                When reverse pickup arrives at the fulfillment center, mark the item as received to unlock refund processing or replacement dispatch.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Warehouse Arrival Condition Remarks
              </label>
              <textarea
                rows={2}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Physical box condition, serial verification matching..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-heading font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkReceived}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl text-xs font-heading font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
              >
                {isPending ? "Updating..." : "Mark Item Received at Warehouse"}
              </button>
            </div>
          </div>
        )}

        {/* Action Form 3: Resolution Phase (Item Received) */}
        {returnItem.status === "ITEM_RECEIVED" && (
          <div>
            {returnItem.requestType === "RETURN_AND_REFUND" ? (
              <form onSubmit={handleProcessRefund} className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2 text-xs">
                  <div className="font-heading font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Refund Resolution Gateway</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                    Executing refund will programmatically trigger Razorpay API refund (for online payments) or credit customer ledger (for COD).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                    Refund Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={customRefundAmount}
                    onChange={(e) => setCustomRefundAmount(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="restock"
                    checked={restockItem}
                    onChange={(e) => setRestockItem(e.target.checked)}
                    className="rounded text-orange-500 cursor-pointer"
                  />
                  <label htmlFor="restock" className="text-xs font-sans text-slate-700 dark:text-slate-300 cursor-pointer">
                    Restock item into active inventory (+{returnItem.orderItem?.quantity || 1} stock)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-heading font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl text-xs font-heading font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer"
                  >
                    {isPending ? "Executing..." : `Execute Refund (${formatINR(customRefundAmount)})`}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleDispatchReplacement} className="space-y-4">
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25 space-y-2 text-xs">
                  <div className="font-heading font-bold text-orange-800 dark:text-orange-300 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Replacement Hardware Dispatch</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                    System will automatically decrement 1 unit from stock for the replacement product and notify customer with live tracking telemetry.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                    Courier Logistics Partner *
                  </label>
                  <input
                    type="text"
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    placeholder="e.g. Blue Dart Express, Delhivery, DTDC"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                  {/* Quick Logistics Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Blue Dart Express", "Delhivery", "DTDC Express", "Shadowfax", "Xpressbees"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCourierPartner(preset)}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-sans font-bold transition-all cursor-pointer ${
                          courierPartner === preset
                            ? "bg-orange-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                    Replacement Tracking Number / Air Waybill (AWB) *
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLUEDART-98421098"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="restockOld"
                    checked={restockItem}
                    onChange={(e) => setRestockItem(e.target.checked)}
                    className="rounded text-orange-500 cursor-pointer"
                  />
                  <label htmlFor="restockOld" className="text-xs font-sans text-slate-700 dark:text-slate-300 cursor-pointer">
                    Restock returned item into inventory (if functional or repackaged)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-heading font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl text-xs font-heading font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-md transition-all cursor-pointer"
                  >
                    {isPending ? "Dispatching..." : "Dispatch Replacement Unit"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Completed or Rejected state notice */}
        {["REFUND_PROCESSED", "REPLACEMENT_DISPATCHED", "COMPLETED", "REJECTED"].includes(returnItem.status) && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2 text-xs text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="font-heading font-bold text-slate-800 dark:text-white">
              Lifecycle Completed: {returnItem.status}
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-sans">
              This RMA request has concluded its resolution cycle. All inventory adjustments and financial entries are locked.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
