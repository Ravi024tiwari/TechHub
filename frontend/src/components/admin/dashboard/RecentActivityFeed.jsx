import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  UserPlus,
  Star,
  CheckCircle,
  ChevronRight,
  ArrowUpRight,
  Activity,
  Radio,
  Filter,
} from "lucide-react";

/**
 * Enterprise Production Operational Stream Feed:
 * - Real-time audit log with live pulsing status.
 * - Interactive event category filters (All, Orders, Users, Deliveries).
 * - Connected timeline track with luminous nodes.
 * - Deep link shortcuts to administrative action handlers.
 */
export default function RecentActivityFeed({ activities = [] }) {
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'order' | 'user' | 'delivery'
  const [hoveredEvent, setHoveredEvent] = useState(null);

  // Fallback realistic activity events if store is new
  const allActivities = useMemo(() => {
    return activities && activities.length > 0
      ? activities
      : [
          {
            id: "act-1",
            type: "order",
            title: "Rahul Sharma placed an order",
            desc: "iPhone 17 Pro 256GB Titanium • ₹1,34,900",
            time: "2m ago",
            isLive: true,
            icon: ShoppingBag,
            link: "/admin/orders",
            color:
              "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10",
          },
          {
            id: "act-2",
            type: "user",
            title: "Aman Verma registered a new account",
            desc: "Verified Customer Profile • Bengaluru, KA",
            time: "8m ago",
            icon: UserPlus,
            link: "/admin/customers",
            color:
              "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20 shadow-sky-500/10",
          },
          {
            id: "act-3",
            type: "review",
            title: "Priya Singh submitted a 5★ review",
            desc: "MacBook Air M4 • 'Exceptional performance & build!'",
            time: "12m ago",
            icon: Star,
            link: "/admin/products",
            color:
              "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10",
          },
          {
            id: "act-4",
            type: "delivery",
            title: "Order #ORD-918 delivered successfully",
            desc: "BlueDart Express (AWB: #TRK-882) • Paid via UPI",
            time: "1h ago",
            icon: CheckCircle,
            link: "/admin/orders",
            color:
              "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10",
          },
        ];
  }, [activities]);

  // Filtered list
  const filteredActivities = useMemo(() => {
    if (activeFilter === "all") return allActivities;
    return allActivities.filter((act) => act.type === activeFilter);
  }, [allActivities, activeFilter]);

  return (
    <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-xl hover:border-orange-500/20 transition-all duration-300 flex flex-col justify-between group">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <h2 className="text-sm sm:text-base font-heading font-bold text-slate-900 dark:text-white">
              Operational Stream
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Live store interactions & audit timeline
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors group/link shrink-0"
        >
          <span>Stream</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Interactive Category Filter Pills */}
      <div className="relative z-10 flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 mb-4 self-start">
        {[
          { key: "all", label: "All" },
          { key: "order", label: "Orders" },
          { key: "user", label: "Users" },
          { key: "delivery", label: "Deliveries" },
        ].map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-orange-500 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Connected Timeline Stream List */}
      <div className="relative z-10 space-y-3">
        {filteredActivities.map((act, idx) => {
          const Icon = act.icon || ShoppingBag;
          const isHovered = hoveredEvent === idx;

          return (
            <div
              key={act.id || idx}
              onMouseEnter={() => setHoveredEvent(idx)}
              onMouseLeave={() => setHoveredEvent(null)}
              className={`relative flex items-start gap-3 p-2 rounded-xl sm:rounded-2xl transition-all duration-200 border ${
                isHovered
                  ? "bg-slate-50 dark:bg-white/[0.04] border-slate-300 dark:border-white/20 shadow-sm translate-x-1"
                  : "bg-transparent border-transparent hover:border-slate-200 dark:hover:border-white/5"
              }`}
            >
              {/* Event Icon with Soft Glow */}
              <div
                className={`p-2 rounded-xl shrink-0 border transition-all ${
                  act.color
                } ${isHovered ? "scale-110 shadow-md" : ""}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white truncate text-xs font-sans">
                    {act.title}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {act.isLive && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    <span className="text-[10px] font-mono text-slate-400">
                      {act.time}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-sans">
                  {act.desc}
                </p>
              </div>

              {/* Quick Action Icon on Hover */}
              <Link
                to={act.link || "/admin/orders"}
                className={`p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-opacity ${
                  isHovered ? "opacity-100" : "opacity-0 sm:opacity-0"
                }`}
                title="Inspect event details"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>System Status:</span>
          <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
            All Services Operational
          </strong>
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          Sync: Instant
        </span>
      </div>
    </div>
  );
}
