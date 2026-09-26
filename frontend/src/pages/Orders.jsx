import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useMyOrdersQuery } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  CreditCard,
  Banknote,
} from "lucide-react";

export default function Orders() {
  const { isAuthenticated } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders = [], isLoading } = useMyOrdersQuery(
    statusFilter !== "all" ? { status: statusFilter } : {}
  );

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 uppercase">
            <CheckCircle2 className="h-3 w-3" />
            <span>Delivered</span>
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase">
            <Truck className="h-3 w-3" />
            <span>In Transit</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
            <AlertCircle className="h-3 w-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 uppercase">
            <Clock className="h-3 w-3" />
            <span>Processing</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-tech text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link to="/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Catalog
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-medium">Orders & Shipments</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-tech uppercase tracking-wider mb-2 font-semibold">
              <Package className="h-3 w-3" />
              <span>Real-Time Order Telemetry</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Orders & Dispatches
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track courier delivery, review order line items, and inspect dispatch locations.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm hover:scale-105 active:scale-95 transition-all w-fit"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Not Authenticated State */}
        {!isAuthenticated ? (
          <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10">
            <Package className="h-12 w-12 mx-auto text-sky-500 mb-4" />
            <h2 className="font-heading font-bold text-lg mb-2">Please Sign In</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Sign in with your account to view your purchase history and live shipment tracking.
            </p>
            <Link
              to="/login?redirect=/orders"
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all inline-block"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-500 mb-3" />
            <p className="text-xs text-slate-400">Loading your orders telemetry...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Package className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No Orders Placed Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              When you purchase electronics on TechHub, your real-time air dispatch and courier tracking telemetry will appear right here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <span>Browse Flagship Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* Orders Timeline List */
          <div className="space-y-6">
            {orders.map((order) => {
              const shipping = order.shippingAddress || {};
              const pricing = order.pricing || {};
              const payment = order.payment || {};

              return (
                <div
                  key={order._id}
                  className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden"
                >
                  {/* Order Top Meta Bar */}
                  <div className="px-6 py-4 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          Order Number
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                        </span>
                      </div>

                      <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          Date Placed
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          Total Amount
                        </span>
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                          {formatINR(pricing.grandTotal || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  </div>

                  {/* Order Body: Items & Shipping Destination */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Items Column */}
                    <div className="lg:col-span-8 space-y-3">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
                        Purchased Items ({order.orderItems?.length || 0})
                      </span>

                      {order.orderItems?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]"
                        >
                          <div className="h-16 w-16 rounded-xl bg-white dark:bg-[#07090e] border border-slate-200 dark:border-white/10 shrink-0 p-1 flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              <span>Qty: {item.quantity}</span>
                              {item.selectedSpecs?.color && (
                                <span>Color: {item.selectedSpecs.color}</span>
                              )}
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {formatINR(item.price)} each
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address & Payment Column */}
                    <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1 mb-1">
                          <MapPin className="h-3.5 w-3.5 text-sky-500" />
                          <span>Delivered To:</span>
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {shipping.fullName}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                          {shipping.street}{shipping.landmark ? `, ${shipping.landmark}` : ""}, {shipping.city}, {shipping.state} - <span className="font-mono">{shipping.pincode}</span>
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-1">
                          Phone: +91 {shipping.phone}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                          Payment Mode:
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          {payment.method === "COD" ? (
                            <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5 text-sky-500" />
                          )}
                          <span>
                            {payment.method === "COD"
                              ? "Cash on Delivery (Pending Courier Handover)"
                              : "Paid Online via Gateway"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
