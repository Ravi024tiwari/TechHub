import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  Zap,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Bot,
  ExternalLink,
  Copy,
  Check,
  Flame,
} from "lucide-react";

export default function Footer() {
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    });
  };

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText("TECHFEST50");
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2500);
  };

  return (
    <footer
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group/footer relative w-full bg-[#030508] text-white border-t border-slate-800/80 overflow-hidden text-left select-none"
    >
      
      {/* 1. Specular Metallic Top Rim Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-300/60 to-transparent pointer-events-none z-20" />

      {/* =========================================================
          2. ARCHITECTURAL SHADOW FORM "TECHHUB" WATERMARK (z-0)
          Renders as a faint, deep shadow/wireframe silhouette in the background.
          Guaranteed dim (never high brightness), with subtle wireframe stroke and deep shadow.
          ========================================================= */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        {/* Subtle Cybernetic Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.4)_51%)] bg-[length:100%_4px] pointer-events-none" />

        {/* Dynamic Cursor Spotlight (Subtle ambient cyan radar glow following cursor) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 hidden md:block"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.05), rgba(99, 102, 241, 0.02) 40%, transparent 70%)`,
          }}
        />
        
        {/* Giant Shadow-Form "TECHHUB" Brand Watermark (Wireframe Silhouette + Deep Shadow) */}
        <span
          className="font-heading font-black tracking-[-0.03em] text-[17vw] leading-none uppercase select-none whitespace-nowrap transition-all duration-700 ease-out"
          style={{
            color: isHovered ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.015)",
            WebkitTextStroke: isHovered
              ? "1px rgba(56, 189, 248, 0.12)"
              : "1px rgba(255, 255, 255, 0.04)",
            textShadow: isHovered
              ? "0 0 50px rgba(56, 189, 248, 0.08), 0 20px 80px rgba(0, 0, 0, 0.95)"
              : "0 20px 80px rgba(0, 0, 0, 0.95)",
            letterSpacing: "-0.04em",
          }}
        >
          TECHHUB
        </span>
      </div>

      {/* Ambient Deep Dark Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030508] via-transparent to-[#030508]/90 pointer-events-none z-[1]" />

      {/* Ambient Cybernetic Blue/Cyan Accent Flares */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/[0.015] blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-96 bg-cyan-600/[0.015] blur-3xl rounded-full pointer-events-none" />

      {/* =========================================================
          3. FOREGROUND CONTENT CONTAINER (z-10)
          ========================================================= */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-10 sm:pt-14 md:pt-16 pb-6 sm:pb-8">
        
        {/* =========================================================
            TOP KEYNOTE CALLOUT STRIP (Inspired by Image 1 - TRIONN)
            ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 sm:pb-12 border-b border-white/[0.08]">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/15 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-300 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              <span>THE FLAGSHIP HARDWARE SANCTUARY</span>
            </div>

            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.1] drop-shadow-md">
              Ready to build something bold?
            </h2>

            <p className="font-body text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Equip your studio, workstation, or gaming battlestation with direct OEM manufacturer stock, sealed warranties, and guaranteed express air dispatch.
            </p>
          </div>

          {/* Keynote Deals Action Button */}
          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/deals"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 sm:px-7 sm:py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-104 active:scale-96 transition-all duration-300 cursor-pointer group"
            >
              <span>Explore Keynote Deals</span>
              <ArrowRight className="h-4 w-4 text-black group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {/* =========================================================
            MULTI-COLUMN TECH & NAVIGATION GRID (Inspired by Image 3 - DECK)
            ========================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 sm:gap-10 py-10 sm:py-12 border-b border-white/[0.08]">
          
          {/* Column 1: Hardware & Computing */}
          <div className="space-y-3.5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              Hardware
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/products?category=laptops" className="hover:text-white transition-colors">
                  Laptops & MacBooks
                </Link>
              </li>
              <li>
                <Link to="/products?category=smartphones" className="hover:text-white transition-colors">
                  Flagship Smartphones
                </Link>
              </li>
              <li>
                <Link to="/products?category=audio" className="hover:text-white transition-colors">
                  Studio Audio & ANC
                </Link>
              </li>
              <li>
                <Link to="/products?category=gaming" className="hover:text-white transition-colors">
                  GeForce RTX 4090 GPUs
                </Link>
              </li>
              <li>
                <Link to="/products?category=monitors" className="hover:text-white transition-colors">
                  4K OLED Displays
                </Link>
              </li>
              <li>
                <Link to="/products?category=wearables" className="hover:text-white transition-colors">
                  Titanium Smartwatches
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Store Assurance & Care */}
          <div className="space-y-3.5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              Assurance
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>2-Year OEM Warranty</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Truck className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Insured Express Air</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                  <span>7-Day Replacement</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Zap className="h-3.5 w-3.5 text-purple-400" />
                  <span>0% No-Cost EMI</span>
                </span>
              </li>
              <li>
                <Link to="/deals" className="hover:text-white transition-colors">
                  Price Match Guarantee
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Governance */}
          <div className="space-y-3.5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              Company
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  About TechHub
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Authorized Direct Retailer
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Original Sealed Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Enterprise Procurement
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Sustainability & Recycling
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Community & Connect */}
          <div className="space-y-3.5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              Connect
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  <span>Discord Community</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>X (Twitter)</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-pink-400 transition-colors flex items-center gap-1"
                >
                  <span>Instagram</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <span>YouTube Keynotes</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5 & 6: Interactive Assistant & Utility Cards */}
          <div className="col-span-2 space-y-3.5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              Interactive Tools & Desks
            </p>

            <div className="space-y-2.5">
              {/* Card 1: Ask TechHub AI Assistant */}
              <Link
                to="/deals"
                className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/50 flex items-center justify-between gap-3 group/card transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 group-hover/card:scale-105 transition-transform">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white group-hover/card:text-cyan-300 transition-colors">
                      Ask Hardware Finder AI
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Match specs with your exact budget
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover/card:text-white group-hover/card:translate-x-1 transition-all" />
              </Link>

              {/* Card 2: 1-Click Festive Voucher Copy */}
              <div
                onClick={handleCopyVoucher}
                className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/50 flex items-center justify-between gap-3 group/voucher cursor-pointer transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 group-hover/voucher:scale-105 transition-transform">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white group-hover/voucher:text-amber-300 transition-colors">
                      Festive Code: TECHFEST50
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Extra ₹1,500 Instant Discount (Tap to Copy)
                    </p>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-white/10 text-white">
                  {copiedVoucher ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-300" />
                  )}
                </div>
              </div>

              {/* Card 3: Priority Hardware Desk */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-300 shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">
                      24/7 Verified Hardware Desk
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Direct engineering support line
                    </p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================
            BOTTOM LEGAL & OPERATIONAL STATUS BAR
            ========================================================= */}
        <div className="pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span>© 2026 TechHub Inc. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-400">Official Direct OEM Electronics Portal</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/" className="hover:text-white transition-colors">OEM Warranty Charter</Link>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>All Systems Live</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
