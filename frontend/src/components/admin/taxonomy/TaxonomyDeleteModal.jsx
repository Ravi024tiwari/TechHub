import React, { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { deleteAdminCategory, deleteAdminBrand } from "../../../api/adminApi";

export default function TaxonomyDeleteModal({
  isOpen,
  onClose,
  item = null,
  type = "category", // "category" | "brand"
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !item) return null;

  const count = item.productCount || 0;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      if (type === "category") {
        await deleteAdminCategory(item._id);
      } else {
        await deleteAdminBrand(item._id);
      }

      onDeleted(item._id, type);
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err.response?.data?.message || err.message || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-[#0c0f16] border border-rose-200 dark:border-rose-500/30 rounded-2xl shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-rose-50/70 dark:bg-rose-500/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Delete {type === "category" ? "Category" : "Brand"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <span className="text-slate-900 dark:text-white font-bold font-mono">"{item.name}"</span>? This action cannot be undone.
          </p>

          {count > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold font-mono">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Active Catalog Products Linked</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-200/80 leading-normal">
                There are currently <strong className="text-slate-900 dark:text-white font-mono">{count}</strong> active products registered under this {type}. Deleting it will disassociate these catalog items.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2 px-4 rounded-xl text-xs font-mono font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="py-2 px-5 rounded-xl text-xs font-mono font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Delete Permanently</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
