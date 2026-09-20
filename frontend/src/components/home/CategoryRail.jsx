import React from "react";
import { Laptop, Smartphone, Headphones, Gamepad2, Monitor, Watch, Zap, Sparkles } from "lucide-react";

/**
 * Flipkart & Meesho Style Iconic Category Quick-Filter Rail:
 * - Horizontally swipeable on mobile/tablet devices.
 * - Interactive active category pill state.
 * - Triggers instant client-side category filtering or route navigation.
 */
export default function CategoryRail({ activeCategory, onSelectCategory }) {
  const categories = [
    { id: "all", name: "All Gear", icon: Sparkles },
    { id: "laptops", name: "Laptops", icon: Laptop },
    { id: "smartphones", name: "Smartphones", icon: Smartphone },
    { id: "audio", name: "Audio & Hi-Fi", icon: Headphones },
    { id: "gaming", name: "Gaming Gear", icon: Gamepad2 },
    { id: "monitors", name: "Displays & TVs", icon: Monitor },
    { id: "wearables", name: "Wearables", icon: Watch },
    { id: "accessories", name: "Accessories", icon: Zap },
  ];

  return (
    <section className="w-full border-b border-white/[0.06] bg-[#07080a]/60 backdrop-blur-md py-2.5 sm:py-3.5">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-102"
                    : "bg-white/[0.035] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-black" : "text-slate-400"
                  }`}
                />
                <span className="whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}

          {/* Quick Jump to Low Stock Alerts Section */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("stock-alerts-section");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="shrink-0 ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600/25 via-amber-500/25 to-red-600/25 border-2 border-red-500/50 hover:border-red-400 text-amber-300 hover:text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="whitespace-nowrap">🚨 Stock Alerts (≤5 Left)</span>
          </button>
        </div>
      </div>
    </section>
  );
}
