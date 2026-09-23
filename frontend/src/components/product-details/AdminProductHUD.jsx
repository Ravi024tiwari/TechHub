import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Edit3,
  Boxes,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import QuickStockModal from "../admin/product/QuickStockModal";

export default function AdminProductHUD({ product, currentStock, onStockUpdated }) {
  const user = useAuthStore((state) => state.user);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  // Only render for authenticated administrators
  if (user?.role !== "admin") return null;

  const stock = currentStock !== undefined ? currentStock : (Number(product.stock) || 0);
  const threshold = Number(product.lowStockThreshold) || 5;
  const isLow = stock > 0 && stock <= threshold;
  const isOut = stock === 0;

  return (
    <>
      {/* =========================================================================
          INTEGRATED PROFESSIONAL ADMIN ACTION CLUSTER (Clean, responsive, interactive)
          ========================================================================= */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
        {/* Admin Telemetry Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/30 text-sky-800 dark:text-sky-300 text-xs font-mono font-bold shadow-xs">
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOut ? "bg-rose-400" : isLow ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isOut ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
          </span>
          <ShieldAlert className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>ADMIN</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold pl-1.5 border-l border-sky-300 dark:border-sky-500/30">
            {isOut ? "0 Stock" : `${stock} Units`}
          </span>
        </div>

        {/* Action 1: Adjust Stock Button */}
        <button
          type="button"
          onClick={() => setIsStockModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-white/15 shadow-sm transition-all active:scale-95 cursor-pointer"
          title="Quick inventory stock override"
        >
          <Boxes className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
          <span>Adjust Stock</span>
        </button>

        {/* Action 2: Edit in Studio Link */}
        <Link
          to={`/admin/products/edit/${product._id}`}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-extrabold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
          title="Open product editor studio"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Studio</span>
        </Link>
      </div>

      {/* Quick Stock Modal */}
      {isStockModalOpen && (
        <QuickStockModal
          product={product}
          onClose={() => setIsStockModalOpen(false)}
          onSuccess={(id, newStock) => {
            if (onStockUpdated) onStockUpdated(newStock);
          }}
        />
      )}
    </>
  );
}
