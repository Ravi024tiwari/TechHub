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
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
          isOpen
            ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
        }`}
      >
        <span>Categories</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : "text-slate-400"
          }`}
        />
      </button>

      {/* Mega Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[720px] rounded-2xl bg-[#090b10]/95 backdrop-blur-2xl border border-white/15 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-12 gap-5">
            {/* Left: 6 Category Cards (8 Cols) */}
            <div className="col-span-8">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.06]">
                <span className="text-[11px] font-tech uppercase tracking-widest text-slate-400">
                  Featured Hardware Categories
                </span>
                <Link
                  to="/categories"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
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
                      className="group p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-all flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-white/[0.06] text-slate-300 group-hover:text-white group-hover:bg-white/15 transition-colors shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {cat.name}
                          </span>
                          {cat.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-white/10 text-white font-mono">
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {cat.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Flagship Spotlight Pick (4 Cols) */}
            <div className="col-span-4 rounded-xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 p-4 flex flex-col justify-between relative overflow-hidden group">
              {/* Background ambient light */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                  <span>Spotlight Deal</span>
                </div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  MacBook Pro M3 Max
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Up to 128GB Unified Memory with Liquid Retina XDR display.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] mt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block leading-none">Starting from</span>
                  <span className="text-xs font-bold text-white font-mono">₹2,49,900</span>
                </div>
                <Link
                  to="/product/apple-macbook-pro-16-m3-max"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all"
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
