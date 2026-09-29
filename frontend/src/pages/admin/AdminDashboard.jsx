import React, { useState, useMemo } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  useAdminOverviewQuery,
  useAdminSalesAnalyticsQuery,
  useAdminInventoryHealthQuery,
  useRefreshAdminDashboard,
} from "../../hooks/useAdminDashboard";

// Modular Subcomponents
import DashboardHeader from "../../components/admin/dashboard/DashboardHeader";
import DashboardKpisGrid from "../../components/admin/dashboard/DashboardKpisGrid";
import DashboardSkeleton from "../../components/admin/dashboard/DashboardSkeleton";
import DashboardErrorState from "../../components/admin/dashboard/DashboardErrorState";
import RevenueSplineChart from "../../components/admin/dashboard/RevenueSplineChart";
import OrderStatusDonut from "../../components/admin/dashboard/OrderStatusDonut";
import RecentOrdersTable from "../../components/admin/dashboard/RecentOrdersTable";
import InventoryHealthCard from "../../components/admin/dashboard/InventoryHealthCard";
import CategoryRevenueCard from "../../components/admin/dashboard/CategoryRevenueCard";
import TopProductsCard from "../../components/admin/dashboard/TopProductsCard";
import RecentActivityFeed from "../../components/admin/dashboard/RecentActivityFeed";

/**
 * Enterprise Production Admin Dashboard (Clean Modular Architecture):
 * - Decomposed into decoupled, focused components.
 * - 2-Minute smart memory cache powered by TanStack Query.
 * - Reactive on-demand cache invalidation on manual refresh.
 * - Real-time metrics, charts, and warehouse health status.
 */
export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const [timeframe, setTimeframe] = useState("30d");
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // TanStack Query Hooks with 2-Minute StaleTime Caching
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
    error: overviewError,
    dataUpdatedAt,
  } = useAdminOverviewQuery();

  const { data: salesAnalytics } = useAdminSalesAnalyticsQuery(timeframe);
  const { data: inventoryHealth } = useAdminInventoryHealthQuery();
  const refreshAllQueries = useRefreshAdminDashboard();

  // Currency Formatter
  const formatINR = (amount = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Manual Refresh Handler
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refreshAllQueries();
    } finally {
      setTimeout(() => setIsManualRefreshing(false), 600);
    }
  };

  // Cache freshness badge timer text
  const lastSyncText = useMemo(() => {
    if (!dataUpdatedAt) return "Synced just now";
    const secondsAgo = Math.floor((Date.now() - dataUpdatedAt) / 1000);
    if (secondsAgo < 60) return `${secondsAgo}s ago (Cached)`;
    const mins = Math.floor(secondsAgo / 60);
    return `${mins}m ago (Cached)`;
  }, [dataUpdatedAt, isManualRefreshing]);

  // Export Executive Report as CSV
  const handleExportReport = () => {
    const revenue = overviewData?.kpis?.revenue || {};
    const orders = overviewData?.kpis?.orders || {};
    const catalog = overviewData?.kpis?.catalog || {};
    const customers = overviewData?.kpis?.customers || {};

    const rows = [
      ["Metric", "Value"],
      ["Total Gross Revenue", revenue.totalGrossRevenue || 0],
      ["Total Net Revenue", revenue.totalNetRevenue || 0],
      ["Total Orders", orders.totalOrders || 0],
      ["Pending Fulfillment", orders.pendingFulfillment || 0],
      ["Average Order Value", revenue.avgOrderValue || 0],
      ["Total Products in Catalog", catalog.totalProducts || 0],
      ["Active Customer Accounts", customers.totalCustomers || 0],
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

  // 1. Loading Skeleton State
  if (isOverviewLoading && !overviewData) {
    return <DashboardSkeleton />;
  }

  // 2. Error State with Retry
  if (isOverviewError) {
    return (
      <DashboardErrorState
        error={overviewError}
        onRetry={handleManualRefresh}
      />
    );
  }

  // 3. Extract KPI metrics safely
  const kpis = overviewData?.kpis || {};
  const revenue = kpis.revenue || {};
  const orders = kpis.orders || {};
  const catalog = kpis.catalog || {};
  const customers = kpis.customers || {};

  const totalGrossRev = revenue.totalGrossRevenue ?? 0;
  const totalOrdersCount = orders.totalOrders ?? 0;

  const statusMap = {
    DELIVERED: orders.deliveredOrders ?? 0,
    SHIPPED: orders.shippedOrders ?? 0,
    PROCESSING: orders.pendingFulfillment ?? 0,
    CANCELLED: orders.cancelledOrders ?? 0,
    RETURNED: orders.returnedOrders ?? 0,
  };

  // Real Sparkline data derived purely from database timeline
  const revenueSparkline =
    salesAnalytics?.salesTimeline?.length >= 2
      ? salesAnalytics.salesTimeline.map((d) => d.revenue || 0)
      : [];

  const ordersSparkline =
    salesAnalytics?.salesTimeline?.length >= 2
      ? salesAnalytics.salesTimeline.map((d) => d.orders || 0)
      : [];

  // Transform backend recentActivity (orders, users, reviews) into unified chronological feed
  const formattedActivities = useMemo(() => {
    const raw = overviewData?.recentActivity || {};
    const list = [];

    (raw.recentOrders || []).forEach((ord) => {
      const isDelivered = ord.orderStatus === "DELIVERED";
      const total = ord.pricing?.grandTotal || 0;
      const orderNum = ord.orderNumber || `#ORD-${String(ord._id).slice(-4).toUpperCase()}`;

      list.push({
        id: `ord-${ord._id}`,
        type: isDelivered ? "delivery" : "order",
        title: `${ord.user?.name || "Customer"} placed an order`,
        desc: `${orderNum} • ₹${total.toLocaleString()} • ${ord.orderStatus}`,
        time: ord.createdAt,
        timestamp: new Date(ord.createdAt).getTime(),
        link: `/admin/orders?search=${ord.orderNumber || ord._id}`,
      });
    });

    (raw.recentUsers || []).forEach((u) => {
      list.push({
        id: `user-${u._id}`,
        type: "user",
        title: `${u.name || "Customer"} registered an account`,
        desc: u.email || "Verified Customer Profile",
        time: u.createdAt,
        timestamp: new Date(u.createdAt).getTime(),
        link: "/admin/customers",
      });
    });

    (raw.recentReviews || []).forEach((rev) => {
      list.push({
        id: `rev-${rev._id}`,
        type: "review",
        title: `${rev.user?.name || "Customer"} rated ${rev.rating || 5}★`,
        desc: `${rev.product?.title || "Electronics"} • "${rev.title || rev.comment || "Verified review"}"`,
        time: rev.createdAt,
        timestamp: new Date(rev.createdAt).getTime(),
        link: "/admin/products",
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [overviewData?.recentActivity]);

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Top Greeting & Action Controls */}
      <DashboardHeader
        userName={user?.name || "Administrator"}
        lastSyncText={lastSyncText}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        onRefresh={handleManualRefresh}
        isRefreshing={isManualRefreshing}
        onExport={handleExportReport}
      />

      {/* Row 1: Modular 4 KPI Cards Grid */}
      <DashboardKpisGrid
        revenueData={revenue}
        ordersData={orders}
        customersData={customers}
        revenueSparkline={revenueSparkline}
        ordersSparkline={ordersSparkline}
        currencyFormatter={formatINR}
      />

      {/* Row 2: Revenue Spline Area Chart (8 cols) & Order Status Donut (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RevenueSplineChart
            timeline={salesAnalytics?.salesTimeline || []}
            headlineTotal={totalGrossRev}
            growthPercentage={revenue.revenueGrowthPercentage ?? 0}
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

      {/* Row 3: Recent Orders Table (7 cols) & Warehouse Inventory Health (5 cols) */}
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

      {/* Row 4: Category Breakdown (4 cols), Top Products (4 cols), Activity Feed (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <CategoryRevenueCard
            categories={salesAnalytics?.categoryBreakdown || []}
            currencyFormatter={formatINR}
          />
        </div>

        <div className="lg:col-span-4">
          <TopProductsCard
            products={inventoryHealth?.topSellingProducts || []}
            currencyFormatter={formatINR}
          />
        </div>

        <div className="lg:col-span-4">
          <RecentActivityFeed activities={formattedActivities} />
        </div>
      </div>
    </div>
  );
}
