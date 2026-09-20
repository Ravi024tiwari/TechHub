import React from "react";
import { Link } from "react-router-dom";
import { Cpu, ShieldCheck, Truck, RefreshCw, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#050608] text-white pt-12 pb-8">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-white/[0.08] text-left">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                TECHHUB
              </span>
            </Link>
            <p className="font-body text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Precision flagship electronics, high-performance computing, audiophile hardware, and next-gen gear engineered with uncompromising craftsmanship.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Official Authorized Direct Retailer</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <p className="font-heading text-xs font-bold uppercase tracking-wider text-white">
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
                  Smartphones & Tablets
                </Link>
              </li>
              <li>
                <Link to="/products?category=audio" className="hover:text-white transition-colors">
                  Studio Audio & ANC
                </Link>
              </li>
              <li>
                <Link to="/products?category=gaming" className="hover:text-white transition-colors">
                  Gaming Gear & GPUs
                </Link>
              </li>
              <li>
                <Link to="/products?category=monitors" className="hover:text-white transition-colors">
                  4K OLED Displays
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <p className="font-heading text-xs font-bold uppercase tracking-wider text-white">
              Customer Care
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="hover:text-white transition-colors">
                  2-Year Warranty Claim
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white transition-colors">
                  7-Day Replacement
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Hardware FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Guarantees */}
          <div className="space-y-3">
            <p className="font-heading text-xs font-bold uppercase tracking-wider text-white">
              Guarantees
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-slate-400" />
                <span>Express Insured Shipping</span>
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                <span>Hassle-Free Returns</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-slate-400" />
                <span>Authentic Brand Seal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TECHHUB Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>256-Bit SSL Encrypted</span>
            <span>·</span>
            <span>Razorpay Secure</span>
            <span>·</span>
            <span>PCI-DSS Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
