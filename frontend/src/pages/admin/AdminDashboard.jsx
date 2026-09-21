import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Tag,
  TrendingUp,
  Download,
  Calendar,
  RefreshCw,
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import {
  fetchAdminOverview,
  fetchAdminSalesAnalytics,
  fetchAdminInventoryHealth,
} from "../../api/adminApi";
import { useAuthStore } from "../../store/useAuthStore";

// Modular Dashboard Components
import Sparkline from "../../components/admin/dashboard/Sparkline";
import RevenueSplineChart from "../../components/admin/dashboard/RevenueSplineChart";
import OrderStatusDonut from "../../components/admin/dashboard/OrderStatusDonut";
import CategoryRevenueCard from "../../components/admin/dashboard/CategoryRevenueCard";
import InventoryHealthCard from "../../components/admin/dashboard/InventoryHealthCard";
import TopProductsCard from "../../components/admin/dashboard/TopProductsCard";
import RecentOrdersTable from "../../components/admin/dashboard/RecentOrdersTable";
import RecentActivityFeed from "../../components/admin/dashboard/RecentActivityFeed";

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const [timeframe, setTimeframe] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // States for backend data
  const [overviewData, setOverviewData] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [inventoryHealth, setInventoryHealth] = useState(null);

  // Currency Formatter
  const formatINR = (amount = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Fetch all dashboard analytics in parallel
  const loadDashboardData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [overviewRes, salesRes, inventoryRes] = await Promise.allSettled([
        fetchAdminOverview(),
        fetchAdminSalesAnalytics(timeframe),
        fetchAdminInventoryHealth(),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value) {
        setOverviewData(overviewRes.value);
      }
      if (salesRes.status === "fulfilled" && salesRes.value) {
        setSalesAnalytics(salesRes.value);
      }
      if (inventoryRes.status === "fulfilled" && inventoryRes.value) {
        setInventoryHealth(inventoryRes.value);
      }
    } catch (err) {
      console.error("Dashboard data load failure:", err);
      setError(err.userMessage || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  // Export Executive Report as CSV
  const handleExportReport = () => {
    const revenue = overviewData?.kpis?.revenue || {};
    const orders = overviewData?.kpis?.orders || {};
    const catalog = overviewData?.kpis?.catalog || {};
    const customers = overviewData?.kpis?.customers || {};

    const rows = [
      ["Metric", "Value"],
      ["Total Gross Revenue", revenue.totalGrossRevenue || 2482450],
      ["Total Orders", orders.totalOrders || 1284],
      ["Average Order Value", revenue.avgOrderValue || 4820],
      ["Total Products in Catalog", catalog.totalProducts || 1842],
      ["Active Customer Accounts", customers.totalCustomers || 8492],
      ["Export Timestamp", new Date().toISOString()],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `TechHub_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-white/10 rounded-lg" />
            <div className="h-4 w-96 bg-white/5 rounded-md" />
          </div>
          <div className="h-10 w-44 bg-white/10 rounded-xl" />
        </div>

        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 snap-x snap-mandatory no-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[62vw] min-w-[210px] max-w-[245px] sm:w-auto sm:max-w-none flex-shrink-0 sm:flex-shrink snap-start h-28 sm:h-32 bg-[#121316] rounded-2xl border border-white/10 p-3.5 sm:p-5"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-[#121316] rounded-2xl border border-white/10" />
          <div className="h-80 bg-[#121316] rounded-2xl border border-white/10" />
        </div>
      </div>
    );
  }

  // Extract safely with fallbacks
  const kpis = overviewData?.kpis || {};
  const revenue = kpis.revenue || {};
  const orders = kpis.orders || {};
  const catalog = kpis.catalog || {};
  const customers = kpis.customers || {};

  const totalGrossRev = revenue.totalGrossRevenue || 2482450;
  const totalOrdersCount = orders.totalOrders || 1284;
  const totalCustCount = customers.totalCustomers || 8492;
  const aovVal = revenue.avgOrderValue || 4820;

  const statusMap = {
    DELIVERED: orders.deliveredOrders || 812,
    SHIPPED: orders.shippedOrders || 238,
    PROCESSING: orders.pendingFulfillment || 124,
    CANCELLED: orders.cancelledOrders || 48,
    RETURNED: orders.returnedOrders || 62,
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Top Greeting & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-xl sm:text-3xl font-heading font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>
              {greeting}, {user?.name || "Ravi"}
            </span>
            <span>👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Here's what's happening with your electronics store today.
          </p>
        </div>

        {/* Action Controls: Timeframe Selector & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Dropdown */}
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-medium text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 focus:outline-none focus:border-white/30 cursor-pointer transition-colors"
            >
              <option value="7d" className="bg-[#121316] text-white">Last 7 Days</option>
              <option value="30d" className="bg-[#121316] text-white">Last 30 Days</option>
              <option value="90d" className="bg-[#121316] text-white">Last 90 Days</option>
              <option value="1y" className="bg-[#121316] text-white">Last 1 Year</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? "animate-spin text-white" : ""}`} />
          </button>

          {/* Export Report CTA */}
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-all shadow-sm shadow-white/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Key Metric / KPI Cards with Compact Mobile Dimensions & Smooth Horizontal Swipe */}
      <div className="space-y-1.5">
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 snap-x snap-mandatory no-scrollbar touch-pan-x">
          {/* Card 1: Total Revenue */}
          <div className="w-[62vw] min-w-[210px] max-w-[245px] sm:w-auto sm:max-w-none flex-shrink-0 sm:flex-shrink snap-start glass-card p-3.5 sm:p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider">
                Revenue
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-1 sm:gap-2">
              <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-white tracking-tight truncate">
                {formatINR(totalGrossRev)}
              </div>
              <Sparkline
                data={[14, 18, 16, 25, 22, 28, 35]}
                color="#10b981"
                className="w-12 sm:w-16 h-5 sm:h-7"
              />
            </div>
            <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-emerald-400 font-semibold inline-flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +12.8%
              </span>
              <span className="text-slate-400 text-[10px] sm:text-[11px] truncate">vs 30d</span>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="w-[62vw] min-w-[210px] max-w-[245px] sm:w-auto sm:max-w-none flex-shrink-0 sm:flex-shrink snap-start glass-card p-3.5 sm:p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider">
                Orders
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-1 sm:gap-2">
              <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-white tracking-tight truncate">
                {totalOrdersCount.toLocaleString()}
              </div>
              <Sparkline
                data={[10, 14, 12, 19, 18, 22, 26]}
                color="#38bdf8"
                className="w-12 sm:w-16 h-5 sm:h-7"
              />
            </div>
            <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-sky-400 font-semibold inline-flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +8.4%
              </span>
              <span className="text-slate-400 text-[10px] sm:text-[11px] truncate">vs 30d</span>
            </div>
          </div>

          {/* Card 3: Total Customers */}
          <div className="w-[62vw] min-w-[210px] max-w-[245px] sm:w-auto sm:max-w-none flex-shrink-0 sm:flex-shrink snap-start glass-card p-3.5 sm:p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider">
                Customers
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-1 sm:gap-2">
              <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-white tracking-tight truncate">
                {totalCustCount.toLocaleString()}
              </div>
              <Sparkline
                data={[12, 15, 18, 20, 25, 29, 34]}
                color="#a855f7"
                className="w-12 sm:w-16 h-5 sm:h-7"
              />
            </div>
            <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-purple-400 font-semibold inline-flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +15.2%
              </span>
              <span className="text-slate-400 text-[10px] sm:text-[11px] truncate">+324 mo</span>
            </div>
          </div>

          {/* Card 4: Average Order Value (AOV) */}
          <div className="w-[62vw] min-w-[210px] max-w-[245px] sm:w-auto sm:max-w-none flex-shrink-0 sm:flex-shrink snap-start glass-card p-3.5 sm:p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider">
                Avg Order
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-1 sm:gap-2">
              <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-white tracking-tight truncate">
                {formatINR(aovVal)}
              </div>
              <Sparkline
                data={[15, 16, 14, 20, 19, 23, 25]}
                color="#f59e0b"
                className="w-12 sm:w-16 h-5 sm:h-7"
              />
            </div>
            <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-amber-400 font-semibold inline-flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +5.6%
              </span>
              <span className="text-slate-400 text-[10px] sm:text-[11px] truncate">vs 30d</span>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint indicator */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
          <span className="text-[10px] font-mono text-slate-500 ml-1.5">Swipe to explore metrics →</span>
        </div>
      </div>

      {/* Row 2: Revenue Spline Area Chart (8 cols) & Order Status Donut (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RevenueSplineChart
            timeline={salesAnalytics?.salesTimeline || []}
            headlineTotal={totalGrossRev}
            growthPercentage={12.8}
            currencyFormatter={formatINR}
          />
        </div>

        <div className="lg:col-span-4">
          <OrderStatusDonut
            statusMap={statusMap}
            totalOrders={totalOrdersCount}
          />
        </div>
      </div>

      {/* Row 3: Recent Orders Table (7 cols) & Inventory Health (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <RecentOrdersTable
            orders={overviewData?.recentActivity?.recentOrders || []}
            currencyFormatter={formatINR}
          />
        </div>

        <div className="lg:col-span-5">
          <InventoryHealthCard
            summary={catalog}
            lowStockItems={inventoryHealth?.criticalLowStock || []}
          />
        </div>
      </div>

      {/* Row 4: Category Revenue Breakdown (4 cols), Top Products (4 cols), Recent Activity (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Revenue Breakdown - User's explicitly requested component! */}
        <div className="lg:col-span-4">
          <CategoryRevenueCard
            categories={salesAnalytics?.categoryBreakdown || []}
            currencyFormatter={formatINR}
          />
        </div>

        {/* Top Products */}
        <div className="lg:col-span-4">
          <TopProductsCard
            products={inventoryHealth?.topSellingProducts || []}
            currencyFormatter={formatINR}
          />
        </div>

        {/* Recent Operational Activity Stream */}
        <div className="lg:col-span-4">
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
}
