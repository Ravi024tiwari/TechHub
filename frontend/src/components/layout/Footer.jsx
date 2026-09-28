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
  ArrowUp,
  Mail,
  Send,
} from "lucide-react";

export default function Footer() {
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setIsSubscribed(false);
    }, 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group/footer relative w-full bg-slate-950 dark:bg-[#030508] text-white border-t border-slate-200 dark:border-white/[0.08] overflow-hidden text-left select-none transition-colors duration-300"
    >
      {/* 1. Specular Metallic Top Rim Accent Line (Cyber Orange & Slate Beam) */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 dark:via-orange-400/40 to-transparent pointer-events-none z-20" />

      {/* =========================================================
          2. ARCHITECTURAL SHADOW FORM "TECHHUB" WATERMARK (z-0)
          Renders as a faint, deep shadow/wireframe silhouette in the background.
          ========================================================= */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        {/* Subtle Cybernetic Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.4)_51%)] bg-[length:100%_4px] pointer-events-none opacity-60" />

        {/* Dynamic Cursor Spotlight (Subtle ambient orange radar glow following cursor on desktop) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 hidden md:block"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(249, 115, 22, 0.07), rgba(245, 158, 11, 0.03) 40%, transparent 70%)`,
          }}
        />

        {/* Giant Shadow-Form "TECHHUB" Brand Watermark (Wireframe Silhouette + Deep Shadow) */}
        <span
          className="font-heading font-black tracking-[-0.03em] text-[17vw] leading-none uppercase select-none whitespace-nowrap transition-all duration-700 ease-out"
          style={{
            color: isHovered
              ? "rgba(255, 255, 255, 0.035)"
              : "rgba(255, 255, 255, 0.015)",
            WebkitTextStroke: isHovered
              ? "1px rgba(249, 115, 22, 0.14)"
              : "1px rgba(255, 255, 255, 0.04)",
            textShadow: isHovered
              ? "0 0 50px rgba(249, 115, 22, 0.1), 0 20px 80px rgba(0, 0, 0, 0.95)"
              : "0 20px 80px rgba(0, 0, 0, 0.95)",
            letterSpacing: "-0.04em",
          }}
        >
          TECHHUB
        </span>
      </div>

      {/* Ambient Deep Dark Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950 dark:from-[#030508]/80 dark:to-[#030508] pointer-events-none z-[1]" />

      {/* Ambient Warm Cyber Orange Flares */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/[0.03] dark:bg-orange-600/[0.025] blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-96 bg-amber-500/[0.025] dark:bg-amber-500/[0.02] blur-3xl rounded-full pointer-events-none" />

      {/* =========================================================
          3. FOREGROUND CONTENT CONTAINER (z-10)
          ========================================================= */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-10 sm:pt-14 md:pt-16 pb-6 sm:pb-8">
        {/* =========================================================
            TOP KEYNOTE CALLOUT STRIP: Responsive Hero Action
            ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 sm:pb-12 border-b border-white/[0.08]">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/25 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-orange-400 shadow-2xs backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-orange-400 shrink-0" />
              <span>THE FLAGSHIP HARDWARE SANCTUARY</span>
            </div>

            <h2 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.1] drop-shadow-md">
              Ready to build something{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                bold?
              </span>
            </h2>

            <p className="font-body text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Equip your studio, workstation, or gaming battlestation with direct
              OEM manufacturer stock, sealed warranties, and guaranteed express
              air dispatch.
            </p>
          </div>

          {/* Keynote Deals Action Button & Newsletter Strip */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Interactive Hardware Newsletter Dispatch Form */}
            <form
              onSubmit={handleSubscribe}
              className="relative flex items-center w-full sm:w-72"
            >
              <div className="relative w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Drop alerts newsletter..."
                  disabled={isSubscribed}
                  className="w-full h-11 pl-9 pr-24 rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.1] border border-white/10 focus:border-orange-500/50 text-white placeholder-slate-400 text-xs font-medium focus:outline-none transition-all shadow-inner"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <button
                  type="submit"
                  disabled={isSubscribed}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isSubscribed
                      ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-xs"
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <Check className="h-3 w-3 stroke-[3]" />
                      <span>Joined</span>
                    </>
                  ) : (
                    <>
                      <span>Join</span>
                      <Send className="h-2.5 w-2.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <Link
              to="/deals"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-white hover:bg-orange-500 text-slate-950 hover:text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-[0_0_25px_rgba(249,115,22,0.35)] active:scale-95 transition-all duration-300 cursor-pointer group shrink-0"
            >
              <span>Explore Deals</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
        </div>

        {/* =========================================================
            MULTI-COLUMN TECH & NAVIGATION GRID
            ========================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-10 py-10 sm:py-12 border-b border-white/[0.08]">
          {/* Column 1: Hardware & Computing */}
          <div className="space-y-3.5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              Hardware
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link
                  to="/products?category=laptops"
                  className="hover:text-orange-400 transition-colors"
                >
                  Laptops & MacBooks
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=smartphones"
                  className="hover:text-orange-400 transition-colors"
                >
                  Flagship Smartphones
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=audio"
                  className="hover:text-orange-400 transition-colors"
                >
                  Studio Audio & ANC
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=gaming"
                  className="hover:text-orange-400 transition-colors"
                >
                  GeForce RTX 4090 GPUs
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=monitors"
                  className="hover:text-orange-400 transition-colors"
                >
                  4K OLED Displays
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=wearables"
                  className="hover:text-orange-400 transition-colors"
                >
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
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>2-Year OEM Warranty</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Truck className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span>Insured Express Air</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <RefreshCw className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>7-Day Replacement</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Zap className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>0% No-Cost EMI</span>
                </span>
              </li>
              <li>
                <Link
                  to="/deals"
                  className="hover:text-orange-400 transition-colors"
                >
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
                <Link to="/" className="hover:text-orange-400 transition-colors">
                  About TechHub
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">
                  Authorized Direct Retailer
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">
                  Original Sealed Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">
                  Enterprise Procurement
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">
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
                  className="hover:text-orange-400 transition-colors flex items-center gap-1"
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

          {/* Column 5 & 6: Interactive Tools & Desks */}
          <div className="col-span-2 space-y-3.5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              Interactive Tools & Desks
            </p>

            <div className="space-y-2.5">
              {/* Card 1: Ask TechHub AI Assistant */}
              <Link
                to="/deals"
                className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-orange-500/50 flex items-center justify-between gap-3 group/card transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-400 shrink-0 group-hover/card:scale-105 transition-transform">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white group-hover/card:text-orange-400 transition-colors">
                      Ask Hardware Finder AI
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Match specs with your exact budget
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover/card:text-white group-hover/card:translate-x-1 transition-all" />
              </Link>

              {/* Card 2: 1-Click Festive Voucher Copy with Live Tooltip */}
              <div
                onClick={handleCopyVoucher}
                className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/50 flex items-center justify-between gap-3 group/voucher cursor-pointer transition-all duration-300 backdrop-blur-sm relative"
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
                <div
                  className={`p-1.5 rounded-lg transition-all ${
                    copiedVoucher
                      ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : "bg-white/10 text-slate-300 hover:text-white"
                  }`}
                >
                  {copiedVoucher ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
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
            BOTTOM LEGAL & OPERATIONAL STATUS BAR + BACK TO TOP
            ========================================================= */}
        <div className="pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span>© 2026 TechHub Inc. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-400">
              Official Direct OEM Electronics Portal
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/" className="hover:text-white transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link to="/" className="hover:text-white transition-colors">
              OEM Warranty Charter
            </Link>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>All Systems Live</span>
            </span>

            {/* Interactive Smooth Scroll-to-Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              title="Back to Top"
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 text-[10px] font-mono cursor-pointer transition-all active:scale-95"
            >
              <ArrowUp className="h-3 w-3 text-orange-400" />
              <span>Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
