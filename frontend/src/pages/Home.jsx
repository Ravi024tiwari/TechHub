import React from "react";
import { Link } from "react-router-dom";
import { Cpu, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";
import AuthBackground from "@/components/common/AuthBackground";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#07080a] text-white flex flex-col selection:bg-white/20 selection:text-white relative overflow-hidden">
      {/* Interactive Silver Keynote Background */}
      <AuthBackground watermarkLines={["TECH", "HAVEN"]} />

      {/* Modern Glass Navbar */}
      <header className="glass-panel sticky top-0 z-50 px-6 sm:px-12 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-white">
            TECHHAVEN
          </span>
        </Link>

        {/* Navigation Links & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/login"
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="btn-pill-primary text-xs sm:text-sm !py-2 !px-4"
          >
            Join TechHaven
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24 relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-tech text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-slate-300" />
          <span>PRO HARDWARE · 2026 ARCHITECTURE READY</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            The Precision Standard in{" "}
            <span className="text-gradient-silver">Modern Electronics.</span>
          </h1>
          <p className="font-body text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Studio displays, high-performance computing, audiophile hardware, and next-gen gadgets — engineered with uncompromising craftsmanship.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center">
          <Link
            to="/signup"
            className="btn-pill-primary w-full sm:w-auto text-base !py-3 !px-8 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <span>Create Member Account</span>
            <ArrowRight className="h-4 w-4 text-black" />
          </Link>
          <Link
            to="/login"
            className="btn-pill-secondary w-full sm:w-auto text-base !py-3 !px-8"
          >
            Existing Member Sign In
          </Link>
        </div>

        {/* Feature Highlights Grid with Silver Backlight Shadow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 w-full text-left">
          <div className="glass-card-silver p-5">
            <Zap className="h-5 w-5 text-amber-300 mb-3" />
            <h3 className="font-heading font-semibold text-white text-sm mb-1">
              Flash Deal Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time stock quota reservation and exclusive 2-hour early access drops.
            </p>
          </div>
          <div className="glass-card-silver p-5">
            <ShieldCheck className="h-5 w-5 text-cyan-300 mb-3" />
            <h3 className="font-heading font-semibold text-white text-sm mb-1">
              Digital Warranty Vault
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-registered serial numbers with 1-click doorstep hardware replacement.
            </p>
          </div>
          <div className="glass-card-silver p-5">
            <Cpu className="h-5 w-5 text-purple-300 mb-3" />
            <h3 className="font-heading font-semibold text-white text-sm mb-1">
              Razorpay Secured
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              HMAC-SHA256 cryptographically verified payments and Cash on Delivery.
            </p>
          </div>
        </div>
      </main>

      {/* Simple Clean Footer */}
      <footer className="border-t border-white/[0.06] py-6 px-6 text-center text-xs text-slate-500 font-tech">
        TechHaven Hardware & Systems Architecture © 2026. All rights reserved.
      </footer>
    </div>
  );
}
