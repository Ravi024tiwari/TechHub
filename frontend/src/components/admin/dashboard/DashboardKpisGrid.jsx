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
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 snap-x snap-mandatory no-scrollbar touch-pan-x">
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
            typeof revenueData.revenueGrowthPercentage === "number"
              ? revenueData.revenueGrowthPercentage > 0
                ? `+${revenueData.revenueGrowthPercentage}%`
                : `${revenueData.revenueGrowthPercentage}%`
              : "0%"
          }
          trendColor={
            (revenueData.revenueGrowthPercentage ?? 0) >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }
          subText="Day-over-day"
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
          sparklineData={[]}
          sparklineColor="#a855f7"
          trendIcon={TrendingUp}
          trendText={`${totalCustCount} Active`}
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
          sparklineData={[]}
          sparklineColor="#f59e0b"
          trendIcon={TrendingUp}
          trendText="AOV"
          trendColor="text-amber-600 dark:text-amber-400"
          subText="per checkout"
          glowColor="bg-amber-500/10"
        />
      </div>

      {/* Mobile Swipe Hint - 2 cards visible at a time */}
      <div className="flex sm:hidden items-center justify-center gap-1 pt-1">
        <span className="w-4 h-1 rounded-full bg-slate-900 dark:bg-white" />
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/25" />
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/25" />
        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 ml-1.5">
          Swipe for all 4 KPIs →
        </span>
      </div>
    </div>
  );
}
