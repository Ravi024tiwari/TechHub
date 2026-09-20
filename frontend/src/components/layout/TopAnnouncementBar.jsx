import React, { useState } from "react";
import { Sparkles, ShieldCheck, Truck, X } from "lucide-react";

export default function TopAnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-[#0d1017] via-[#141923] to-[#0d1017] border-b border-white/[0.06] text-slate-300 text-[11px] sm:text-xs py-1.5 px-4 sm:px-8 relative overflow-hidden transition-all">
      {/* Ambient silver shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none animate-pulse" />

      <div className="w-full flex items-center justify-between gap-4">
        {/* Left highlight badge */}
        <div className="hidden md:flex items-center gap-2 text-slate-400 font-mono text-[10px] tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300 font-semibold uppercase">Official Retailer</span>
        </div>

        {/* Center rotating or combined banner */}
        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-6 text-center truncate">
          <span className="flex items-center gap-1.5 text-white font-medium">
            <Sparkles className="h-3 w-3 text-amber-300 shrink-0" />
            <span>Launch Offer: Get up to ₹10,000 instant cashback with code <strong className="text-amber-200 font-mono font-bold tracking-wider">TECHPRO</strong></span>
          </span>
          <span className="hidden lg:inline-flex text-white/20">•</span>
          <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-300">
            <Truck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>Free Express Delivery across India</span>
          </span>
          <span className="hidden xl:inline-flex text-white/20">•</span>
          <span className="hidden xl:inline-flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>100% Genuine Brand Warranty</span>
          </span>
        </div>

        {/* Right close button */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss announcement"
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
