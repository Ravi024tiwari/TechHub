import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Truck,
  Eye,
  Calendar,
  CreditCard,
  User,
  ChevronDown,
  ExternalLink,
  MapPin,
  Copy,
  Check,
  ChevronUp,
} from "lucide-react";

import OrderStatusDropdown from "./OrderStatusDropdown";

export default function AdminOrderCard({
  order,
  onUpdateStatus,
  onOpenTracking,
  isUpdating = false,
  currencyFormatter,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = (val) =>
    currencyFormatter ? currencyFormatter(val) : `₹${(val || 0).toLocaleString()}`;

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectStatus = (newStatus) => {
    setIsMenuOpen(false);
    if (newStatus === order.orderStatus) return;

    if (newStatus === "SHIPPED" && !order.trackingInfo?.trackingNumber) {
      onOpenTracking(order);
    }
    onUpdateStatus({ orderId: order._id, status: newStatus });
  };

  const itemCount =
    order.orderItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <div
      className={`relative p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-500 dark:hover:border-white/60 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group ${
        isMenuOpen ? "z-30" : "z-[1]"
      }`}
    >
      {/* Ambient background glow contained in isolated overflow-hidden box so dropdowns are NEVER clipped */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
        <div className="absolute -top-14 -right-14 w-44 h-44 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
      </div>

      {/* Top Header Section: Order ID, Copy, Status Dropdown, and Customer Meta */}
      <div className="relative z-20 pb-3 border-b border-slate-200 dark:border-white/15">
        {/* Row 1: Order ID badge & Status Dropdown side-by-side */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-heading font-black text-xs sm:text-base text-slate-900 dark:text-white tracking-tight truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none">
                #{order.orderNumber}
              </span>
              <button
                type="button"
                onClick={copyOrderId}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Copy Order ID"
              >
                {copied ? (
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Interactive Status Selector Dropdown */}
          <div className="shrink-0">
            <OrderStatusDropdown
              currentStatus={order.orderStatus}
              onSelectStatus={handleSelectStatus}
              isUpdating={isUpdating}
              onOpenChange={(open) => setIsMenuOpen(open)}
              align="right"
            />
          </div>
        </div>

        {/* Row 2: Customer Name, City and Date metadata */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-sans mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <strong className="text-slate-900 dark:text-white font-medium truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
              {order.shippingAddress?.fullName || order.user?.name || "Customer"}
            </strong>
            {order.shippingAddress?.city && (
              <span className="text-slate-400 dark:text-slate-500 truncate hidden xs:inline">
                ({order.shippingAddress.city}, {order.shippingAddress.state})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 shrink-0 ml-2">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Items Showcase & Financial Highlight */}
      <div className="relative z-0 py-3 sm:py-4">
        {/* Products Row: Thumbnails + Primary Title */}
        <div className="flex items-start gap-3">
          {/* Thumbnails list */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {order.orderItems?.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/20 p-1 flex items-center justify-center overflow-hidden shrink-0 group/thumb shadow-xs hover:border-orange-500/50 transition-colors"
                title={`${item.title} (x${item.quantity})`}
              >
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=120&q=80"
                  }
                  alt={item.title}
                  className="w-full h-full object-contain group-hover/thumb:scale-110 transition-transform duration-300"
                />
                {item.quantity > 1 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-sans font-bold bg-slate-900 text-white dark:bg-orange-500 shadow-xs border border-white/20">
                    x{item.quantity}
                  </span>
                )}
              </div>
            ))}

            {order.orderItems?.length > 3 && (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/20 flex items-center justify-center text-xs font-sans font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                +{order.orderItems.length - 3}
              </div>
            )}
          </div>

          {/* Primary Item Title & Expand trigger */}
          <div className="min-w-0 flex-1">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white line-clamp-2 font-sans leading-snug">
              {order.orderItems?.[0]?.title || "Electronics items"}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] sm:text-xs font-sans text-slate-500 dark:text-slate-400">
                {itemCount} total {itemCount === 1 ? "unit" : "units"}
              </span>
              {order.orderItems?.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="text-[11px] sm:text-xs font-sans font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{isExpanded ? "Hide items" : `View all (${order.orderItems.length})`}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Financial Strip */}
        <div className="mt-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-sans uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
              Grand Total
            </span>
            <span className="text-base sm:text-xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              {formatPrice(order.pricing?.grandTotal)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            <span
              className={`text-[11px] font-sans font-semibold px-2 py-0.5 rounded-lg border ${
                order.paymentInfo?.method === "COD"
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                  : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30"
              }`}
            >
              {order.paymentInfo?.method === "COD" ? "COD" : "Online UPI"}
            </span>
            <span
              className={`text-[11px] font-sans font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                order.paymentInfo?.status === "PAID"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  order.paymentInfo?.status === "PAID"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
              />
              {order.paymentInfo?.status || "PENDING"}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Order Items List */}
      {isExpanded && (
        <div className="relative z-0 mb-3 p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-300 dark:border-white/10 space-y-2 animate-in fade-in duration-150">
          <span className="text-[11px] font-sans uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
            All Items in this Order:
          </span>
          {order.orderItems?.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs font-sans py-1.5 border-b border-slate-200 dark:border-white/5 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0 mr-2">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-7 h-7 rounded-lg object-contain bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-0.5 shrink-0"
                  />
                )}
                <span className="text-slate-800 dark:text-slate-200 truncate font-medium">
                  {item.title}
                </span>
                <strong className="text-orange-600 dark:text-orange-400 font-semibold shrink-0">
                  ×{item.quantity}
                </strong>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white shrink-0 font-mono">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Actions Row: Tracking info & Buttons */}
      <div className="relative z-0 pt-3 border-t border-slate-200 dark:border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Logistics snippet */}
        <div className="text-[11px] sm:text-xs font-sans text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 shrink-0" />
          {order.trackingInfo?.trackingNumber ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px] sm:max-w-[260px]">
                {order.trackingInfo.courierPartner}: <strong className="font-mono">{order.trackingInfo.trackingNumber}</strong>
              </span>
              {order.trackingInfo.trackingUrl && (
                <a
                  href={order.trackingInfo.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-600 dark:text-orange-400 hover:underline shrink-0"
                  title="Open live tracking URL"
                >
                  <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              No courier assigned yet
            </span>
          )}
        </div>

        {/* Action Buttons: 2 Equal Columns on Mobile, Inline on Desktop */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onOpenTracking(order)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-sans font-semibold bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white hover:border-slate-400 dark:hover:border-white/50 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <Truck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">
              {order.trackingInfo?.trackingNumber ? "Edit AWB" : "+ Ship / AWB"}
            </span>
          </button>

          <Link
            to={`/admin/orders/${order._id}`}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-orange-400 dark:text-orange-500 shrink-0" />
            <span>Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
