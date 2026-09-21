import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { deleteProduct } from "../../../api/adminApi";

export default function DeleteConfirmModal({
  product,
  onClose,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!product) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await deleteProduct(product._id);
      onDeleted(product._id);
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err.userMessage || "Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card w-full max-w-sm p-6 relative border border-rose-500/30 shadow-2xl space-y-4">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-white">
              Delete Product?
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Permanent catalog removal
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
          <img
            src={product.images?.[0]?.url || product.image || ""}
            alt={product.title}
            className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{product.title}</p>
            <p className="text-[10px] font-mono text-slate-400">
              SKU: {product.sku || "N/A"}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Are you sure you want to permanently remove this product? This action will also delete all associated Cloudinary images and cannot be undone.
        </p>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg font-mono">
            {error}
          </p>
        )}

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
            onClick={handleDelete}
            disabled={loading}
            className="w-1/2 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
