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
      className="group relative rounded-xl sm:rounded-2xl border-2 border-white/25 sm:border-white/15 hover:border-white/50 active:border-white/60 bg-gradient-to-b from-[#141824] via-[#0d1017] to-[#080a0e] shadow-[0_4px_20px_rgba(0,0,0,0.7),_0_0_10px_rgba(255,255,255,0.05)] hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.9),_0_0_25px_rgba(255,255,255,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer touch-pan-y"
    >
      {/* =========================================================================
          TOP SECTION: Full-Width Image Showcase with Floating Admin Actions
          ========================================================================= */}
      <div className="relative w-full aspect-[4/3] xs:aspect-square sm:aspect-auto sm:h-52 lg:h-56 overflow-hidden bg-[#0c0f16] border-b border-white/15 sm:border-white/10">
        {/* Product Image */}
        <img
          src={mainImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Gradient overlays for contrast */}
        <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-black/85 via-black/45 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-14 sm:h-16 bg-gradient-to-t from-[#080a0e] via-[#080a0e]/60 to-transparent pointer-events-none" />

        {/* Top-Left Category & Discount Badge */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-10 max-w-[55%]">
          <span className="px-1.5 sm:px-2.5 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-mono font-bold tracking-wider uppercase bg-black/70 text-white backdrop-blur-md border border-white/15 shadow-sm truncate">
            {product.categoryName || product.category?.name || "Electronics"}
          </span>

          {discountPercent > 0 && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-mono font-bold tracking-wider uppercase bg-rose-500 text-white shadow-md flex items-center gap-0.5 sm:gap-1 w-fit">
              <Percent className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Top-Right Floating Admin Action Toolbar */}
        <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex items-center gap-0.5 sm:gap-1.5 z-10 bg-black/75 backdrop-blur-md p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-white/15 shadow-lg">
          {/* View in Live Store */}
          <Link
            to={`/product/${product.slug || product._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 sm:p-1.5 rounded-md sm:rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition-colors"
            title="View Live in Store"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>

          {/* Quick Edit */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/edit/${product._id}`);
            }}
            className="p-1 sm:p-1.5 rounded-md sm:rounded-lg text-slate-300 hover:text-sky-300 hover:bg-sky-500/20 transition-colors"
            title="Edit Product"
          >
            <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>

          {/* Delete Product */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(product);
            }}
            className="p-1 sm:p-1.5 rounded-md sm:rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {/* Bottom Bar on Image: Stock Status & Active Indicator */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2.5 sm:left-2.5 sm:right-2.5 flex items-center justify-between gap-1 z-10">
          {/* Stock Badge with Click to Quick Update */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickStock(product);
            }}
            className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[11px] font-mono font-bold tracking-tight backdrop-blur-md border flex items-center gap-1 sm:gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer max-w-[65%] truncate ${
              isOutOfStock
                ? "bg-rose-500/25 text-rose-300 border-rose-500/40"
                : isLowStock
                ? "bg-amber-500/25 text-amber-300 border-amber-500/40"
                : "bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
            }`}
            title="Click to quickly update stock units"
          >
            <Boxes className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            <span className="truncate">Stock: {stock}</span>
            <span className="text-[8px] sm:text-[9px] opacity-75 underline decoration-dotted hidden xs:inline">edit</span>
          </button>

          {/* Active / Inactive Badge */}
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-mono uppercase tracking-wider backdrop-blur-md border flex items-center gap-1 shrink-0 ${
              product.isActive !== false
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-slate-500/15 text-slate-400 border-slate-500/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                product.isActive !== false ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
            <span>{product.isActive !== false ? "Active" : "Draft"}</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SECTION: Product Details, Pricing, & SKU
          ========================================================================= */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          {/* Brand & SKU */}
          <div className="flex items-center justify-between text-[9.5px] sm:text-[11px] font-mono text-slate-400 mb-1 gap-1">
            <span className="font-semibold text-slate-300 truncate">
              {product.brandName || product.brand?.name || "Brand"}
            </span>
            {product.sku && (
              <span className="text-slate-500 text-[9px] sm:text-[10px] truncate max-w-[70px] sm:max-w-[100px]">
                {product.sku}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => navigate(`/admin/products/edit/${product._id}`)}
            className="text-xs sm:text-sm font-heading font-bold text-white leading-tight sm:leading-snug line-clamp-2 hover:text-sky-300 transition-colors cursor-pointer min-h-[2rem] sm:min-h-[2.5rem]"
            title={product.title}
          >
            {product.title}
          </h3>
        </div>

        {/* Price Row */}
        <div className="pt-1.5 sm:pt-2 border-t border-white/10 flex items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2 truncate">
            <span className="text-sm sm:text-base lg:text-lg font-heading font-extrabold text-white font-mono truncate">
              {formatINR(salePrice)}
            </span>
            {regularPrice > salePrice && (
              <span className="text-[10px] sm:text-xs text-slate-500 line-through font-mono shrink-0">
                {formatINR(regularPrice)}
              </span>
            )}
          </div>

          {/* Quick Edit Action Link */}
          <Link
            to={`/admin/products/edit/${product._id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-mono text-slate-400 hover:text-white group/btn shrink-0"
          >
            <span>Edit</span>
            <span className="text-[9px] sm:text-[10px] transition-transform group-hover/btn:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
