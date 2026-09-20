import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Flame,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Tag,
  Copy,
  Check,
  Percent,
} from "lucide-react";
import festiveBannerImg from "@/assets/festive-sale-banner.jpg";

export default function OffersSpotlightBanner() {
  const navigate = useNavigate();

  // Real-time flash deals countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 6,
    minutes: 24,
    seconds: 18,
  });

  // Voucher copy state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (num) => String(num).padStart(2, "0");

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText("TECHFEST50");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const quickDeals = [
    { label: "💻 Laptops: Save ₹40K", link: "/deals?category=laptops" },
    { label: "🎮 GPUs: Save ₹25K", link: "/deals?category=computing" },
    { label: "🎧 Audio: 23% Off", link: "/deals?category=audio" },
  ];

  return (
    <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-2 sm:py-3.5">
      {/* Outer Banner Card with Warm Golden Metallic Rim */}
      <div
        onClick={() => navigate("/deals")}
        className="group relative w-full rounded-2xl sm:rounded-3xl border-2 border-amber-400/50 hover:border-amber-300 bg-[#0f1117] shadow-[0_6px_28px_rgba(245,158,11,0.16)] hover:shadow-[0_10px_38px_rgba(245,158,11,0.25)] transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* =========================================================
            1. HERO FESTIVE BANNER ARTWORK
            Compact, panoramic height across mobile, tablet, and desktop
            ========================================================= */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100">
          <img
            src={festiveBannerImg}
            alt="Mega Indian Festive Sale - Up To 50% Off Electronics"
            className="w-full h-44 sm:h-52 md:h-60 lg:h-64 xl:h-72 object-cover object-center group-hover:scale-[1.015] transition-transform duration-700 ease-out"
            loading="lazy"
          />

          {/* Floating Subtle Top-Left Status Pill */}
          <div className="absolute top-2.5 left-3 sm:top-3 sm:left-4 z-10 pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/75 border border-amber-400/60 text-amber-300 text-[10px] sm:text-xs font-mono font-black shadow-md backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>LIVE FESTIVE OFFERS</span>
            </div>
          </div>

          {/* Floating Top-Right Instant Voucher Badge */}
          <div className="absolute top-2.5 right-3 sm:top-3 sm:right-4 z-10">
            <button
              onClick={handleCopyCode}
              title="Click to copy coupon code"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/80 hover:bg-black border border-amber-400/70 text-amber-300 text-[10px] sm:text-xs font-mono font-bold shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Tag className="h-3 w-3 text-amber-400" />
              <span>Code: TECHFEST50</span>
              {copied ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3 text-amber-300/80" />
              )}
            </button>
          </div>
        </div>

        {/* =========================================================
            2. PRODUCTION-GRADE INTERACTIVE BOTTOM ACTION STRIP (Sleek & Compact)
            ========================================================= */}
        <div className="relative z-10 w-full px-3 py-2 sm:px-6 sm:py-2.5 bg-[#0b0e14] border-t border-amber-400/30 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          
          {/* Real-Time Flash Countdown Timer */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-mono text-amber-400/90 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden xs:inline">Sale Ends:</span>
            </span>
            <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-black">
              <span className="px-1.5 py-0.5 rounded-md bg-black border border-amber-400/40 text-amber-300 shadow-inner">
                {formatDigits(timeLeft.hours)}h
              </span>
              <span className="text-amber-400 font-bold">:</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black border border-amber-400/40 text-amber-300 shadow-inner">
                {formatDigits(timeLeft.minutes)}m
              </span>
              <span className="text-amber-400 font-bold">:</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black border border-amber-400/40 text-amber-300 shadow-inner">
                {formatDigits(timeLeft.seconds)}s
              </span>
            </div>
          </div>

          {/* Quick Category Deal Shortcut Pills */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="hidden md:flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("stock-alerts-section");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>⚡ Low Stock Alerts</span>
            </button>

            {quickDeals.map((deal, idx) => (
              <Link
                key={idx}
                to={deal.link}
                className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-white/[0.06] hover:bg-amber-400/20 text-slate-200 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 transition-all whitespace-nowrap cursor-pointer"
              >
                {deal.label}
              </Link>
            ))}
          </div>

          {/* Primary High-Impact CTA Button */}
          <div className="flex items-center gap-2 ml-auto">
            <Link
              to="/deals"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-103 active:scale-97 transition-all cursor-pointer"
            >
              <span>Explore All Deals</span>
              <ArrowRight className="h-3.5 w-3.5 text-black group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
