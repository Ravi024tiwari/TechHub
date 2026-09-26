import React from "react";
import { DollarSign, ShoppingBag, Users, Tag, TrendingUp } from "lucide-react";
import DashboardKpiCard from "./DashboardKpiCard";

/**
 * Enterprise Production KPI Grid:
 * - 4 Color-tailored KPI cards (Emerald, Sky Blue, Purple, Cyber Amber).
 * - Horizontal swipe snap on mobile screens (<640px) with custom scrollbar hidden.
 * - 4-column clean responsive layout on desktop.
 */
export default function DashboardKpisGrid({
  revenueData = {},
  ordersData = {},
  customersData = {},
  revenueSparkline = [],
  ordersSparkline = [],
  currencyFormatter,
}) {
  const totalGrossRev = revenueData.totalGrossRevenue ?? 0;
  const totalOrdersCount = ordersData.totalOrders ?? 0;
  const totalCustCount = customersData.totalCustomers ?? 0;
  const aovVal = revenueData.avgOrderValue ?? 0;

  const formattedRevenue = currencyFormatter
    ? currencyFormatter(totalGrossRev)
    : `₹${totalGrossRev.toLocaleString()}`;

  const formattedAov = currencyFormatter
    ? currencyFormatter(aovVal)
    : `₹${aovVal.toLocaleString()}`;

  return (
    <div className="space-y-2">
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 snap-x snap-mandatory no-scrollbar touch-pan-x">
        {/* Card 1: Total Gross Revenue (Emerald) */}
        <DashboardKpiCard
          icon={DollarSign}
          iconBg="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          title="Gross Revenue"
          value={formattedRevenue}
          sparklineData={revenueSparkline}
          sparklineColor="#10b981"
          trendIcon={TrendingUp}
          trendText={
            revenueData.revenueGrowthPercentage
              ? `+${revenueData.revenueGrowthPercentage}%`
              : "+12.8%"
          }
          trendColor="text-emerald-600 dark:text-emerald-400"
          subText="vs last cycle"
          glowColor="bg-emerald-500/10"
        />

        {/* Card 2: Total Store Orders (Sky Blue) */}
        <DashboardKpiCard
          icon={ShoppingBag}
          iconBg="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
          title="Total Orders"
          value={totalOrdersCount.toLocaleString()}
          sparklineData={ordersSparkline}
          sparklineColor="#38bdf8"
          trendIcon={TrendingUp}
          trendText={`${ordersData.pendingFulfillment ?? 0} Pending`}
          trendColor="text-sky-600 dark:text-sky-400"
          subText="fulfillment"
          glowColor="bg-sky-500/10"
        />

        {/* Card 3: Registered Customer Accounts (Purple) */}
        <DashboardKpiCard
          icon={Users}
          iconBg="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
          title="Verified Base"
          value={totalCustCount.toLocaleString()}
          sparklineData={[12, 15, 18, 20, 25, 29, 34]}
          sparklineColor="#a855f7"
          trendIcon={TrendingUp}
          trendText="Active Store"
          trendColor="text-purple-600 dark:text-purple-400"
          subText="customers"
          glowColor="bg-purple-500/10"
        />

        {/* Card 4: Average Order Value (Amber) */}
        <DashboardKpiCard
          icon={Tag}
          iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
          title="Average Basket"
          value={formattedAov}
          sparklineData={[15, 16, 14, 20, 19, 23, 25]}
          sparklineColor="#f59e0b"
          trendIcon={TrendingUp}
          trendText="AOV"
          trendColor="text-amber-600 dark:text-amber-400"
          subText="per checkout"
          glowColor="bg-amber-500/10"
        />
      </div>

      {/* Mobile Swipe Hint */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 pt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)] dark:shadow-[0_0_8px_#ffffff]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/25" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/25" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/25" />
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 ml-1.5">
          Swipe to view metrics →
        </span>
      </div>
    </div>
  );
}
