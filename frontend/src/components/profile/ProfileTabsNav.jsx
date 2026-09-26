import React from "react";
import { Link } from "react-router-dom";
import { User, MapPin, Lock, LayoutDashboard } from "lucide-react";

/**
 * Production-Grade Dynamic Tab Navigation Pill Bar:
 * - Responsive: Short labels on mobile (Details, Addresses, Security),
 *   expanding to full labels on tablet/desktop.
 * - Color-coded per tab:
 *   - Personal Details: Electric Sky Blue
 *   - Saved Addresses: Emerald / Jade Green
 *   - Password & Security: Vibrant Cyber Orange
 * - Smooth micro-animations and glowing accent indicators.
 */
export default function ProfileTabsNav({ activeTab, onTabChange, addressCount = 0 }) {
  const tabs = [
    {
      id: "details",
      shortLabel: "Details",
      label: "Personal Details & Photo",
      icon: User,
      activeClass:
        "bg-white dark:bg-[#0c0f17] text-sky-600 dark:text-sky-400 border-sky-500/40 ring-1 ring-sky-500/25 shadow-md shadow-sky-500/10",
      activeIconClass: "text-sky-500 dark:text-sky-400",
      hoverClass: "hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-500/5",
      accentDot: "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]",
    },
    {
      id: "addresses",
      shortLabel: "Addresses",
      label: "Saved Addresses",
      count: addressCount,
      icon: MapPin,
      activeClass:
        "bg-white dark:bg-[#0c0f17] text-emerald-600 dark:text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/25 shadow-md shadow-emerald-500/10",
      activeIconClass: "text-emerald-500 dark:text-emerald-400",
      hoverClass: "hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5",
      accentDot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
    },
    {
      id: "security",
      shortLabel: "Security",
      label: "Password & Security",
      icon: Lock,
      activeClass:
        "bg-white dark:bg-[#0c0f17] text-orange-600 dark:text-orange-400 border-orange-500/40 ring-1 ring-orange-500/25 shadow-md shadow-orange-500/10",
      activeIconClass: "text-orange-500 dark:text-orange-400",
      hoverClass: "hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/5",
      accentDot: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]",
    },
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`group relative flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-heading text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-95 border ${
              isActive
                ? tab.activeClass
                : `border-transparent text-slate-600 dark:text-slate-400 ${tab.hoverClass}`
            }`}
          >
            {/* Glowing Accent Dot for active state */}
            {isActive && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${tab.accentDot} transition-all duration-300 animate-pulse shrink-0`}
              />
            )}

            <Icon
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors duration-200 shrink-0 ${
                isActive ? tab.activeIconClass : "text-slate-400 group-hover:text-current"
              }`}
            />

            {/* Responsive text label: short on mobile, full on tablet/desktop */}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden inline">{tab.shortLabel}</span>

            {/* Optional Counter for Addresses */}
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 sm:py-0.5 rounded-md text-[10px] font-mono font-bold transition-colors ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}

      {/* Direct Quick Jump to Customer VIP Dashboard */}
      <Link
        to="/dashboard"
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-heading font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 transition-all shrink-0 ml-auto shadow-sm"
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">VIP Dashboard</span>
        <span className="sm:hidden inline">Dashboard</span>
        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/25 text-sky-600 dark:text-sky-300 font-bold uppercase">
          Live
        </span>
      </Link>
    </div>
  );
}
