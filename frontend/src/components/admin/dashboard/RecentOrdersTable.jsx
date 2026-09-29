import React from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";

/**
 * Enterprise Production Recent Orders Table:
 * - Real-time recent store orders.
 * - Customer avatar badge.
 * - Product snapshot preview.
 * - Status pills matching production color schemes.
 */
export default function RecentOrdersTable({
  orders = [],
  currencyFormatter,
}) {
  // Format relative time
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "recently";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.floor((now - date) / (1000 * 60));
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const getStatusBadge = (status = "") => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "DELIVERED":
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <TrendingUp className="w-3 h-3" />
            <span>In Transit</span>
          </span>
        );
      case "PROCESSING":
      case "CONFIRMED":
      case "PLACED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
            {s}
          </span>
        );
    }
  };

  const displayOrders = orders && orders.length > 0 ? orders : [];

  return (
    <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-heading font-bold text-slate-900 dark:text-white">
            Recent Store Orders
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            Real-time customer transactions & fulfillment status
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-sky-600 dark:text-sky-400 hover:underline group"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Orders Table or Empty State */}
      {displayOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 my-auto">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 mb-2 shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-sm font-heading font-bold text-slate-800 dark:text-slate-200">
            No Orders Placed Yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs font-sans">
            New customer purchases will appear here in real-time as they checkout.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:-mx-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-500 font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-5 sm:px-6">Order ID</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3 hidden md:table-cell">Product</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-5 sm:px-6 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {displayOrders.map((order) => {
              const orderId =
                order.orderNumber || `#ORD-${order._id.slice(-4).toUpperCase()}`;
              const productTitle =
                order.productName ||
                order.orderItems?.[0]?.title ||
                "Electronics Item";

              return (
                <tr
                  key={order._id}
                  className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-5 sm:px-6 font-mono font-bold text-sky-600 dark:text-sky-400">
                    <Link
                      to={`/admin/orders?search=${order.orderNumber || order._id}`}
                      className="hover:underline"
                    >
                      {orderId}
                    </Link>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-white/10 shrink-0">
                        {order.user?.name?.charAt(0) || "U"}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[110px] sm:max-w-[140px]">
                        {order.user?.name || "Customer"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 truncate max-w-[140px] hidden md:table-cell font-sans">
                    {productTitle}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {currencyFormatter
                      ? currencyFormatter(order.pricing?.grandTotal || 0)
                      : `₹${(order.pricing?.grandTotal || 0).toLocaleString()}`}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getStatusBadge(order.orderStatus)}
                  </td>
                  <td className="py-3 px-5 sm:px-6 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatTimeAgo(order.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
