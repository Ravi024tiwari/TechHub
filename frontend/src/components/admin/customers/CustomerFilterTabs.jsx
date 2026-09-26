import React from "react";
import { Users, UserCheck, UserX } from "lucide-react";

export default function CustomerFilterTabs({
  activeStatus = "",
  onSelectStatus,
  summary = {},
}) {
  const tabs = [
    {
      key: "",
      label: "All Customers",
      icon: Users,
      dot: "bg-slate-400",
      count: summary.total,
    },
    {
      key: "active",
      label: "Active Accounts",
      icon: UserCheck,
      dot: "bg-emerald-500",
      count: summary.active,
    },
    {
      key: "blocked",
      label: "Suspended",
      icon: UserX,
      dot: "bg-rose-500",
      count: summary.blocked,
    },
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-1">
      <div className="flex items-center gap-1.5 min-w-max p-1.5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/25 shadow-xs">
        {tabs.map((tab) => {
          const isActive = activeStatus === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectStatus(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium font-sans transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-semibold shadow-md shadow-orange-500/25 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${tab.dot} ${
                  isActive ? "ring-2 ring-white/50" : ""
                }`}
              />
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
