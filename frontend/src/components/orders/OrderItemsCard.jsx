import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  RotateCcw,
  Star,
  ShoppingBag,
  ExternalLink,
  Check,
  Tag,
  Sparkles,
  ArrowRight,
  Eye,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

const formatINR = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function OrderItemsCard({
  order,
  onOpenReviewModal,
  onOpenReturnModal,
}) {
  const addItemToCart = useCartStore((state) => state.addItem);
  const [reorderedId, setReorderedId] = useState(null);

  const orderItems = order?.orderItems || [];
  const isDelivered = order?.orderStatus === "DELIVERED";

  const handleBuyAgain = (item) => {
    const productPayload = {
      _id: item.product?._id || item.product,
      title: item.title,
      slug: item.product?.slug || "",
      brandName: item.product?.brand?.name || item.product?.brand || "",
      categoryName: item.product?.category?.name || item.product?.category || "",
      salePrice: item.price,
      regularPrice: item.price,
      image: item.image,
      stock: 50,
    };

    addItemToCart(productPayload, 1, item.selectedSpecs?.color || null);
    setReorderedId(item._id || item.title);
    setTimeout(() => setReorderedId(null), 3000);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all space-y-5">
      {/* Header matching Admin Order Detail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white">
                Purchased Hardware Items
              </h3>
              <span className="text-xs font-sans font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                {orderItems.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Click any item below to view full specifications, benchmarks & catalog details
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400 self-start sm:self-auto font-medium">
          Total Quantity: {orderItems.reduce((acc, curr) => acc + (curr.quantity || 1), 0)} Units
        </span>
      </div>

      {/* Item List Container with Admin Table Border Styling */}
      <div className="rounded-2xl border border-slate-300 dark:border-white/20 overflow-hidden divide-y divide-slate-200 dark:divide-white/10">
        {orderItems.map((item, index) => {
          // Robust product link resolution (handles populated object, slug, or ID string)
          const productSlugOrId =
            item.product?.slug ||
            (typeof item.product === "object" ? item.product?._id : item.product);
          const productUrl = productSlugOrId ? `/product/${productSlugOrId}` : "#";
          const specs = item.selectedSpecs || {};
          const isItemReordered = reorderedId === (item._id || item.title);
          const brandTitle = item.product?.brand?.name || item.product?.brand || "";

          return (
            <div
              key={item._id || index}
              className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 bg-white dark:bg-[#0c0f17] hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors gap-4"
            >
              {/* Product Thumbnail & Metadata */}
              <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                {/* Clickable Image Link with Zoom Hover */}
                <Link
                  to={productUrl}
                  title={`View details for ${item.title}`}
                  className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/20 hover:border-orange-500 dark:hover:border-orange-500 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs transition-all"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-slate-400" />
                  )}
                  {/* Subtle hover overlay badge */}
                  <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Eye className="w-4 h-4 text-white" />
                  </span>
                </Link>

                {/* Title, Brand & Specs */}
                <div className="min-w-0 space-y-1.5 flex-1">
                  {brandTitle && (
                    <span className="inline-block text-[10px] font-sans font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      {brandTitle}
                    </span>
                  )}

                  {/* Clickable Product Headline */}
                  <Link
                    to={productUrl}
                    title="Open live product page"
                    className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-2 block group"
                  >
                    <span>{item.title}</span>
                    <ExternalLink className="inline-block ml-1.5 w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                  </Link>

                  {/* Hardware Specs Pills matching Admin Palette */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {specs.color && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                        Color: {specs.color}
                      </span>
                    )}
                    {specs.ram && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                        RAM: {specs.ram}
                      </span>
                    )}
                    {specs.storage && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                        Storage: {specs.storage}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/30">
                      Qty: {item.quantity}
                    </span>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="flex items-center gap-2 text-xs font-mono pt-1 text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatINR(item.price)} each
                    </span>
                    <span>•</span>
                    <span>
                      Item Subtotal:{" "}
                      <strong className="text-orange-600 dark:text-orange-400 font-bold">
                        {formatINR(item.price * item.quantity)}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Column */}
              <div className="flex flex-wrap items-center lg:flex-col lg:items-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200 dark:border-white/10 shrink-0">
                {/* 1. Explicit Product Detail Redirection Link */}
                <Link
                  to={productUrl}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold bg-white dark:bg-white/10 border border-slate-300 dark:border-white/25 text-slate-800 dark:text-white hover:border-orange-500 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 shadow-xs transition-all cursor-pointer group"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-orange-500 group-hover:rotate-12 transition-transform" />
                  <span>View Product Details</span>
                </Link>

                {/* 2. Buy Again / Quick Reorder */}
                <button
                  type="button"
                  onClick={() => handleBuyAgain(item)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold shadow-xs transition-all cursor-pointer ${
                    isItemReordered
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white"
                  }`}
                >
                  {isItemReordered ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy Again</span>
                    </>
                  )}
                </button>

                {/* 3. Delivered-only Post-Purchase Actions */}
                {isDelivered && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-sans font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Rate & Review</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenReturnModal(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-sans font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                      <span>Return / Replace</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
