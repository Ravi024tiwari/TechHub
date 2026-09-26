import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  Loader2,
  ExternalLink,
  Tag,
  ShieldCheck,
  FileText,
  Printer,
  XCircle,
  Phone,
  Mail,
  Navigation,
  Layers,
} from "lucide-react";
import {
  useAdminOrderDetailQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderTrackingMutation,
  useCancelAdminOrderMutation,
} from "../../hooks/useAdminOrders";
import OrderTrackingModal from "../../components/admin/orders/OrderTrackingModal";
import OrderStatusDropdown from "../../components/admin/orders/OrderStatusDropdown";

const STATUS_STEPS = [
  { key: "PLACED", label: "Placed", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Navigation },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_OPTIONS = [
  { value: "PLACED", label: "Placed" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [copiedId, setCopiedId] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Query order details with 2-minute memory cache
  const { data, isLoading, isError, error, refetch } =
    useAdminOrderDetailQuery(orderId);

  // Mutations
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const updateTrackingMutation = useUpdateOrderTrackingMutation();
  const cancelOrderMutation = useCancelAdminOrderMutation();

  const order = data?.order || data;

  const copyOrderId = () => {
    if (!order?.orderNumber) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyAddressText = () => {
    if (!order?.shippingAddress) return;
    const addr = `${order.shippingAddress.fullName}\n${order.shippingAddress.addressLine1} ${order.shippingAddress.addressLine2 || ""}\n${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}\nPhone: ${order.shippingAddress.phone}`;
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleUpdateStatus = (newStatus) => {
    setIsStatusMenuOpen(false);
    if (!order || newStatus === order.orderStatus) return;

    if (newStatus === "SHIPPED" && !order.trackingInfo?.trackingNumber) {
      setIsTrackingModalOpen(true);
    }

    updateStatusMutation.mutate({
      orderId: order._id,
      status: newStatus,
    });
  };

  const handleTrackingSubmit = ({ trackingData }) => {
    updateTrackingMutation.mutate(
      { orderId: order._id, trackingData },
      {
        onSuccess: () => {
          setIsTrackingModalOpen(false);
          refetch();
        },
      }
    );
  };

  const handleCancelOrder = () => {
    if (!order) return;
    cancelOrderMutation.mutate(
      { orderId: order._id, reason: cancelReason },
      {
        onSuccess: () => {
          setIsCancelModalOpen(false);
          refetch();
        },
      }
    );
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 ring-1 ring-indigo-500/20";
      case "PROCESSING":
      case "CONFIRMED":
        return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30 ring-1 ring-sky-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 ring-1 ring-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 ring-1 ring-amber-500/20";
    }
  };

  // Compute active step index for stepper
  const currentStepIndex = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.orderStatus)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <div className="w-28 h-9 rounded-xl bg-slate-200 dark:bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-48 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 animate-pulse" />
            <div className="h-64 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 animate-pulse" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-52 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 animate-pulse" />
            <div className="h-52 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 shadow-xs max-w-md mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-1">
          Order Not Found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mb-6">
          {error?.message || "The requested order record could not be retrieved from the database."}
        </p>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-sans font-semibold bg-orange-500 text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/15">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-medium bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 hover:text-orange-500 hover:border-slate-400 dark:hover:border-white/50 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <span className="text-slate-400 font-sans text-xs">/</span>
          <span className="text-xs font-sans font-semibold text-slate-600 dark:text-slate-400">
            Fulfillment Dossier
          </span>
        </div>

        {/* Invoice & Print Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-medium bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Slip</span>
          </button>

          <a
            href={`/api/v1/invoices/${order._id}/download`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold bg-white dark:bg-white/10 border border-slate-300 dark:border-white/25 text-slate-800 dark:text-white hover:border-orange-500 hover:text-orange-600 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-orange-500" />
            <span>Tax Invoice (PDF)</span>
          </a>
        </div>
      </div>

      {/* Hero Header Card with Crisp Border (Gray on bright, White on dark) */}
      <div
        className={`relative p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all ${
          isStatusMenuOpen ? "z-30" : "z-10"
        }`}
      >
        {/* Ambient background glow isolated inside overflow-hidden wrapper so dropdown is NEVER clipped */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-14 -right-14 w-48 h-48 bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Order Title & Status Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="text-xs font-sans font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                Hardware Order
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-sans font-semibold border ${getStatusBadgeStyle(
                  order.orderStatus
                )}`}
              >
                <span className="w-2 h-2 rounded-full bg-current inline-block mr-1.5 animate-pulse" />
                {order.orderStatus}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-sans font-medium border ${
                  order.paymentInfo?.status === "PAID"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                }`}
              >
                {order.paymentInfo?.method === "COD" ? "Cash on Delivery" : "Razorpay Online"} •{" "}
                {order.paymentInfo?.status || "PENDING"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                #{order.orderNumber}
              </h1>
              <button
                type="button"
                onClick={copyOrderId}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title="Copy Order ID"
              >
                {copiedId ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1.5 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>

          {/* Action Controls: Status Selector & Logistics Dispatch */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Interactive Status Selector */}
            <OrderStatusDropdown
              currentStatus={order.orderStatus}
              onSelectStatus={handleUpdateStatus}
              isUpdating={updateStatusMutation.isPending}
              prefixLabel="Change Status:"
              onOpenChange={(open) => setIsStatusMenuOpen(open)}
              align="right"
            />

            {/* Courier Dispatch Button */}
            <button
              type="button"
              onClick={() => setIsTrackingModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-sans font-medium bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white hover:border-slate-400 dark:hover:border-white/50 transition-all cursor-pointer shadow-xs"
            >
              <Truck className="w-4 h-4 text-orange-500" />
              <span>
                {order.trackingInfo?.trackingNumber
                  ? "Update Logistics"
                  : "+ Dispatch Package"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 8 Cols & Right 4 Cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-0">
        {/* Left Section: Stepper, Items, Pricing (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Visual Fulfillment Lifecycle Stepper */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all">
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Fulfillment Lifecycle Journey</span>
            </h3>

            {/* Stepper Track */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx && order.orderStatus !== "CANCELLED";
                const isCurrent = order.orderStatus === step.key;
                const Icon = step.icon;

                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => handleUpdateStatus(step.key)}
                    disabled={updateStatusMutation.isPending || isCurrent}
                    title={
                      isCurrent
                        ? `Current state: ${step.label}`
                        : `Click to switch order status to ${step.label}`
                    }
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400 shadow-sm scale-105 ring-1 ring-orange-500/30"
                        : isPassed
                        ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:border-emerald-500/50 hover:scale-[1.02]"
                        : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-700 dark:hover:text-slate-200 hover:scale-[1.02]"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl mx-auto flex items-center justify-center mb-2 ${
                        isCurrent
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                          : isPassed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 dark:bg-white/10 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-sans font-semibold block truncate">
                      {step.label}
                    </span>
                    <span className="text-[11px] font-sans block text-slate-500 dark:text-slate-400 mt-0.5">
                      {isCurrent ? "Active" : isPassed ? "Complete" : "Tap to Set"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Timeline Notes if Available */}
            {order.statusTimeline && order.statusTimeline.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-sans uppercase font-bold text-slate-500 dark:text-slate-400 block mb-2.5">
                  Recent Audit Log Entries:
                </span>
                <div className="space-y-2">
                  {order.statusTimeline.slice(-3).reverse().map((entry, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-sans flex items-start justify-between gap-3 text-slate-600 dark:text-slate-400"
                    >
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        • {entry.note || `Status changed to ${entry.status}`}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0 font-mono">
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Ordered Electronics Items Table */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                  Purchased Hardware Items
                </h3>
                <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                  {order.orderItems?.length || 0}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-300 dark:border-white/20 overflow-hidden divide-y divide-slate-200 dark:divide-white/10">
              {order.orderItems?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-[#0c0f17] gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/20 p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=160&q=80"
                        }
                        alt={item.title}
                        className="w-full h-full object-contain hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm font-sans truncate">
                        {item.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-slate-500 dark:text-slate-400 mt-1">
                        {item.color?.name && (
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full border border-white/20"
                              style={{ backgroundColor: item.color.hex || "#94a3b8" }}
                            />
                            {item.color.name}
                          </span>
                        )}
                        <span>• Qty: {item.quantity}</span>
                        <span>• {formatINR(item.price)} each</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right self-end sm:self-center shrink-0">
                    <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white block font-mono">
                      {formatINR(item.price * item.quantity)}
                    </span>
                    <span className="text-xs text-slate-400 font-sans">
                      Line Subtotal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Financial & Invoice Calculation */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all">
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" />
              <span>Financial Ledger & Pricing Breakdown</span>
            </h3>

            <div className="space-y-2.5 text-xs font-sans">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Items Subtotal:</span>
                <span className="font-semibold font-mono">
                  {formatINR(order.pricing?.itemsTotal || order.pricing?.subtotal)}
                </span>
              </div>

              {order.pricing?.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Coupon Discount ({order.coupon?.code || "PROMO"}):
                  </span>
                  <span className="font-mono">-{formatINR(order.pricing.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Shipping & Handling:</span>
                <span className="font-mono">
                  {order.pricing?.shippingFee === 0
                    ? "FREE (Express Delivery)"
                    : formatINR(order.pricing?.shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>GST Tax (Included in MRP):</span>
                <span className="font-mono">{formatINR(order.pricing?.tax || 0)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/15 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-heading font-black text-slate-900 dark:text-white block">
                    Total Amount Due:
                  </span>
                  <span className="text-xs text-slate-500 font-sans">
                    All taxes and logistics included
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-mono font-black text-orange-600 dark:text-orange-400">
                  {formatINR(order.pricing?.grandTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Customer Profile, Address, Logistics (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Customer Contact Profile */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span>Customer Profile</span>
              </span>
              <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                Verified
              </span>
            </div>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center font-heading font-black text-base shrink-0">
                {(order.shippingAddress?.fullName || order.user?.name || "C")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate font-sans">
                  {order.shippingAddress?.fullName || order.user?.name || "Customer"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                  Account ID: {order.user?._id?.slice(-8) || "N/A"}
                </p>
              </div>
            </div>

            <div className="pt-3 space-y-2.5 text-xs font-sans">
              {order.user?.email && (
                <a
                  href={`mailto:${order.user.email}`}
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-orange-600 transition-colors truncate font-medium"
                >
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{order.user.email}</span>
                </a>
              )}
              {(order.shippingAddress?.phone || order.user?.phone) && (
                <a
                  href={`tel:${order.shippingAddress?.phone || order.user?.phone}`}
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-orange-600 transition-colors font-medium"
                >
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{order.shippingAddress?.phone || order.user?.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Card 2: Shipping Destination Address */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Shipping Destination</span>
              </span>
              <button
                type="button"
                onClick={copyAddressText}
                className="text-xs font-sans font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs font-sans text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">
                {order.shippingAddress?.fullName}
              </p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p className="font-medium text-slate-900 dark:text-white">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                <span className="font-mono">{order.shippingAddress?.postalCode || order.shippingAddress?.pincode}</span>
              </p>
              <p className="text-slate-500 text-xs">
                {order.shippingAddress?.country || "India"}
              </p>
            </div>
          </div>

          {/* Card 3: Logistics & Live Tracking */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-orange-500" />
                <span>Logistics Tracking</span>
              </span>
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(true)}
                className="text-xs font-sans font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
              >
                {order.trackingInfo?.trackingNumber ? "Edit AWB" : "+ Add AWB"}
              </button>
            </div>

            {order.trackingInfo?.trackingNumber ? (
              <div className="space-y-2.5 text-xs font-sans">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">Courier Partner</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {order.trackingInfo.courierPartner}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">AWB Tracking #</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {order.trackingInfo.trackingNumber}
                    </span>
                    {order.trackingInfo.trackingUrl && (
                      <a
                        href={order.trackingInfo.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-0.5 text-xs font-medium"
                        title="Live tracking link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {order.trackingInfo.estimatedDelivery && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs block">Est. Delivery</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {new Date(order.trackingInfo.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-2">
                  No tracking information assigned yet.
                </p>
                <button
                  type="button"
                  onClick={() => setIsTrackingModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-sans font-semibold bg-orange-500 text-white shadow-xs hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  Assign Courier Partner
                </button>
              </div>
            )}
          </div>

          {/* Card 4: Cancellation Danger Zone */}
          {order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED" && (
            <div className="p-5 rounded-3xl bg-rose-500/5 border border-rose-500/30 text-xs font-sans space-y-2">
              <span className="text-xs uppercase font-bold text-rose-600 dark:text-rose-400 block tracking-wider">
                Order Cancellation Management
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-sans">
                Cancelling will automatically restock reserved electronics items into warehouse inventory.
              </p>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full py-2.5 rounded-xl font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
              >
                Cancel This Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Courier Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        order={order}
        onSubmit={handleTrackingSubmit}
        isSubmitting={updateTrackingMutation.isPending}
      />

      {/* Cancel Order Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Cancel Order #{order.orderNumber}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Are you sure you want to cancel this order?
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Cancellation
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer requested cancellation / Address unreachable"
                className="w-full p-3 text-xs font-sans rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-sans font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelOrderMutation.isPending}
                onClick={handleCancelOrder}
                className="px-5 py-2 text-xs font-sans font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelOrderMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
