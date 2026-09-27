import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  useOrderDetailQuery,
  useDownloadInvoiceMutation,
} from "@/hooks/useOrders";
import { useAuthStore } from "@/store/useAuthStore";
import OrderTrackingStepper from "@/components/orders/OrderTrackingStepper";
import OrderItemsCard from "@/components/orders/OrderItemsCard";
import OrderFinancialCard from "@/components/orders/OrderFinancialCard";
import OrderDeliveryAddressCard from "@/components/orders/OrderDeliveryAddressCard";
import OrderCancelModal from "@/components/orders/OrderCancelModal";
import OrderReviewModal from "@/components/orders/OrderReviewModal";
import OrderReturnModal from "@/components/orders/OrderReturnModal";
import {
  ArrowLeft,
  ChevronRight,
  Package,
  Printer,
  FileText,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  Truck,
  Clock,
  Navigation,
  XCircle,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  Star,
} from "lucide-react";

export default function CustomerOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [copiedOrderNum, setCopiedOrderNum] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Fetch live order details query
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrderDetailQuery(orderId);

  // Mutation for downloading PDF tax invoice
  const downloadInvoiceMutation = useDownloadInvoiceMutation();

  const handleCopyOrderNumber = () => {
    const num = order?.orderNumber || order?._id;
    if (!num) return;
    navigator.clipboard?.writeText(num);
    setCopiedOrderNum(true);
    setTimeout(() => setCopiedOrderNum(false), 2000);
  };

  const handleDownloadInvoice = async () => {
    if (!order?._id) return;
    try {
      await downloadInvoiceMutation.mutateAsync({
        orderId: order._id,
        orderNumber: order.orderNumber || "RECEIPT",
      });
      showToast("Tax Invoice downloaded successfully");
    } catch (err) {
      showToast("Unable to download invoice. Please try again.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge styling identical to AdminOrderDetail.jsx
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

  const isCancellable =
    order && ["PLACED", "CONFIRMED"].includes(order.orderStatus);
  const isDelivered = order?.orderStatus?.toUpperCase() === "DELIVERED";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Navigation matching Admin aesthetics */}
        <nav className="flex items-center gap-2 text-xs font-sans text-slate-500 dark:text-slate-400 mb-6 print:hidden">
          <Link
            to="/"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            to="/orders"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Orders
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-mono font-bold truncate max-w-[200px] sm:max-w-none">
            #{order?.orderNumber || orderId}
          </span>
        </nav>

        {/* Back Link */}
        <div className="mb-6 print:hidden">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-xs font-sans font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>
        </div>

        {/* Unauthenticated View */}
        {!isAuthenticated ? (
          <div className="py-20 text-center max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 shadow-lg">
            <Package className="w-12 h-12 mx-auto text-orange-500 mb-4" />
            <h2 className="font-heading font-black text-xl mb-2 text-slate-900 dark:text-white">
              Authentication Required
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-sans">
              Please sign in with your customer account to view order telemetry, track logistics & download tax invoices.
            </p>
            <Link
              to={`/login?redirect=/orders/${orderId}`}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 transition-all inline-block"
            >
              Sign In to View
            </Link>
          </div>
        ) : isLoading ? (
          /* Loading State Skeleton */
          <div className="space-y-6 py-12 animate-in fade-in duration-200">
            <div className="h-44 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="h-64 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 animate-pulse" />
                <div className="h-80 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 animate-pulse" />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="h-72 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 animate-pulse" />
                <div className="h-56 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 animate-pulse" />
              </div>
            </div>
          </div>
        ) : isError || !order ? (
          /* Error State */
          <div className="py-20 text-center max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 shadow-lg space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white">
              Order Not Found
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              {error?.response?.data?.message ||
                "We could not locate this order in your purchase records or you do not have permission to view it."}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-sans font-semibold transition-colors cursor-pointer"
              >
                Retry Query
              </button>
              <Link
                to="/orders"
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-sans font-semibold shadow-md shadow-orange-600/30 transition-colors"
              >
                Go to My Orders
              </Link>
            </div>
          </div>
        ) : (
          /* Master Order Detail View matching Admin Palette */
          <div className="space-y-6">
            {/* Delivery Completion & Verified Review Prompt Banner */}
            {isDelivered && (
              <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-amber-500/10 to-emerald-500/15 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                        Order Delivered Successfully!
                      </h3>
                      <span className="hidden min-[480px]:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        Verified Purchase
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-sans mt-0.5">
                      Your items have been delivered. Share your authentic owner review to help other verified buyers.
                    </p>
                  </div>
                </div>

                {order.orderItems?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedReviewItem(order.orderItems[0])}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/25 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                  >
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Rate & Review Products</span>
                  </button>
                )}
              </div>
            )}

            {/* Hero Header Card with Crisp Border & Ambient Glow */}
            <div className="relative p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all overflow-hidden space-y-5">
              <div className="absolute -top-14 -right-14 w-64 h-64 bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

              {/* Order Meta Bar */}
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-200 dark:border-white/10 pb-5">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
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
                      #{order.orderNumber || order._id}
                    </h1>
                    <button
                      type="button"
                      onClick={handleCopyOrderNumber}
                      title="Copy Order ID"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {copiedOrderNum ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Placed on {formatDate(order.createdAt)}
                    </span>
                  </p>
                </div>

                {/* Primary Action Buttons matching Admin Order Detail */}
                <div className="relative z-10 flex flex-wrap items-center gap-2.5 print:hidden">
                  {/* Print Slip */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-medium bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Slip</span>
                  </button>

                  {/* PDF Tax Invoice Download */}
                  <button
                    type="button"
                    onClick={handleDownloadInvoice}
                    disabled={downloadInvoiceMutation.isPending}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold bg-white dark:bg-white/10 border border-slate-300 dark:border-white/25 text-slate-800 dark:text-white hover:border-orange-500 hover:text-orange-600 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {downloadInvoiceMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5 text-orange-500" />
                        <span>Tax Invoice (PDF)</span>
                      </>
                    )}
                  </button>

                  {/* Cancel Order (Self-Service) */}
                  {isCancellable && (
                    <button
                      type="button"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Order Quick Highlights Strip */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Total Hardware
                  </span>
                  <span className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {order.orderItems?.length || 0} Line {order.orderItems?.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/30 shadow-xs">
                  <span className="text-[10px] font-sans font-black text-orange-700 dark:text-orange-300 uppercase tracking-wider block">
                    Total Settled Amount
                  </span>
                  <span className="font-mono font-black text-lg sm:text-2xl text-orange-600 dark:text-orange-400 tracking-tight block mt-0.5">
                    ₹{(order.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Payment Gateway
                  </span>
                  <span className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {order.paymentInfo?.method === "COD" ? "Cash on Delivery" : "Razorpay Online"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Destination City
                  </span>
                  <span className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm truncate block">
                    {order.shippingAddress?.city || "Direct Hub"}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content Grid: 8 Cols Left (Stepper + Items), 4 Cols Right (Financials + Address) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Fulfillment Lifecycle Stepper */}
                <OrderTrackingStepper order={order} />

                {/* 2. Purchased Hardware Items with Direct Detail Redirection */}
                <OrderItemsCard
                  order={order}
                  onOpenReviewModal={(item) => setSelectedReviewItem(item)}
                  onOpenReturnModal={(item) => setSelectedReturnItem(item)}
                />
              </div>

              {/* Right Column (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* 3. Financial & Invoice Ledger */}
                <OrderFinancialCard order={order} />

                {/* 4. Delivery Destination & Assurance */}
                <OrderDeliveryAddressCard order={order} />
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>

      {/* Customer Modals */}
      <OrderCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        order={order}
      />

      <OrderReviewModal
        isOpen={Boolean(selectedReviewItem)}
        onClose={() => setSelectedReviewItem(null)}
        item={selectedReviewItem}
        onSuccess={() => showToast("Review published successfully!")}
      />

      <OrderReturnModal
        isOpen={Boolean(selectedReturnItem)}
        onClose={() => setSelectedReturnItem(null)}
        order={order}
        item={selectedReturnItem}
        onSuccess={() => showToast("Return request submitted to concierge")}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xl border border-slate-800 dark:border-slate-200 text-xs font-sans font-bold animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
