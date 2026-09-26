import React from "react";
import {
  Layers,
  Clock,
  CheckCircle,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Navigation,
} from "lucide-react";

const STATUS_TABS = [
  { key: "", label: "All Orders", icon: Layers, dot: "bg-slate-400" },
  { key: "PLACED", label: "New Placed", icon: Clock, dot: "bg-amber-400" },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle, dot: "bg-sky-400" },
  { key: "PROCESSING", label: "Processing", icon: Package, dot: "bg-blue-500" },
  { key: "SHIPPED", label: "Shipped", icon: Truck, dot: "bg-indigo-500" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Navigation, dot: "bg-purple-500" },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2, dot: "bg-emerald-500" },
  { key: "CANCELLED", label: "Cancelled", icon: XCircle, dot: "bg-rose-500" },
];

export default function OrderFilterTabs({ activeStatus = "", onSelectStatus }) {
  return (
    <div className="w-full overflow-x-auto scrollbar-none py-1">
      <div className="flex items-center gap-1.5 min-w-max p-1.5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/25 shadow-xs">
        {STATUS_TABS.map((tab) => {
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
