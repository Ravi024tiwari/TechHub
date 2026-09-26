import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ShoppingBag,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  ExternalLink,
  MessageSquare,
  Lock,
  Unlock,
  Loader2,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
  Crown,
  Sparkles,
  TrendingUp,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Clock,
} from "lucide-react";
import { useAdminCustomerDetailQuery } from "../../../hooks/useAdminCustomers";

const formatINR = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function CustomerDetailModal({
  customer,
  onClose,
  onToggleBlock,
  isToggling = false,
}) {
  const { data, isLoading, isError, error } = useAdminCustomerDetailQuery(
    customer?._id
  );

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "orders" | "addresses"
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!customer) return null;

  const detailCustomer = data?.customer || customer;
  const metrics = data?.orderMetrics || {};
  const recentOrders = data?.recentOrders || [];
  const reviewsCount = data?.totalReviewsSubmitted || 0;

  const avatarUrl =
    typeof detailCustomer.avatar === "string"
      ? detailCustomer.avatar
      : detailCustomer.avatar?.url || "";
  const firstLetter =
    detailCustomer.name?.trim()?.charAt(0)?.toUpperCase() || "C";

  const copyId = () => {
    navigator.clipboard.writeText(detailCustomer._id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(detailCustomer.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Compute Industrial Customer Value Tier
  const totalSpent = metrics.lifetimeSpent || 0;
  const totalOrders = metrics.totalOrders || 0;
  const completedOrders = metrics.completedOrders || 0;
  const aov = completedOrders > 0 ? Math.round(totalSpent / completedOrders) : 0;
  const fulfillmentRate =
    totalOrders > 0
      ? Math.round(((metrics.deliveredOrders || 0) / totalOrders) * 100)
      : 100;

  const getTier = () => {
    if (totalSpent >= 100000 || totalOrders >= 6) {
      return {
        label: "VIP Platinum",
        color: "from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
        badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
        icon: Crown,
      };
    }
    if (totalSpent >= 40000 || totalOrders >= 3) {
      return {
        label: "Gold Tier",
        color: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        icon: Sparkles,
      };
    }
    if (totalSpent >= 10000 || totalOrders >= 1) {
      return {
        label: "Silver Tier",
        color: "from-sky-500/20 to-blue-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30",
        badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
        icon: TrendingUp,
      };
    }
    return {
      label: "Standard Member",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      icon: ShieldCheck,
    };
  };

  const tier = getTier();
  const TierIcon = tier.icon;

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30";
      case "PROCESSING":
      case "CONFIRMED":
        return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop with smooth blur */}
      <div
        className="fixed inset-0 bg-slate-950/70 dark:bg-black/85 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Main Dossier Window */}
      <div className="relative w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] bg-white dark:bg-[#0c0f17] rounded-3xl border border-slate-300 dark:border-white/30 shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header Section: Identity, VIP Tier, Account State & Actions */}
        <div className="relative z-10 p-5 sm:p-7 border-b border-slate-200 dark:border-white/10 bg-gradient-to-b from-slate-50/70 via-white to-white dark:from-[#111522] dark:via-[#0c0f17] dark:to-[#0c0f17]">
          {/* Top Bar: Label & Close */}
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-200/70 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Customer Dossier & Intelligence
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Close modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Profile Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar or First Letter Badge */}
              <div className="relative shrink-0">
                {avatarUrl && !imgError ? (
                  <img
                    src={avatarUrl}
                    alt={detailCustomer.name}
                    onError={() => setImgError(true)}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-300 dark:border-white/30 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-orange-500/25 via-amber-500/20 to-orange-500/10 text-orange-600 dark:text-orange-400 font-heading font-black text-2xl flex items-center justify-center border-2 border-orange-500/40 shadow-md select-none">
                    {firstLetter}
                  </div>
                )}
                {/* Status Dot Ring */}
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#0c0f17] ${
                    detailCustomer.isBlocked ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  title={
                    detailCustomer.isBlocked
                      ? "Account is Suspended"
                      : "Account is Active"
                  }
                />
              </div>

              {/* Identity Details */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading font-black text-lg sm:text-2xl text-slate-900 dark:text-white tracking-tight truncate">
                    {detailCustomer.name}
                  </h2>

                  {/* VIP Tier Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold border ${tier.badge}`}
                  >
                    <TierIcon className="w-3 h-3" />
                    <span>{tier.label}</span>
                  </span>

                  {/* Account Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold border ${
                      detailCustomer.isBlocked
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {detailCustomer.isBlocked ? "Suspended" : "Active"}
                  </span>
                </div>

                {/* Subtitle Channels & ID */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1 text-xs font-sans text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <strong className="text-slate-700 dark:text-slate-200 font-medium">
                      {detailCustomer.email}
                    </strong>
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="p-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      title="Copy email"
                    >
                      {copiedEmail ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </span>

                  {detailCustomer.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{detailCustomer.phone}</span>
                    </span>
                  )}

                  <span className="flex items-center gap-1 text-[11px] font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                    ID: {detailCustomer._id?.slice(-8)}
                    <button
                      type="button"
                      onClick={copyId}
                      className="p-0.5 hover:text-orange-500 transition-colors cursor-pointer"
                      title="Copy full Customer ID"
                    >
                      {copiedId ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button: Suspend / Reactivate */}
            <div className="self-start sm:self-center shrink-0">
              <button
                type="button"
                disabled={isToggling}
                onClick={() =>
                  onToggleBlock(detailCustomer._id, !detailCustomer.isBlocked)
                }
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold border transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 ${
                  detailCustomer.isBlocked
                    ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-slate-100 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300"
                }`}
              >
                {isToggling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : detailCustomer.isBlocked ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span>
                  {detailCustomer.isBlocked ? "Reactivate Account" : "Suspend Account"}
                </span>
              </button>
            </div>
          </div>

          {/* 2. Interactive CRM Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-200/60 dark:border-white/10 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Executive Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Recent Orders ({recentOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("addresses")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "addresses"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Address Book ({detailCustomer.addresses?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* 3. Modal Body: Scrollable Tab Contents */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-9 h-9 text-orange-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-sans">
                Compiling 360° customer intelligence dossier...
              </p>
            </div>
          ) : isError ? (
            <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-sans">
                {error?.message || "Failed to load customer dossier details."}
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: EXECUTIVE OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Financial & LTV KPI Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Lifetime Spend Tile */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-sans uppercase font-bold tracking-wider">
                          Lifetime Value (LTV)
                        </span>
                        <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      <div className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                        {formatINR(totalSpent)}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 block">
                        Gross completed purchases
                      </span>
                    </div>

                    {/* Total Orders Tile */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-sans uppercase font-bold tracking-wider">
                          Total Orders
                        </span>
                        <ShoppingBag className="w-3.5 h-3.5 text-sky-500" />
                      </div>
                      <div className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                        {totalOrders}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 block">
                        {metrics.completedOrders || 0} completed orders
                      </span>
                    </div>

                    {/* Average Order Value (AOV) */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-sans uppercase font-bold tracking-wider">
                          Avg Order Value (AOV)
                        </span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                        {formatINR(aov)}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 block">
                        Per completed basket
                      </span>
                    </div>

                    {/* Fulfillment Success Rate */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-sans uppercase font-bold tracking-wider">
                          Delivery Rate
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="text-xl sm:text-2xl font-heading font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {fulfillmentRate}%
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 block">
                        {metrics.deliveredOrders || 0} orders delivered
                      </span>
                    </div>
                  </div>

                  {/* Order Status Breakdown Bar */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-orange-500" />
                      <span>Fulfillment Lifecycle Distribution</span>
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-sans">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <span className="text-[11px] text-slate-400 block">Delivered</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-heading font-bold">
                          {metrics.deliveredOrders || 0}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <span className="text-[11px] text-slate-400 block">In Transit</span>
                        <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-heading font-bold">
                          {metrics.inTransitOrders || 0}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <span className="text-[11px] text-slate-400 block">Processing</span>
                        <strong className="text-sky-600 dark:text-sky-400 text-sm font-heading font-bold">
                          {metrics.processingOrders || 0}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <span className="text-[11px] text-slate-400 block">Cancelled</span>
                        <strong className="text-rose-600 dark:text-rose-400 text-sm font-heading font-bold">
                          {metrics.cancelledOrders || 0}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Customer Timeline & Engagement Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Account Milestone Info */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2 text-xs font-sans">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        <span>Account Milestones</span>
                      </span>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                        <span className="text-slate-500 dark:text-slate-400">Registered Date:</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {new Date(detailCustomer.createdAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                        <span className="text-slate-500 dark:text-slate-400">Account Role:</span>
                        <strong className="text-slate-800 dark:text-slate-200 uppercase">
                          {detailCustomer.role || "Customer"}
                        </strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 dark:text-slate-400">Security Clearance:</span>
                        <strong
                          className={
                            detailCustomer.isBlocked
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {detailCustomer.isBlocked ? "Suspended (Tokens Revoked)" : "Clean (Active)"}
                        </strong>
                      </div>
                    </div>

                    {/* Engagement & Store Reviews */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2 text-xs font-sans">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                        <span>Engagement & Store Trust</span>
                      </span>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                        <span className="text-slate-500 dark:text-slate-400">Product Reviews Submitted:</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-mono">
                          {reviewsCount} reviews
                        </strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                        <span className="text-slate-500 dark:text-slate-400">Saved Addresses:</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-mono">
                          {detailCustomer.addresses?.length || 0} locations
                        </strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 dark:text-slate-400">Commercial Standing:</span>
                        <strong className="text-orange-600 dark:text-orange-400">
                          {tier.label}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RECENT ORDERS HISTORY */}
              {activeTab === "orders" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                      <span>Fulfillment Ledger (Up to 10 Latest Orders)</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {recentOrders.length} records retrieved
                    </span>
                  </div>

                  {recentOrders.length > 0 ? (
                    <div className="space-y-2.5">
                      {recentOrders.map((ord) => (
                        <div
                          key={ord._id}
                          className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-black text-sm text-slate-900 dark:text-white tracking-tight">
                                #{ord.orderNumber}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {new Date(ord.createdAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                                {ord.totalItems} {ord.totalItems === 1 ? "unit" : "units"}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <span>
                                Pay: <strong>{ord.paymentMethod || "Online"}</strong> (
                                {ord.paymentStatus || "PENDING"})
                              </span>
                              {ord.trackingNumber && (
                                <>
                                  <span>•</span>
                                  <span>
                                    AWB: <strong className="font-mono">{ord.trackingNumber}</strong>
                                  </span>
                                </>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/5">
                            <span className="font-heading font-black text-base text-slate-900 dark:text-white font-mono">
                              {formatINR(ord.grandTotal)}
                            </span>

                            <span
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${getOrderStatusBadge(
                                ord.orderStatus
                              )}`}
                            >
                              {ord.orderStatus}
                            </span>

                            <Link
                              to={`/admin/orders/${ord._id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-orange-500 hover:border-orange-500 transition-colors border border-slate-200 dark:border-white/10 text-[11px] font-semibold shadow-xs"
                            >
                              <span>Dossier</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                      <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <h5 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                        No Orders Placed Yet
                      </h5>
                      <p className="text-xs text-slate-400 font-sans">
                        This customer account has not submitted any checkout transactions.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ADDRESS BOOK */}
              {activeTab === "addresses" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span>Registered Shipping & Billing Destinations</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {detailCustomer.addresses?.length || 0} registered
                    </span>
                  </div>

                  {detailCustomer.addresses?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {detailCustomer.addresses.map((addr, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 relative text-xs font-sans space-y-1.5 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                              Address #{idx + 1}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/25">
                                Primary Default
                              </span>
                            )}
                          </div>

                          <div className="pt-1">
                            <strong className="block text-sm text-slate-900 dark:text-white font-medium">
                              {addr.fullName}
                            </strong>
                            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {addr.streetAddress}
                              <br />
                              {addr.city}, {addr.state} -{" "}
                              <strong className="font-mono">{addr.postalCode}</strong>
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{addr.phone}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                      <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <h5 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                        No Registered Addresses
                      </h5>
                      <p className="text-xs text-slate-400 font-sans">
                        Customer has not configured a shipping or billing address profile.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. Footer Section */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-white/[0.02] shrink-0">
          <div className="text-xs font-sans text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Member since{" "}
              {new Date(detailCustomer.createdAt).toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-sans font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm cursor-pointer active:scale-95"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
