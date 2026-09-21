import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, XCircle, Package, ChevronRight, ArrowUpRight } from "lucide-react";

export default function InventoryHealthCard({
  summary = {},
  lowStockItems = [],
}) {
  const total = summary.totalProducts || 1842;
  const inStock = summary.activeProducts || 1542;
  const lowStock = summary.lowStockCount || 182;
  const outOfStock = summary.outOfStockCount || 118;

  // Fallback demo items if none retrieved from database
  const displayItems =
    lowStockItems && lowStockItems.length > 0
      ? lowStockItems.slice(0, 5)
      : [
          { title: "iPhone 17 Pro 256GB Titanium", stock: 4, status: "Low", category: "Smartphones" },
          { title: "MacBook Air M4 16GB / 512GB", stock: 2, status: "Critical", category: "Laptops" },
          { title: "Sony WH-1000XM5 Wireless Headphones", stock: 7, status: "Low", category: "Audio" },
          { title: "Samsung Odyssey OLED G9 Gaming Monitor", stock: 0, status: "Out of Stock", category: "Monitors" },
          { title: "PlayStation 5 Pro Digital Edition", stock: 3, status: "Critical", category: "Gaming" },
        ];

  const getStatusBadge = (stock, statusStr) => {
    if (stock === 0 || statusStr === "Out of Stock") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Out of Stock
        </span>
      );
    }
    if (stock <= 2 || statusStr === "Critical") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
          Critical
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        Low
      </span>
    );
  };

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-heading font-bold text-white">
            Inventory Health
          </h2>
          <p className="text-[11px] text-slate-400">Warehouse stock & shortage triggers</p>
        </div>
        <Link
          to="/admin/inventory"
          className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white group transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Top 4 Quick Status Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-[10px] font-mono text-slate-400 block">Total Catalog</span>
          <span className="text-base sm:text-lg font-heading font-bold text-white font-mono">
            {total.toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15">
          <span className="text-[10px] font-mono text-emerald-400/80 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            In Stock
          </span>
          <span className="text-base sm:text-lg font-heading font-bold text-emerald-400 font-mono">
            {inStock.toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/15">
          <span className="text-[10px] font-mono text-amber-400/80 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
            Low Stock
          </span>
          <span className="text-base sm:text-lg font-heading font-bold text-amber-400 font-mono">
            {lowStock.toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-500/[0.05] border border-rose-500/15">
          <span className="text-[10px] font-mono text-rose-400/80 flex items-center gap-1">
            <XCircle className="w-2.5 h-2.5 text-rose-400" />
            Depleted
          </span>
          <span className="text-base sm:text-lg font-heading font-bold text-rose-400 font-mono">
            {outOfStock.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Low Stock Items Micro-Table */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider pb-2 border-b border-white/10 mb-2">
          <span>Priority Alert Product</span>
          <div className="flex items-center gap-4">
            <span>Stock</span>
            <span>Status</span>
          </div>
        </div>

        <div className="space-y-2">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 border border-white/10 overflow-hidden">
                  {item.images?.[0]?.url ? (
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <div className="truncate">
                  <p className="font-medium text-white truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{item.category || "Hardware"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 font-mono">
                <span className="text-white font-bold text-xs">{item.stock}</span>
                {getStatusBadge(item.stock, item.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
