import React, { useState, useMemo } from "react";
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
  Eye,
  Navigation,
  XCircle,
  RotateCcw,
  Star,
  Check,
  Sparkles,
} from "lucide-react";
import OrderReviewModal from "@/components/orders/OrderReviewModal";
import OrderReturnModal from "@/components/orders/OrderReturnModal";

export default function Orders() {
  const { isAuthenticated } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [reviewInitialRating, setReviewInitialRating] = useState(5);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useMyOrdersQuery(statusFilter !== "all" ? { status: statusFilter } : {});

  // Identify any delivered items pending review across customer's orders
  const pendingReviewItems = useMemo(() => {
    const list = [];
    orders.forEach((order) => {
      if (order.orderStatus?.toUpperCase() === "DELIVERED") {
        (order.orderItems || []).forEach((item) => {
          if (!item.userReview) {
            list.push({ item, order });
          }
        });
      }
    });
    return list;
  }, [orders]);

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

  // Status badges strictly aligned with the Admin Palette
  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 ring-1 ring-indigo-500/20">
            <Truck className="w-3.5 h-3.5 text-indigo-500" />
            <span>{status === "OUT_FOR_DELIVERY" ? "Out for Delivery" : "In Transit"}</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 ring-1 ring-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      case "RETURNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 ring-1 ring-amber-500/20">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Returned</span>
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30 ring-1 ring-sky-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30 ring-1 ring-sky-500/20">
            <Package className="w-3.5 h-3.5" />
            <span>Processing</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 ring-1 ring-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Placed</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb Navigation matching Admin styling */}
        <nav className="flex items-center gap-2 text-xs font-sans text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-medium">Orders & Shipments</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-sans font-semibold mb-2">
              <Package className="w-3.5 h-3.5" />
              <span>Verified Purchases & Tracking</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
              My Orders & Purchases
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Track express delivery, manage returns & replacements, rate products, and download tax invoices.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all w-fit"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Not Authenticated State */}
        {!isAuthenticated ? (
          <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 shadow-lg">
            <Package className="w-12 h-12 mx-auto text-orange-500 mb-4" />
            <h2 className="font-heading font-black text-lg mb-2 text-slate-900 dark:text-white">
              Please Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-sans">
              Sign in with your account to view your purchase history and live shipment tracking.
            </p>
            <Link
              to="/login?redirect=/orders"
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 transition-all inline-block"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-3" />
            <p className="text-xs text-slate-400 font-sans">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/20 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mb-2">
              No Orders Placed Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 font-sans leading-relaxed">
              When you purchase electronics on TechHub, your real-time air dispatch and courier tracking will appear right here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-sans font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 transition-all"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {/* Pending Review Callout Banner */}
            {pendingReviewItems.length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-heading font-extrabold text-slate-900 dark:text-white">
                      You have {pendingReviewItems.length} delivered {pendingReviewItems.length === 1 ? "item" : "items"} awaiting your review!
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      Share your rating and feedback to help other shoppers make informed decisions.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const first = pendingReviewItems[0];
                    setSelectedReviewItem(first.item);
                    setReviewInitialRating(5);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-xs shadow-orange-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Rate Delivered Item</span>
                </button>
              </div>
            )}

            {orders.map((order) => {
              const shipping = order.shippingAddress || {};
              const pricing = order.pricing || {};
              const payment = order.payment || {};

              return (
                <div
                  key={order._id}
                  className="relative rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all overflow-hidden"
                >
                  {/* Subtle Ambient Glow */}
                  <div className="absolute -top-12 -right-12 w-56 h-56 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                  {/* Order Top Meta Bar */}
                  <div className="relative z-10 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {/* Meta Info Row */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 w-full sm:w-auto">
                      <div>
                        <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
                          Order Number
                        </span>
                        <Link
                          to={`/orders/${order.orderNumber || order._id}`}
                          className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        >
                          #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                        </Link>
                      </div>

                      <div className="h-7 w-px bg-slate-200 dark:bg-white/10" />

                      <div>
                        <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
                          Date Placed
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-sans font-medium text-xs">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="h-7 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

                      <div className="px-2.5 py-1 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/30 shrink-0">
                        <span className="text-[9px] font-sans font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider block">
                          Total Amount
                        </span>
                        <span className="font-mono font-black text-orange-600 dark:text-orange-400 text-xs sm:text-sm tracking-tight">
                          {formatINR(pricing.grandTotal || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Order Action Row */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-200/70 dark:border-white/10">
                      {getStatusBadge(order.orderStatus)}
                      <Link
                        to={`/orders/${order.orderNumber || order._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-sans font-semibold bg-white dark:bg-white/10 border border-slate-300 dark:border-white/25 text-slate-800 dark:text-white hover:border-orange-500 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 shadow-xs transition-all cursor-pointer"
                      >
                        <span>Order Details</span>
                        <ChevronRight className="w-3.5 h-3.5 text-orange-500" />
                      </Link>
                    </div>
                  </div>

                  {/* Order Body: Items & Shipping Destination */}
                  <div className="relative z-10 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                    {/* Items Column (8 cols) */}
                    <div className="lg:col-span-8 space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-orange-500" />
                          <span>Purchased Items ({order.orderItems?.length || 0})</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                          Tap product to inspect details
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {order.orderItems?.map((item, idx) => {
                          // Product details redirection target
                          const productSlugOrId =
                            item.product?.slug ||
                            (typeof item.product === "object" ? item.product?._id : item.product);
                          const productUrl = productSlugOrId ? `/product/${productSlugOrId}` : "#";

                          const isDelivered = order.orderStatus?.toUpperCase() === "DELIVERED";
                          const deliveryDate = new Date(order.trackingInfo?.deliveredAt || order.updatedAt || Date.now());
                          const diffDays = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
                          const isReturnEligible = diffDays <= 7;
                          const hasReturn = !!item.returnRequest;
                          const showReturnOption = isDelivered && (hasReturn || isReturnEligible);

                          return (
                            <div
                              key={item._id || item.product?._id || idx}
                              className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0c0f17] hover:bg-slate-50/80 dark:hover:bg-white/[0.02] border border-slate-300 dark:border-white/20 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all gap-3.5"
                            >
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                {/* Clickable Product Thumbnail Link */}
                                <Link
                                  to={productUrl}
                                  title={`View details for ${item.title}`}
                                  className="relative w-16 h-16 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/20 group-hover:border-orange-500 p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs transition-colors"
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <Package className="w-6 h-6 text-slate-400" />
                                  )}
                                  <span className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye className="w-3.5 h-3.5 text-white" />
                                  </span>
                                </Link>

                                {/* Clickable Product Title & Meta */}
                                <div className="min-w-0 flex-1">
                                  <Link
                                    to={productUrl}
                                    title="Open product details page"
                                    className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-1 block"
                                  >
                                    {item.title}
                                  </Link>

                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                                    <span className="font-mono text-orange-600 dark:text-orange-400 font-bold">
                                      Qty: {item.quantity}
                                    </span>
                                    {item.selectedSpecs?.color && (
                                      <span>• Color: {item.selectedSpecs.color}</span>
                                    )}
                                    <span>•</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                      {formatINR(item.price)} each
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Area: Customer-Friendly Responsive 2-Col Grid on Mobile, Inline on Desktop */}
                              {isDelivered ? (
                                <div
                                  className={`w-full sm:w-auto ${
                                    showReturnOption ? "grid grid-cols-2" : "flex"
                                  } sm:flex sm:items-center gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5 shrink-0`}
                                >
                                  {/* Review Action */}
                                  {item.userReview ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedReviewItem(item);
                                        setReviewInitialRating(item.userReview.rating);
                                      }}
                                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer active:scale-95"
                                      title="You have reviewed this product. Click to view or edit."
                                    >
                                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      <span className="truncate">Reviewed ({item.userReview.rating}★)</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedReviewItem(item);
                                        setReviewInitialRating(5);
                                      }}
                                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-xs shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
                                      title="Rate and write an authentic review for this delivered product"
                                    >
                                      <Star className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                                      <span className="truncate">Rate & Review</span>
                                    </button>
                                  )}

                                  {/* Return & Replacement Status or Action */}
                                  {hasReturn ? (
                                    <div className="w-full sm:w-auto">
                                      {item.returnRequest.status === "REQUESTED" && (
                                        <span
                                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] sm:text-xs font-sans font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-center"
                                          title={`RMA #${item.returnRequest.returnNumber} is under quality review`}
                                        >
                                          <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                                          <span className="truncate">
                                            {item.returnRequest.requestType === "REPLACEMENT" ? "Replacement" : "Return"} Requested
                                          </span>
                                        </span>
                                      )}

                                      {item.returnRequest.status === "APPROVED" && (
                                        <span
                                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] sm:text-xs font-sans font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30 text-center"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                          <span className="truncate">Pickup Scheduled</span>
                                        </span>
                                      )}

                                      {item.returnRequest.status === "ITEM_RECEIVED" && (
                                        <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] sm:text-xs font-sans font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 text-center">
                                          <Package className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                          <span className="truncate">At Warehouse</span>
                                        </span>
                                      )}

                                      {item.returnRequest.status === "REFUND_PROCESSED" && (
                                        <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] sm:text-xs font-sans font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-center">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                          <span className="truncate">
                                            Refunded: {formatINR(item.returnRequest.refundDetails?.amount || (item.price * item.quantity))}
                                          </span>
                                        </span>
                                      )}

                                      {item.returnRequest.status === "REPLACEMENT_DISPATCHED" && (
                                        <span
                                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] sm:text-xs font-sans font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-center"
                                          title={`Tracking: ${item.returnRequest.replacementDetails?.trackingNumber || "N/A"}`}
                                        >
                                          <Truck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                          <span className="truncate">Replacement Shipped</span>
                                        </span>
                                      )}

                                      {item.returnRequest.status === "REJECTED" && (
                                        <span
                                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] sm:text-xs font-sans font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-center"
                                          title={item.returnRequest.rejectionReason || "Return rejected"}
                                        >
                                          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                          <span className="truncate">Return Rejected</span>
                                        </span>
                                      )}
                                    </div>
                                  ) : isReturnEligible ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedReturnOrder(order);
                                        setSelectedReturnItem(item);
                                      }}
                                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-sans font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 transition-colors cursor-pointer active:scale-95"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span className="truncate">Return / Replace</span>
                                    </button>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="w-full sm:w-auto flex items-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5 shrink-0">
                                  <Link
                                    to={`/orders/${order.orderNumber || order._id}`}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold bg-slate-100 dark:bg-white/10 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 text-slate-700 dark:text-slate-200 transition-colors"
                                  >
                                    <span>Track Shipment</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping Address & Payment Column (4 cols) */}
                    <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-300 dark:border-white/20 space-y-4 text-xs">
                      <div>
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" />
                          <span>Delivery Destination:</span>
                        </span>
                        <p className="font-heading font-black text-sm text-slate-900 dark:text-white">
                          {shipping.fullName}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 leading-relaxed font-sans">
                          {shipping.street}{shipping.landmark ? `, ${shipping.landmark}` : ""}, {shipping.city}, {shipping.state} - <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{shipping.pincode}</span>
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 font-mono text-xs mt-1.5">
                          Phone: +91 {shipping.phone}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-white/10">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                          Payment Gateway:
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          {payment.method === "COD" ? (
                            <Banknote className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <CreditCard className="w-4 h-4 text-orange-500" />
                          )}
                          <span>
                            {payment.method === "COD"
                              ? "Cash on Delivery"
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

      {/* Verified Product Review Modal */}
      <OrderReviewModal
        isOpen={Boolean(selectedReviewItem)}
        onClose={() => setSelectedReviewItem(null)}
        item={selectedReviewItem}
        initialRating={reviewInitialRating}
        onSuccess={() => {
          showToast("Review published successfully! Thank you for your feedback.");
          refetch();
        }}
      />

      {/* Hardware Return & Replacement Request Modal */}
      <OrderReturnModal
        isOpen={Boolean(selectedReturnItem)}
        onClose={() => {
          setSelectedReturnItem(null);
          setSelectedReturnOrder(null);
        }}
        order={selectedReturnOrder}
        item={selectedReturnItem}
        onSuccess={() => {
          showToast("Return application submitted to concierge successfully!");
          refetch();
        }}
      />

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xl border border-slate-700 dark:border-white/20 text-xs font-sans font-semibold animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
