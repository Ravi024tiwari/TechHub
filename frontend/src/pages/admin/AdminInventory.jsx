import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function AdminInventory() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-white">Inventory & Stock Alerts</h1>
          <p className="text-xs text-slate-400">Monitor depleted or low inventory stock across categories.</p>
        </div>
      </div>

      <div className="glass-card p-8 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-heading font-bold text-white mb-2">Live Inventory Monitoring</h3>
        <p className="text-xs text-slate-400 mb-6">
          Real-time low-stock threshold triggers and quick replenishment actions.
        </p>
        <Link to="/admin" className="btn-pill-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
