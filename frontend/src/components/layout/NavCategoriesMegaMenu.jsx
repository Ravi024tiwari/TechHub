import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Laptop,
  Smartphone,
  Headphones,
  Monitor,
  Gamepad2,
  Watch,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";

const CATEGORY_ITEMS = [
  {
    name: "Laptops & MacBooks",
    slug: "laptops",
    desc: "Apple Silicon M3, Intel Core Ultra & ThinkPads",
    icon: Laptop,
    badge: "Hot",
  },
  {
    name: "Smartphones & Tablets",
    slug: "smartphones",
    desc: "iPhone 16 Pro, Galaxy S24 Ultra & iPads",
    icon: Smartphone,
    badge: "New",
  },
  {
    name: "Audio & Studio Gear",
    slug: "audio",
    desc: "Sony XM5, Bose ANC & Audiophile IEMs",
    icon: Headphones,
  },
  {
    name: "Monitors & Displays",
    slug: "monitors",
    desc: "4K OLED, 240Hz High Refresh Gaming",
    icon: Monitor,
  },
  {
    name: "Gaming Hardware & GPUs",
    slug: "gaming",
    desc: "NVIDIA RTX 4090, PS5 Pro & Custom Rigs",
    icon: Gamepad2,
    badge: "Trending",
  },
  {
    name: "Smart Wearables",
    slug: "wearables",
    desc: "Apple Watch Ultra 2, Garmin Fitness GPS",
    icon: Watch,
  },
];

export default function NavCategoriesMegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-heading font-bold tracking-wide transition-all cursor-pointer border select-none ${
          isOpen
            ? "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:bg-white/10 dark:text-white dark:border-white/20 shadow-xs"
            : "bg-slate-100 hover:bg-slate-200/90 text-slate-800 hover:text-slate-950 border-slate-200/90 hover:border-slate-300 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] dark:text-slate-200 dark:hover:text-white dark:border-white/10 shadow-2xs"
        }`}
      >
        <span>Categories</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-orange-500 dark:text-white" : "text-slate-500 dark:text-slate-400"
          }`}
        />
      </button>

      {/* Mega Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[720px] rounded-2xl bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-12 gap-5">
            {/* Left: 6 Category Cards (8 Cols) */}
            <div className="col-span-8">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <span className="text-[11px] font-tech uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
                  Featured Hardware Categories
                </span>
                <Link
                  to="/categories"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-orange-600 dark:text-slate-300 hover:text-orange-700 dark:hover:text-white font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Browse All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_ITEMS.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="group p-2.5 rounded-xl bg-slate-50/70 hover:bg-orange-50/70 dark:bg-white/[0.02] dark:hover:bg-white/[0.08] border border-slate-200/70 hover:border-orange-300 dark:border-transparent dark:hover:border-white/10 transition-all flex items-start gap-3 cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:bg-white/[0.06] dark:text-slate-300 group-hover:bg-orange-500 group-hover:text-white dark:group-hover:bg-white/15 dark:group-hover:text-white transition-all shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-cyan-300 transition-colors truncate">
                            {cat.name}
                          </span>
                          {cat.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-700 dark:bg-white/10 dark:text-white font-mono">
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {cat.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Flagship Spotlight Pick (4 Cols) */}
            <div className="col-span-4 rounded-xl bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-slate-50 dark:from-white/[0.06] dark:to-white/[0.02] border border-orange-500/20 dark:border-white/10 p-4 flex flex-col justify-between relative overflow-hidden group">
              {/* Background ambient light */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-700 dark:bg-white/10 dark:text-white text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="h-2.5 w-2.5 text-orange-500 dark:text-amber-300" />
                  <span>Spotlight Deal</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  MacBook Pro M3 Max
                </h4>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Up to 128GB Unified Memory with Liquid Retina XDR display.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] mt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-none">Starting from</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">₹2,49,900</span>
                </div>
                <Link
                  to="/product/apple-macbook-pro-16-m3-max"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                >
                  <span>Explore</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
