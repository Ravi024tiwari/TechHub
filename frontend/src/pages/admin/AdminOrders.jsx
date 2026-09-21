import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function AdminOrders() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-white">Customer Orders</h1>
          <p className="text-xs text-slate-400">Track and fulfill customer orders and manage payment states.</p>
        </div>
      </div>

      <div className="glass-card p-8 text-center max-w-xl mx-auto my-12">
        <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-heading font-bold text-white mb-2">Order Fulfillment Portal</h3>
        <p className="text-xs text-slate-400 mb-6">
          Phase 3 will implement order tracking updates, invoice generation, and fulfillment workflows.
        </p>
        <Link to="/admin" className="btn-pill-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
