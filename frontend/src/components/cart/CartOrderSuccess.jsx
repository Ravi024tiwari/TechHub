import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useDownloadInvoiceMutation } from "@/hooks/useOrders";
import {
  CheckCircle2,
  Package,
  Truck,
  Calendar,
  Copy,
  Check,
  Clock,
  CreditCard,
  Banknote,
  MapPin,
  Phone,
  Mail,
  Printer,
  ShieldCheck,
  Sparkles,
  Download,
  Loader2,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

/**
 * Production-Grade Order Confirmation & Greeting Page:
 * - Personalized customer greeting with dynamic name & welcome celebration
 * - Industrial-grade 4-step fulfillment status pipeline
 * - Real-time bento metrics (Order ID, Payment Method, Delivery Window, Total)
 * - Complete purchased hardware snapshot with specs chips & images
 * - Delivery destination & transparent financial receipt breakdown
 * - 1-Click Order ID copy, PDF invoice download, print receipt, & live tracking
 * - 100% responsive, dark/light mode unified TechHub design system
 */
export default function CartOrderSuccess({
  selectedAddress,
  placedOrderDetails,
}) {
  const { user } = useAuthStore();
  const downloadInvoiceMutation = useDownloadInvoiceMutation();

  const [copied, setCopied] = useState(false);
  const [downloadToast, setDownloadToast] = useState("");

  // Extract order identification
  const orderId =
    placedOrderDetails?._id ||
    placedOrderDetails?.orderId ||
    placedOrderDetails?.id;

  const rawOrderNumber =
    placedOrderDetails?.orderNumber ||
    (orderId ? `ORD-${String(orderId).slice(-8).toUpperCase()}` : "ORD-TECHHUB");

  const orderDisplayId = rawOrderNumber.startsWith("#")
    ? rawOrderNumber
    : `#${rawOrderNumber}`;

  // Extract customer information for personalized greeting
  const customerName =
    placedOrderDetails?.shippingAddress?.fullName ||
    selectedAddress?.fullName ||
    user?.fullName ||
    "Valued Customer";

  const firstName = customerName.trim().split(" ")[0] || "Customer";
  const customerEmail =
    user?.email || placedOrderDetails?.shippingAddress?.email || selectedAddress?.email || "";
  const customerPhone =
    placedOrderDetails?.shippingAddress?.phone ||
    selectedAddress?.phone ||
    user?.phone ||
    "";

  // Shipping destination resolution
  const resolvedAddress = placedOrderDetails?.shippingAddress || selectedAddress;

  // Purchased items resolution
  const orderItems = placedOrderDetails?.orderItems || [];
  const totalItemCount = orderItems.reduce(
    (acc, item) => acc + (Number(item?.quantity) || 1),
    0
  );

  // Financial resolution
  const pricing = placedOrderDetails?.pricing || {};
  const itemsTotal =
    pricing?.itemsTotal ||
    placedOrderDetails?.totalPrice ||
    orderItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);
  const shippingFee = pricing?.shippingFee ?? 0;
  const taxAmount = pricing?.taxAmount ?? 0;
  const discountAmount =
    pricing?.discountAmount || placedOrderDetails?.coupon?.discountAmount || 0;
  const grandTotal =
    pricing?.grandTotal ||
    placedOrderDetails?.totalAmount ||
    Math.max(0, itemsTotal + shippingFee + taxAmount - discountAmount);

  // Payment method & status resolution
  const paymentInfo = placedOrderDetails?.paymentInfo || {};
  const isCod =
    paymentInfo?.method === "COD" ||
    placedOrderDetails?.paymentMethod === "COD";
  const isPaid =
    paymentInfo?.status === "PAID" ||
    placedOrderDetails?.isPaid ||
    (!isCod && Boolean(paymentInfo?.razorpayPaymentId));

  // Date and Delivery Calculations
  const orderDate = placedOrderDetails?.createdAt
    ? new Date(placedOrderDetails.createdAt)
    : new Date();

  const formattedOrderDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(orderDate);

  // Calculate dynamic 3-5 business days delivery window
  const getDeliveryWindow = (baseDate) => {
    const start = new Date(baseDate);
    start.setDate(start.getDate() + 3);
    const end = new Date(baseDate);
    end.setDate(end.getDate() + 5);

    const fmt = (d) =>
      new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(d);

    return `${fmt(start)} – ${fmt(end)}`;
  };
  const deliveryWindowStr = getDeliveryWindow(orderDate);

  // Currency Formatter
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // 1-Click Copy Order ID Handler
  const handleCopyOrderId = () => {
    const textToCopy = rawOrderNumber.replace(/^#/, "");
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // PDF Invoice Download Handler
  const handleDownloadInvoice = async () => {
    if (!orderId) {
      window.print();
      return;
    }
    try {
      setDownloadToast("Preparing PDF tax invoice...");
      await downloadInvoiceMutation.mutateAsync({
        orderId: String(orderId),
        orderNumber: rawOrderNumber,
      });
      setDownloadToast("Tax invoice downloaded successfully!");
      setTimeout(() => setDownloadToast(""), 3500);
    } catch (err) {
      setDownloadToast("Direct PDF download unavailable. Triggering print receipt.");
      setTimeout(() => {
        setDownloadToast("");
        window.print();
      }, 1200);
    }
  };

  return (
    <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 animate-in fade-in zoom-in-95 duration-300">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl text-xs font-mono font-medium animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="h-4 w-4 text-orange-500 animate-spin" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* =====================================================================
          1. HERO CELEBRATION & PERSONALIZED GREETING BANNER
      ====================================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 p-6 sm:p-10 lg:p-12 shadow-xl mb-8">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Animated Glowing Success Badge */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-pulse" />
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 stroke-[2.5]" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="h-3.5 w-3.5 fill-white" />
            </div>
          </div>

          {/* Sub-badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Order Placed & Confirmed</span>
          </div>

          {/* Warm Personalized Customer Greeting */}
          <h1 className="font-heading font-black text-2xl sm:text-4xl text-slate-900 dark:text-white mb-3 tracking-tight">
            Thank You, <span className="text-orange-500">{firstName}</span>!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-sans leading-relaxed mb-6">
            We’ve received your order and our hardware engineers are already preparing your equipment for precision quality inspection and express courier dispatch.
          </p>

          {/* Email Confirmation Notice Pill */}
          {customerEmail && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 font-sans">
              <Mail className="h-4 w-4 text-orange-500 shrink-0" />
              <span>
                Order confirmation and itemized tax invoice dispatched to{" "}
                <strong className="text-slate-900 dark:text-white font-mono font-semibold">
                  {customerEmail}
                </strong>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          2. ORDER KEY METRICS (4-COLUMN BENTO GRID)
      ====================================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Metric 1: Order ID with Instant Copy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Order Reference
            </span>
            <Package className="h-4 w-4 text-orange-500" />
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="font-mono font-bold text-base text-slate-900 dark:text-white truncate">
              {orderDisplayId}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              title="Copy Order Reference"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-colors shrink-0 flex items-center gap-1 text-[11px] font-mono"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-2">
            Placed on {formattedOrderDate}
          </span>
        </div>

        {/* Metric 2: Estimated Delivery Window */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Estimated Delivery
            </span>
            <Truck className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <div className="font-heading font-bold text-base text-slate-900 dark:text-white">
              {deliveryWindowStr}
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Insured Priority Courier</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-2">
            3 – 5 Business Days
          </span>
        </div>

        {/* Metric 3: Payment Method & Verification Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Payment Method
            </span>
            {isCod ? (
              <Banknote className="h-4 w-4 text-amber-500" />
            ) : (
              <CreditCard className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div>
            <div className="font-heading font-bold text-base text-slate-900 dark:text-white">
              {isCod ? "Cash on Delivery" : "Razorpay Online"}
            </div>
            <div className="mt-1">
              {isPaid ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
                  <Check className="h-3 w-3" /> Paid & Settled
                </span>
              ) : isCod ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
                  <Clock className="h-3 w-3" /> Pay Upon Delivery
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold uppercase">
                  Verified
                </span>
              )}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-2">
            {paymentInfo?.razorpayPaymentId
              ? `Txn: ${paymentInfo.razorpayPaymentId.slice(-10)}`
              : "Zero advance fee collected"}
          </span>
        </div>

        {/* Metric 4: Grand Total Paid */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Total Amount
            </span>
            <Sparkles className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <div className="font-heading font-black text-2xl text-slate-900 dark:text-white">
              {formatINR(grandTotal)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
              {totalItemCount > 0
                ? `${totalItemCount} item${totalItemCount > 1 ? "s" : ""} included`
                : "All taxes & fees included"}
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans font-medium mt-2">
            Tax invoice generated
          </span>
        </div>
      </section>

      {/* =====================================================================
          3. INDUSTRIAL FULFILLMENT TIMELINE STEPPER
      ====================================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100 dark:border-white/[0.06] mb-6">
          <div>
            <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Order Fulfillment Pipeline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Track the step-by-step progress of your hardware order from warehouse to your door.
            </p>
          </div>
          <Link
            to={orderId ? `/orders/${orderId}` : "/orders"}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            <span>Live Telemetry</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4-Step Visual Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
          {/* Step 1: Placed (Complete) */}
          <div className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-2">
            <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/30 shrink-0">
              <Check className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                1. Order Confirmed
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans block">
                Order details & address verified
              </span>
            </div>
          </div>

          {/* Step 2: Quality & Packaging (Current Active) */}
          <div className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-2">
            <div className="relative h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-orange-500/30 shrink-0">
              <span className="absolute inset-0 rounded-full bg-orange-500/30 animate-ping" />
              <Package className="h-5 w-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs sm:text-sm text-orange-500 dark:text-orange-400 block">
                2. Processing & Testing
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans block">
                Hardware inspection & packaging
              </span>
            </div>
          </div>

          {/* Step 3: Courier Dispatch (Upcoming) */}
          <div className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-2 opacity-60">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 dark:border-white/10">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-300 block">
                3. Dispatched
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans block">
                Assigned to express air courier
              </span>
            </div>
          </div>

          {/* Step 4: Doorstep Delivery (Upcoming) */}
          <div className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-2 opacity-60">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 dark:border-white/10">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-300 block">
                4. Delivered
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans block">
                Estimated {deliveryWindowStr}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. TWO-COLUMN BLUEPRINT: ITEMS SNAPSHOT & FINANCIAL BREAKDOWN
      ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Column (7/12 cols): Purchased Hardware Items */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Items Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-orange-500" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Purchased Equipment ({orderItems.length || totalItemCount || 1})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Sealed Box Snapshots
              </span>
            </div>

            {orderItems.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {orderItems.map((item, idx) => (
                  <div
                    key={item?._id || item?.product || idx}
                    className="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
                  >
                    {/* Item Thumbnail */}
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                      {item?.image ? (
                        <img
                          src={item.image}
                          alt={item?.title || "Product"}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <Package className="h-8 w-8 text-slate-400" />
                      )}
                    </div>

                    {/* Item Information */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white truncate">
                        {item?.title || "High-Performance Electronics Component"}
                      </h4>

                      {/* Specs Tags (Color, RAM, Storage) */}
                      {item?.selectedSpecs && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {item.selectedSpecs.color && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                              {item.selectedSpecs.color}
                            </span>
                          )}
                          {item.selectedSpecs.storage && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                              {item.selectedSpecs.storage}
                            </span>
                          )}
                          {item.selectedSpecs.ram && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                              {item.selectedSpecs.ram} RAM
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          Qty: <strong className="text-slate-900 dark:text-white">{item?.quantity || 1}</strong>
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="font-mono text-slate-600 dark:text-slate-300">
                          {formatINR(item?.price || 0)} each
                        </span>
                      </div>
                    </div>

                    {/* Total Item Price */}
                    <div className="text-right shrink-0">
                      <span className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {formatINR((item?.price || 0) * (item?.quantity || 1))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs font-sans">
                <Package className="h-8 w-8 mx-auto text-orange-500/50 mb-2" />
                <span>Your items have been cataloged and attached to order record {orderDisplayId}.</span>
              </div>
            )}
          </div>

          {/* TechHub Enterprise Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 text-left">
              <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h5 className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                100% Genuine Tech
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Brand-sealed hardware with manufacturer warranty coverage.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 text-left">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                <RotateCcw className="h-4 w-4" />
              </div>
              <h5 className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                7-Day Replacement
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Hassle-free replacement policy for transit or defect issues.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 text-left">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                <Sparkles className="h-4 w-4" />
              </div>
              <h5 className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                Priority Support
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Need address updates? Reach out within 60 mins of order placement.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5/12 cols): Delivery Destination & Financial Receipt */}
        <div className="lg:col-span-5 space-y-6">
          {/* Delivery Destination Card */}
          {resolvedAddress && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/[0.06] mb-3">
                <MapPin className="h-4 w-4 text-orange-500" />
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Delivery Destination
                </h3>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-slate-900 dark:text-white text-sm">
                    {resolvedAddress.fullName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                    Primary Address
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                  {resolvedAddress.street}, {resolvedAddress.city}, {resolvedAddress.state}
                </p>

                <div className="pt-1 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Postal PIN:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {resolvedAddress.pincode}
                  </strong>
                </div>

                {customerPhone && (
                  <div className="pt-1 flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>+91 {customerPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Itemized Financial Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              Payment Summary
            </h3>

            <div className="space-y-2.5 text-xs divide-y divide-slate-100 dark:divide-white/[0.06]">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1 font-sans">
                <span>Items Subtotal</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatINR(itemsTotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-2.5 font-sans font-medium">
                  <span className="flex items-center gap-1.5">
                    <span>Discount Savings</span>
                    {placedOrderDetails?.coupon?.code && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[10px] font-mono font-bold">
                        {placedOrderDetails.coupon.code}
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-bold">
                    -{formatINR(discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2.5 font-sans">
                <span>Shipping & Express Handling</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {shippingFee === 0 ? "FREE" : formatINR(shippingFee)}
                </span>
              </div>

              {taxAmount > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2.5 font-sans">
                  <span>Applicable GST / Taxes</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatINR(taxAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-3 text-sm">
                <div>
                  <span className="font-heading font-bold text-slate-900 dark:text-white block">
                    Grand Total
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Inclusive of all taxes
                  </span>
                </div>
                <span className="font-heading font-black text-xl text-orange-500 dark:text-orange-400 font-mono">
                  {formatINR(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Center Buttons */}
          <div className="no-print space-y-3 pt-2">
            <Link
              to={orderId ? `/orders/${orderId}` : "/orders"}
              className="w-full py-3.5 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all text-center flex items-center justify-center gap-2"
            >
              <Package className="h-4 w-4" />
              <span>Track Live Order Status</span>
              <ChevronRight className="h-4 w-4" />
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={downloadInvoiceMutation.isPending}
                className="w-full py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white font-heading font-bold text-xs tracking-wider border border-slate-200/80 dark:border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                {downloadInvoiceMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                ) : (
                  <Download className="h-4 w-4 text-orange-500" />
                )}
                <span>Invoice (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white font-heading font-bold text-xs tracking-wider border border-slate-200/80 dark:border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4 text-slate-500" />
                <span>Print Receipt</span>
              </button>
            </div>

            <Link
              to="/products"
              className="w-full py-3 px-6 rounded-2xl bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-heading font-bold text-xs uppercase tracking-wider border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all text-center block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
