import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Package,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";

export default function RecentOrdersList({ recentOrders = [] }) {
  const [filter, setFilter] = useState("ALL");
  const [copiedOrder, setCopiedOrder] = useState(null);

  const statusStyles = {
    DELIVERED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    PLACED: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    CONFIRMED: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    PROCESSING: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    SHIPPED: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    OUT_FOR_DELIVERY: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    CANCELLED: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  };

  const filteredOrders = recentOrders.filter((order) => {
    if (filter === "ALL") return true;
    if (filter === "DELIVERED") return order.orderStatus === "DELIVERED";
    if (filter === "ACTIVE")
      return ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(
        order.orderStatus
      );
    if (filter === "CANCELLED") return order.orderStatus === "CANCELLED";
    return true;
  });

  const handleCopy = (orderNum) => {
    navigator.clipboard?.writeText(orderNum);
    setCopiedOrder(orderNum);
    setTimeout(() => setCopiedOrder(null), 2000);
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 p-4 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
              Recent Order Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Live records, delivery state & direct invoices
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["ALL", "DELIVERED", "ACTIVE", "CANCELLED"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                filter === f
                  ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"
              }`}
            >
              {f === "ALL" ? "All Orders" : f}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-10 space-y-3">
          <Package className="h-10 w-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No orders match this filter
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Switch filter or explore precision hardware to make your next purchase.
          </p>
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-xs font-bold font-heading transition-all cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const badgeClass = statusStyles[order.orderStatus] || statusStyles.PLACED;
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Recent";

            return (
              <div
                key={order._id}
                className="group flex flex-col md:flex-row md:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] hover:bg-orange-500/[0.03] border border-slate-200/80 dark:border-white/5 hover:border-orange-500/30 transition-all gap-4"
              >
                {/* Product Snapshot & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {order.previewItem?.image ? (
                    <img
                      src={order.previewItem.image}
                      alt={order.previewItem.title || "Product"}
                      className="h-14 w-14 rounded-xl object-cover bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        <span>#{order.orderNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.orderNumber)}
                          title="Copy Order ID"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedOrder === order.orderNumber ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-tech font-bold uppercase tracking-wider border ${badgeClass}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-sm">
                      {order.previewItem?.title || `${order.itemsCount} Items`}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {dateStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> {order.paymentMethod || "Prepaid"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Total Price & CTA */}
                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-200/60 dark:border-white/5 gap-2 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-tech mr-1 md:inline block">
                      Total:
                    </span>
                    <span className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/orders`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 hover:border-orange-500 hover:text-white border border-slate-200 dark:border-white/15 text-xs font-heading font-bold text-slate-700 dark:text-slate-200 shadow-xs transition-all"
                    >
                      <span>Details</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
