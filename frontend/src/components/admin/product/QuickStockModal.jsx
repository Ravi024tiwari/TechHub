import React, { useState } from "react";
import { X, Boxes, Plus, Minus, Check, Loader2 } from "lucide-react";
import { updateProductStock } from "../../../api/adminApi";

export default function QuickStockModal({
  product,
  onClose,
  onSuccess,
}) {
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!product) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await updateProductStock(product._id, Number(stock), "set");
      onSuccess(product._id, Number(stock));
      onClose();
    } catch (err) {
      console.error("Stock update failed:", err);
      setError(err.userMessage || "Failed to update stock quantity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card w-full max-w-sm p-6 relative border border-white/20 shadow-2xl space-y-5">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-white leading-tight">
              Quick Stock Adjustment
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Immediate warehouse inventory sync
            </p>
          </div>
        </div>

        {/* Product mini preview */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
          <img
            src={product.images?.[0]?.url || product.image || ""}
            alt={product.title}
            className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{product.title}</p>
            <p className="text-[10px] font-mono text-slate-400">Current: {product.stock} units</p>
          </div>
        </div>

        {/* Stepper controls */}
        <div className="space-y-2 text-center">
          <label className="text-xs font-mono text-slate-400 block">
            Set Physical Units Available
          </label>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setStock((prev) => Math.max(0, Number(prev) - 1))}
              disabled={loading || stock <= 0}
              className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white disabled:opacity-40 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-24 text-center py-2 px-3 rounded-xl bg-white/[0.04] border border-white/20 text-xl font-mono font-extrabold text-white focus:outline-none focus:border-sky-400"
            />

            <button
              type="button"
              onClick={() => setStock((prev) => Number(prev) + 1)}
              disabled={loading}
              className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex justify-center gap-2 pt-1">
            {[0, 5, 10, 25, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setStock(preset)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                {preset === 0 ? "Out" : `+${preset}`}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg text-center font-mono">
            {error}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-1/2 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-1/2 py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-slate-200 shadow-lg shadow-white/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Stock</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
