import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";

/**
 * Production-Grade Empty Shopping Bag Component
 */
export default function CartEmptyState() {
  return (
    <div className="py-16 sm:py-24 text-center max-w-md mx-auto">
      <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-5 shadow-xs">
        <ShoppingBag className="h-10 w-10 text-slate-400" />
      </div>
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Your Shopping Bag is Empty
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-sans">
        Explore our flagship computing workstations, studio displays, and audio flagships to start your order.
      </p>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
      >
        <span>Explore Products</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
