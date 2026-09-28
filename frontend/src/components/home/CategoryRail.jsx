import React, { useRef, useState, useEffect } from "react";
import {
  Laptop,
  Smartphone,
  Headphones,
  Gamepad2,
  Monitor,
  Watch,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";

/**
 * Flipkart & Meesho Style Iconic Category Quick-Filter Rail:
 * - Horizontally swipeable on mobile/tablet devices with desktop chevron controls.
 * - 100% adaptive across Light and Dark modes.
 * - Interactive active category pill state with tactile feedback.
 * - Triggers instant client-side category filtering or route navigation.
 */
export default function CategoryRail({ activeCategory, onSelectCategory }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const categories = [
    { id: "all", name: "All Flagships", icon: Sparkles, tag: "Popular" },
    { id: "smartphones", name: "Smartphones", icon: Smartphone, tag: "5G Deals" },
    { id: "laptops", name: "Laptops & Mac", icon: Laptop, tag: "M3 / Intel" },
    { id: "audio", name: "Audio & Hi-Fi", icon: Headphones, tag: "ANC" },
    { id: "gaming", name: "Gaming Gear", icon: Gamepad2, tag: "RTX 4090" },
    { id: "monitors", name: "Displays & OLED", icon: Monitor, tag: "240Hz" },
    { id: "wearables", name: "Wearables", icon: Watch, tag: "GPS" },
    { id: "accessories", name: "Accessories", icon: Zap, tag: "Fast Charge" },
  ];

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Quick Category Filter Rail"
      className="relative w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#07080a]/90 backdrop-blur-xl py-2.5 sm:py-3 transition-colors duration-300 z-20 shadow-xs"
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative flex items-center">
        
        {/* Left Scroll Arrow Button (Desktop) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll Categories Left"
            className="hidden md:flex absolute left-2 lg:left-6 z-30 h-8 w-8 rounded-full items-center justify-center bg-white dark:bg-[#12151c] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/20 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Categories Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none py-1 w-full scroll-smooth"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`group shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950 dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] font-bold scale-[1.02]"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 hover:border-slate-300 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-slate-300 dark:hover:text-white dark:border-white/10"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive
                      ? "text-orange-400 dark:text-orange-600"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-orange-500"
                  }`}
                />
                <span className="whitespace-nowrap">{cat.name}</span>
                {cat.tag && (
                  <span
                    className={`hidden xl:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/20 dark:bg-black/15 text-white dark:text-black font-bold"
                        : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {cat.tag}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Jump to Low Stock Alerts Button */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("stock-alerts-section");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="shrink-0 ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 hover:border-red-500 text-xs font-mono font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="whitespace-nowrap">Stock Drops (≤5 Left)</span>
          </button>
        </div>

        {/* Right Scroll Arrow Button (Desktop) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll Categories Right"
            className="hidden md:flex absolute right-2 lg:right-6 z-30 h-8 w-8 rounded-full items-center justify-center bg-white dark:bg-[#12151c] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/20 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </nav>
  );
}
