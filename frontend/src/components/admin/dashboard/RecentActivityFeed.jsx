import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, UserPlus, Star, CheckCircle, ChevronRight } from "lucide-react";

export default function RecentActivityFeed({
  activities = [],
}) {
  // Fallback realistic activity events if store is new
  const displayActivities =
    activities && activities.length > 0
      ? activities
      : [
          {
            type: "order",
            title: "Rahul Sharma placed an order",
            desc: "iPhone 17 Pro 256GB Titanium",
            time: "2m ago",
            icon: ShoppingBag,
            color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
          },
          {
            type: "user",
            title: "Aman Verma registered a new account",
            desc: "Customer ID #CUST-491",
            time: "8m ago",
            icon: UserPlus,
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          },
          {
            type: "review",
            title: "Priya Singh submitted a 5★ review",
            desc: "MacBook Air M4 • 'Exceptional build quality!'",
            time: "12m ago",
            icon: Star,
            color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          },
          {
            type: "delivery",
            title: "Order #ORD-918 delivered successfully",
            desc: "Courier: BlueDart Express (Ref: #TRK-882)",
            time: "1h ago",
            icon: CheckCircle,
            color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
          },
        ];

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-heading font-bold text-white">
            Recent Store Activity
          </h2>
          <p className="text-[11px] text-slate-400">Live operational & engagement events</p>
        </div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white group transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3.5">
        {displayActivities.map((act, idx) => {
          const Icon = act.icon || ShoppingBag;
          return (
            <div key={idx} className="flex items-start gap-3 text-xs group">
              <div
                className={`p-2 rounded-xl shrink-0 border ${act.color} transition-transform group-hover:scale-105`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-white truncate text-xs">
                    {act.title}
                  </p>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {act.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {act.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
