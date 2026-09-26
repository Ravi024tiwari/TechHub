import React, { useState, useEffect } from "react";
import { X, Truck, Calendar, Link as LinkIcon, Hash, Check } from "lucide-react";

const POPULAR_COURIERS = [
  "BlueDart Express",
  "Delhivery",
  "DTDC Express",
  "FedEx India",
  "Shadowfax",
  "Ecom Express",
];

export default function OrderTrackingModal({
  isOpen,
  onClose,
  order,
  onSubmit,
  isSubmitting = false,
}) {
  const [courierPartner, setCourierPartner] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  useEffect(() => {
    if (order) {
      setCourierPartner(order.trackingInfo?.courierPartner || "BlueDart Express");
      setTrackingNumber(order.trackingInfo?.trackingNumber || "");
      setTrackingUrl(order.trackingInfo?.trackingUrl || "");
      if (order.trackingInfo?.estimatedDelivery) {
        setEstimatedDelivery(
          new Date(order.trackingInfo.estimatedDelivery).toISOString().split("T")[0]
        );
      } else {
        // Default to +3 days from today
        const d = new Date();
        d.setDate(d.getDate() + 3);
        setEstimatedDelivery(d.toISOString().split("T")[0]);
      }
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!courierPartner || !trackingNumber) return;

    onSubmit({
      orderId: order._id,
      trackingData: {
        courierPartner,
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl.trim(),
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-2xl p-6 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Fulfillment & Courier Logistics
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Order #{order.orderNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Quick Courier Select Chips */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Courier Partner
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {POPULAR_COURIERS.map((courier) => (
                <button
                  key={courier}
                  type="button"
                  onClick={() => setCourierPartner(courier)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    courierPartner === courier
                      ? "bg-orange-500 text-white font-bold shadow-xs"
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  {courier}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              value={courierPartner}
              onChange={(e) => setCourierPartner(e.target.value)}
              placeholder="Or enter custom courier partner"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Tracking Number (AWB) */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tracking / AWB Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. BD-8921884210"
                className="w-full pl-9 pr-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Tracking URL */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
              Live Tracking URL (Optional)
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://track.bluedart.com/..."
                className="w-full pl-9 pr-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Estimated Delivery Date */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Delivery Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !courierPartner || !trackingNumber}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-mono font-bold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Updating..." : "Dispatch & Save Tracking"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
