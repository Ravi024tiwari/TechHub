import React from "react";
import {
  RotateCcw,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  DollarSign,
  ArrowRight,
  Check,
  Copy,
  MapPin,
} from "lucide-react";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

function ReturnStatusBadge({ status }) {
  switch (status) {
    case "REQUESTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 shadow-xs">
          <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>Pending QA Triage</span>
        </span>
      );
    case "APPROVED":
    case "PICKUP_SCHEDULED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-xs">
          <Truck className="w-3.5 h-3.5 text-sky-400" />
          <span>Pickup Scheduled</span>
        </span>
      );
    case "ITEM_RECEIVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs">
          <Package className="w-3.5 h-3.5 text-indigo-400" />
          <span>Warehouse Received</span>
        </span>
      );
    case "REFUND_PROCESSED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refund Processed</span>
        </span>
      );
    case "REPLACEMENT_DISPATCHED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
          <Truck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Replacement Dispatched</span>
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Rejected</span>
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans text-slate-400 border border-slate-200 dark:border-white/10">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans text-slate-400 border border-slate-200 dark:border-white/10">
          {status}
        </span>
      );
  }
}

/**
 * ReturnTicketCard - Comprehensive RMA item card with customer details,
 * defect evidence gallery, resolution controls, and logistics status.
 */
export default function ReturnTicketCard({
  ret,
  onQuickApprove,
  onManage,
  onOpenLightbox,
  onCopy,
}) {
  const item = ret.orderItem || {};
  const pickup = ret.pickupAddress || {};
  const user = ret.user || {};
  const order = ret.order || {};
  const images = ret.evidenceImages || [];

  return (
    <div className="group rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/15 p-3.5 sm:p-6 shadow-sm hover:border-slate-300 dark:hover:border-white/30 transition-all space-y-4 sm:space-y-5 w-full max-w-full overflow-hidden">
      {/* Header Row: Return Number, Type, Linked Order, Status Badge, Manage Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0">
          {/* RMA Number Pill with Copy */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono font-black text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-2xs shrink-0">
            <span>#{ret.returnNumber}</span>
            <button
              type="button"
              onClick={() => onCopy(ret.returnNumber)}
              className="text-slate-400 hover:text-orange-500 cursor-pointer p-0.5 transition-colors"
              title="Copy RMA Number"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Resolution Type Pill */}
          <span
            className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-heading font-extrabold uppercase tracking-wider shrink-0 ${
              ret.requestType === "REPLACEMENT"
                ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
            }`}
          >
            {ret.requestType === "REPLACEMENT" ? "Hardware Replacement" : "Return & Refund"}
          </span>

          {/* Linked Order */}
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans truncate">
            Order: <strong className="font-mono text-slate-800 dark:text-slate-200">#{order.orderNumber || "ORD"}</strong>
          </span>
        </div>

        {/* Status Badge + Quick Approve + Manage RMA Button */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
          <div className="shrink-0">
            <ReturnStatusBadge status={ret.status} />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct 1-Click Quick Triage for REQUESTED state */}
            {ret.status === "REQUESTED" && (
              <button
                type="button"
                onClick={() => onQuickApprove(ret)}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-heading font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 transition-all cursor-pointer active:scale-95 shrink-0"
                title="Quick approve for doorstep courier pickup"
              >
                <Check className="w-3.5 h-3.5 text-sky-500" />
                <span>Quick Approve</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onManage(ret)}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-heading font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-xs hover:shadow-orange-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <span>Manage RMA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Body 3-Column Layout: Responsive Stacking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 text-xs">
        {/* Item Details (5 cols) */}
        <div className="lg:col-span-5 flex items-start gap-3 sm:gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-black/20 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-1.5 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
            ) : (
              <Package className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 space-y-1 flex-1">
            <h4 className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
              {item.title}
            </h4>
            <div className="text-[11px] font-sans text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2 gap-y-0.5">
              <span className="font-mono text-orange-600 dark:text-orange-400 font-bold">
                Qty: {item.quantity}
              </span>
              {item.selectedSpecs?.color && <span>• Color: {item.selectedSpecs.color}</span>}
              <span>• Total: {formatINR(item.price * item.quantity)}</span>
            </div>
            {ret.serialNumber && (
              <span className="inline-block px-2 py-0.5 rounded-md font-mono text-[10px] bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                SN: {ret.serialNumber}
              </span>
            )}
          </div>
        </div>

        {/* Customer Defect Statement & Evidence Photos (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-heading font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Reason: {ret.reason?.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans italic line-clamp-2 leading-relaxed pl-2 border-l-2 border-orange-500/50 break-words">
              "{ret.description}"
            </p>
          </div>

          {/* Evidence Photos Carousel / Thumbnails */}
          {images.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onOpenLightbox(img.url)}
                  className="relative group w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
                  title="Click to inspect defect photo evidence"
                >
                  <img src={img.url} alt={`evidence-${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
              <span className="text-[10px] font-sans text-slate-400 pl-1 shrink-0">
                {images.length} photo proof{images.length === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

        {/* Customer Reverse Destination (3 cols) */}
        <div className="lg:col-span-3 space-y-1.5 bg-slate-50/80 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 min-w-0">
          <div className="flex items-center gap-1.5 font-heading font-bold text-slate-800 dark:text-slate-200">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Reverse Pickup Destination</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans leading-relaxed break-words">
            <strong className="text-slate-900 dark:text-white block font-heading break-words">
              {pickup.fullName || user.name || "Customer"}
            </strong>
            {pickup.street || ""}{pickup.landmark ? `, ${pickup.landmark}` : ""}<br />
            {pickup.city}, {pickup.state} - <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{pickup.pincode}</span><br />
            <span className="font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <span>Ph: +91 {pickup.phone || user.phone || "N/A"}</span>
            </span>
          </p>
        </div>
      </div>

      {/* Tracking / Refund Metadata Footer */}
      {(ret.replacementDetails?.trackingNumber || ret.refundDetails?.razorpayRefundId || ret.adminRemarks) && (
        <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {ret.replacementDetails?.trackingNumber && (
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-sans break-words">
                Replacement Unit Dispatched via <strong>{ret.replacementDetails.courierPartner}</strong> • Tracking: <strong className="font-mono text-orange-500 break-all">{ret.replacementDetails.trackingNumber}</strong>
              </span>
            </div>
          )}

          {ret.refundDetails?.razorpayRefundId && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-sans break-words">
                Refund Reference: <strong className="font-mono text-emerald-600 dark:text-emerald-400 break-all">{ret.refundDetails.razorpayRefundId}</strong> ({formatINR(ret.refundDetails.amount)})
              </span>
            </div>
          )}

          {ret.adminRemarks && (
            <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 italic break-words">
              Audit Note: {ret.adminRemarks}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
