import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useCustomerDashboardQuery,
  useInvalidateCustomerDashboard,
} from "@/hooks/useCustomerDashboard";

// Dashboard Subcomponents
import CustomerDashboardSkeleton from "@/components/dashboard/CustomerDashboardSkeleton";
import VipTierCard from "@/components/dashboard/VipTierCard";
import StatCard from "@/components/dashboard/StatCard";
import ActiveOrderTracker from "@/components/dashboard/ActiveOrderTracker";
import SpendingAnalyticsChart from "@/components/dashboard/SpendingAnalyticsChart";
import RecentOrdersList from "@/components/dashboard/RecentOrdersList";
import QuickShortcutsDock from "@/components/dashboard/QuickShortcutsDock";

import {
  Wallet,
  ShoppingBag,
  Truck,
  Percent,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  User,
  Activity,
  Crown,
  Zap,
} from "lucide-react";

export default function CustomerDashboard() {
  const user = useAuthStore((state) => state.user);
  const invalidateDashboard = useInvalidateCustomerDashboard();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // TanStack Query: staleTime: 2000ms (2s), gcTime: 5000ms (5s)
  const { data, isLoading, isError, error, refetch, isFetching } =
    useCustomerDashboardQuery();

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    invalidateDashboard();
    await refetch();
    setTimeout(() => setIsManualRefreshing(false), 500);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Unauthenticated State
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center mx-auto shadow-xs">
              <User className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold font-heading">Sign In Required</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please sign in to access your customer dashboard, VIP tier progress, and live order tracking.
            </p>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 inline-block transition-all active:scale-95"
            >
              Sign In Now
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full max-w-[1380px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* Floating Quick Anchor Navigation Dock (matching OrderFilterTabs style) */}
        <div className="p-1.5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/25 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 overflow-x-auto scrollbar-none text-xs font-heading font-bold">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => scrollToSection("vip-tier")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-all shrink-0 cursor-pointer group"
            >
              <Crown className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>VIP Status & Perks</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("shipment-tracker")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-all shrink-0 cursor-pointer group"
            >
              <Truck className="h-3.5 w-3.5 text-orange-500 group-hover:scale-110 transition-transform" />
              <span>Live Shipments</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("spending-analytics")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-all shrink-0 cursor-pointer group"
            >
              <Activity className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>Analytics & Split</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("orders-ledger")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-all shrink-0 cursor-pointer group"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-orange-500 group-hover:scale-110 transition-transform" />
              <span>Order Ledger</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("shortcuts-dock")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-all shrink-0 cursor-pointer group"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>Quick Shortcuts</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-1 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isFetching || isManualRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 text-xs font-heading font-bold transition-all cursor-pointer"
              title="Refresh Dashboard Data"
            >
              <RefreshCw
                className={`h-3 w-3 text-orange-500 ${
                  isFetching || isManualRefreshing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Sync Live</span>
            </button>

            <Link
              to="/profile"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-xs font-heading font-bold text-orange-600 dark:text-orange-400 transition-all"
            >
              <span>Settings</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <CustomerDashboardSkeleton />}

        {/* Error State */}
        {isError && (
          <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center space-y-4 shadow-sm">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-heading font-bold text-rose-600 dark:text-rose-400">
              Failed to load dashboard metrics
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {error?.response?.data?.message ||
                error?.message ||
                "An unexpected error occurred while fetching customer telemetry."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Main Dashboard Content */}
        {!isLoading && !isError && data && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* 1. VIP Tier Hero Banner & Badges Shelf */}
            <div id="vip-tier">
              <VipTierCard
                loyalty={data.loyalty}
                badges={data.badges}
                userName={data.profile?.name || user.name}
              />
            </div>

            {/* 2. Financial & Order KPI Stat Cards Grid (Admin Orders Orange & Amber Palette) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4.5">
              <StatCard
                title="Lifetime Spend"
                value={`₹${(data.metrics?.lifetimeSpent || 0).toLocaleString("en-IN")}`}
                subtitle={`Avg: ₹${(data.metrics?.averageOrderValue || 0).toLocaleString("en-IN")}`}
                icon={Wallet}
                accentColor="orange"
                trend="Spend"
                onClick={() => scrollToSection("spending-analytics")}
              />

              <StatCard
                title="Total Orders"
                value={data.metrics?.totalOrders || 0}
                subtitle={`${data.metrics?.deliveredOrdersCount || 0} Delivered`}
                icon={ShoppingBag}
                accentColor="amber"
                trend="Volume"
                onClick={() => scrollToSection("orders-ledger")}
              />

              <StatCard
                title="In Transit"
                value={data.metrics?.activeOrdersCount || 0}
                subtitle={data.metrics?.activeOrdersCount > 0 ? "Live Delivery" : "0 Active"}
                icon={Truck}
                accentColor="orange"
                badgeText={data.metrics?.activeOrdersCount > 0 ? "LIVE" : null}
                pulse={data.metrics?.activeOrdersCount > 0}
                trend="Shipment"
                onClick={() => scrollToSection("shipment-tracker")}
              />

              <StatCard
                title="Total Savings"
                value={`₹${(data.metrics?.totalSavings || 0).toLocaleString("en-IN")}`}
                subtitle="Deals & Promos"
                icon={Percent}
                accentColor="emerald"
                trend="Saved"
              />

              {/* 5th card spans full width on 2-col mobile */}
              <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                <StatCard
                  title="Reward Points"
                  value={(data.loyalty?.loyaltyPoints || 0).toLocaleString("en-IN")}
                  subtitle={`${data.loyalty?.pointsMultiplier || 1}x Multiplier`}
                  icon={ShieldCheck}
                  accentColor="purple"
                  trend="Loyalty"
                  onClick={() => scrollToSection("vip-tier")}
                />
              </div>
            </div>

            {/* 3. Real-Time Active Order Live Tracker */}
            <div id="shipment-tracker">
              <ActiveOrderTracker activeOrders={data.activeOrders} />
            </div>

            {/* 4. 6-Month Spending Analytics & Category Portfolio */}
            <div id="spending-analytics">
              <SpendingAnalyticsChart
                monthlySpending={data.monthlySpending}
                categoryBreakdown={data.categoryBreakdown}
              />
            </div>

            {/* 5. Recent Purchase Ledger */}
            <div id="orders-ledger">
              <RecentOrdersList recentOrders={data.recentOrders} />
            </div>

            {/* 6. Quick Dock: Default Address, Wishlist Quick Shelf & Concierge */}
            <div id="shortcuts-dock">
              <QuickShortcutsDock
                defaultAddress={data.profile?.defaultAddress}
                wishlist={data.wishlist}
                totalAddresses={data.profile?.totalAddressesCount}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
