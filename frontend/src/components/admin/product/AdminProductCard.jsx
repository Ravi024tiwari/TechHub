import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Edit3,
  Trash2,
  ExternalLink,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Tag,
  Boxes,
  Eye,
  Percent
} from "lucide-react";

export default function AdminProductCard({
  product,
  onQuickStock,
  onDeleteRequest,
}) {
  const navigate = useNavigate();

  // Price & Discount math
  const regularPrice = product.regularPrice || 0;
  const salePrice = product.salePrice ?? regularPrice;
  const discountPercent =
    regularPrice > salePrice
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  // Currency format
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  // Fallback image handling
  const mainImage =
    product.images?.[0]?.url ||
    product.image ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80";

  const stock = product.stock ?? 0;
  const isLowStock = stock > 0 && stock <= (product.lowStockThreshold || 5);
  const isOutOfStock = stock === 0;

  return (
    <div
      onClick={() => navigate(`/admin/products/edit/${product._id}`)}
      className="group relative rounded-2xl border border-white/10 hover:border-white/30 bg-gradient-to-b from-[#141824] via-[#0d1017] to-[#080a0e] shadow-[0_4px_25px_rgba(0,0,0,0.8)] hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.9),_0_0_25px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden select-none cursor-pointer"
    >
      {/* =========================================================================
          TOP SECTION: Full-Width Image Showcase with Floating Admin Actions
          ========================================================================= */}
      <div className="relative w-full h-52 sm:h-60 overflow-hidden bg-[#0c0f16] border-b border-white/10">
        {/* Product Image */}
        <img
          src={mainImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Gradient overlays for contrast */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#080a0e] via-[#080a0e]/60 to-transparent pointer-events-none" />

        {/* Top-Left Category & Discount Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-black/60 text-white backdrop-blur-md border border-white/15 shadow-sm">
            {product.categoryName || product.category?.name || "Electronics"}
          </span>

          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-rose-500 text-white shadow-md flex items-center gap-1 w-fit">
              <Percent className="w-2.5 h-2.5" />
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Top-Right Floating Admin Action Toolbar */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-lg">
          {/* View in Live Store */}
          <Link
            to={`/product/${product.slug || product._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition-colors"
            title="View Live in Store"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Quick Edit */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/edit/${product._id}`);
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-sky-300 hover:bg-sky-500/20 transition-colors"
            title="Edit Product"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Product */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(product);
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Bar on Image: Stock Status Indicator */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          {/* Stock Badge with Click to Quick Update */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickStock(product);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold tracking-tight backdrop-blur-md border flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer ${
              isOutOfStock
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : isLowStock
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            }`}
            title="Click to quickly update stock units"
          >
            <Boxes className="w-3 h-3" />
            <span>Stock: {stock}</span>
            <span className="text-[9px] opacity-75 underline decoration-dotted">edit</span>
          </button>

          {/* Active / Inactive Badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider backdrop-blur-md border flex items-center gap-1 ${
              product.isActive !== false
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                product.isActive !== false ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
            {product.isActive !== false ? "Active" : "Draft"}
          </span>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SECTION: Product Details, Pricing, & SKU
          ========================================================================= */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & SKU */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="font-semibold text-slate-300 truncate">
              {product.brandName || product.brand?.name || "Brand"}
            </span>
            {product.sku && (
              <span className="text-slate-500 text-[10px] truncate max-w-[100px]">
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => navigate(`/admin/products/edit/${product._id}`)}
            className="text-sm font-heading font-bold text-white leading-snug line-clamp-2 hover:text-sky-300 transition-colors cursor-pointer"
            title={product.title}
          >
            {product.title}
          </h3>
        </div>

        {/* Price Row */}
        <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-heading font-extrabold text-white font-mono">
              {formatINR(salePrice)}
            </span>
            {regularPrice > salePrice && (
              <span className="text-xs text-slate-500 line-through font-mono">
                {formatINR(regularPrice)}
              </span>
            )}
          </div>

          {/* Quick Edit Action Link */}
          <Link
            to={`/admin/products/edit/${product._id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white group/btn"
          >
            <span>Edit</span>
            <span className="text-[10px] transition-transform group-hover/btn:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
