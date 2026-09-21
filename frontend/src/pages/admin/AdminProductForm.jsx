import React from "react";
import { Link } from "react-router-dom";
import { PlusCircle, ArrowLeft } from "lucide-react";

export default function AdminProductForm() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-white/10">
        <Link
          to="/admin/products"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-white">Create New Product</h1>
          <p className="text-xs text-slate-400">Add a product with specifications, pricing, and multi-image upload.</p>
        </div>
      </div>

      <div className="glass-card p-8 text-center max-w-xl mx-auto my-12">
        <PlusCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-heading font-bold text-white mb-2">Multi-Image Product Creator</h3>
        <p className="text-xs text-slate-400 mb-6">
          Phase 2 will implement the complete form with image upload dropzone (Cloudinary integrated) and specs builder.
        </p>
        <Link to="/admin" className="btn-pill-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
