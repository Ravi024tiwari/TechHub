import React from "react";
import {
  X,
  User,
  MapPin,
  CreditCard,
  Truck,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Tag,
} from "lucide-react";

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onOpenTracking,
  currencyFormatter,
}) {
  if (!isOpen || !order) return null;

  const formatPrice = (val) =>
    currencyFormatter ? currencyFormatter(val) : `₹${(val || 0).toLocaleString()}`;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "PROCESSING":
      case "CONFIRMED":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  Order #{order.orderNumber}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getStatusBadgeClass(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Customer Contact */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span>Customer Profile</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900 dark:text-white font-sans text-sm">
                  {order.shippingAddress?.fullName || order.user?.name || "Customer"}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-mono">
                  {order.user?.email || "No email recorded"}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-mono">
                  📞 {order.shippingAddress?.phone || order.user?.phone || "No phone recorded"}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Destination Address</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 font-sans space-y-0.5">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {order.shippingAddress?.addressLine1 || "Address on record"}
                </p>
                {order.shippingAddress?.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p className="font-mono">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {order.shippingAddress?.postalCode || order.shippingAddress?.pincode}
                  </strong>
                </p>
                <p className="text-slate-400 text-[11px]">
                  {order.shippingAddress?.country || "India"}
                </p>
              </div>
            </div>
          </div>

          {/* Logistics & Tracking Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">
                  Logistics Tracking
                </span>
                {order.trackingInfo?.trackingNumber ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      {order.trackingInfo.courierPartner}: {order.trackingInfo.trackingNumber}
                    </span>
                    {order.trackingInfo.trackingUrl && (
                      <a
                        href={order.trackingInfo.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-500 hover:underline inline-flex items-center gap-0.5 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No tracking info assigned yet.
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenTracking(order)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-orange-500 text-slate-800 dark:text-white transition-colors cursor-pointer self-start sm:self-auto"
            >
              {order.trackingInfo?.trackingNumber ? "Update Tracking" : "+ Assign Tracking"}
            </button>
          </div>

          {/* Order Items Table */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Purchased Electronics ({order.orderItems?.length || 0} items)
            </h4>
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
              {order.orderItems?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white dark:bg-[#0c0f17] text-xs gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=120&q=80"}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white truncate font-sans text-xs sm:text-[13px]">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                        {item.color?.name && <span>Color: {item.color.name} •</span>}
                        <span>Qty: {item.quantity}</span>
                        <span>• {formatPrice(item.price)} each</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-slate-900 dark:text-white shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Financial Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Items Subtotal:</span>
              <span>{formatPrice(order.pricing?.itemsTotal || order.pricing?.subtotal)}</span>
            </div>
            {order.pricing?.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Coupon Discount ({order.coupon?.code || "PROMO"}):
                </span>
                <span>-{formatPrice(order.pricing.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Shipping Fee:</span>
              <span>{order.pricing?.shippingFee === 0 ? "FREE" : formatPrice(order.pricing?.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Tax (GST Included):</span>
              <span>{formatPrice(order.pricing?.tax || 0)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-baseline text-sm font-heading font-black text-slate-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="text-base text-orange-600 dark:text-orange-400 font-mono">
                {formatPrice(order.pricing?.grandTotal)}
              </span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" />
              <span className="text-slate-500 dark:text-slate-400">Payment:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {order.paymentInfo?.method === "COD" ? "Cash On Delivery (COD)" : "Razorpay Online (UPI/Cards)"}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                order.paymentInfo?.status === "PAID"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              {order.paymentInfo?.status || "PENDING"}
            </span>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 flex justify-end bg-slate-50/50 dark:bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-mono font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
