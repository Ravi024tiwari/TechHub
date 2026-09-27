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
  CheckCircle2,
  Edit3,
  Clock,
  Truck,
  AlertCircle,
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
  const isDelivered = order?.orderStatus?.toUpperCase() === "DELIVERED";

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
            <div key={item._id || index} className="divide-y divide-slate-100 dark:divide-white/5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 bg-white dark:bg-[#0c0f17] hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors gap-4">
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

              {/* Action Buttons Column: Responsive Grid on Mobile, Clean Column on Large Screens */}
              <div className="w-full lg:w-auto grid grid-cols-2 lg:flex lg:flex-col lg:items-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200 dark:border-white/10 shrink-0">
                {/* 1. Buy Again / Quick Reorder */}
                <button
                  type="button"
                  onClick={() => handleBuyAgain(item)}
                  className={`w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold shadow-xs transition-all cursor-pointer active:scale-95 ${
                    isItemReordered
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white"
                  }`}
                >
                  {isItemReordered ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy Again</span>
                    </>
                  )}
                </button>

                {/* 2. Review Action (if Delivered) */}
                {isDelivered && (
                  item.userReview ? (
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal(item, item.userReview.rating)}
                      className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer active:scale-95"
                      title="You have reviewed this product. Click to view or edit."
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">Reviewed ({item.userReview.rating}★)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal(item, 5)}
                      className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-xs shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
                      title="Rate and write an authentic review for this delivered product"
                    >
                      <Star className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                      <span className="truncate">Rate & Review</span>
                    </button>
                  )
                )}

                {/* 3. Return & Replacement Flow (if Delivered) */}
                {isDelivered && (
                  item.returnRequest ? (
                    <div className="col-span-2 lg:col-span-1 w-full lg:w-auto">
                      {item.returnRequest.status === "REQUESTED" && (
                        <span
                          className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-center"
                          title={`RMA #${item.returnRequest.returnNumber} is under quality review`}
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                          <span className="truncate">
                            {item.returnRequest.requestType === "REPLACEMENT" ? "Replacement" : "Return"} Under Review
                          </span>
                        </span>
                      )}

                      {item.returnRequest.status === "APPROVED" && (
                        <span
                          className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30 text-center"
                          title="Pickup scheduled at your delivery address"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span className="truncate">Pickup Scheduled</span>
                        </span>
                      )}

                      {item.returnRequest.status === "ITEM_RECEIVED" && (
                        <span className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 text-center">
                          <Package className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">Arrived at Warehouse</span>
                        </span>
                      )}

                      {item.returnRequest.status === "REFUND_PROCESSED" && (
                        <span className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">
                            Refunded: {formatINR(item.returnRequest.refundDetails?.amount || (item.price * item.quantity))}
                          </span>
                        </span>
                      )}

                      {item.returnRequest.status === "REPLACEMENT_DISPATCHED" && (
                        <span
                          className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-center"
                          title={`Tracking: ${item.returnRequest.replacementDetails?.trackingNumber || "N/A"}`}
                        >
                          <Truck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">
                            Replacement Shipped
                          </span>
                        </span>
                      )}

                      {item.returnRequest.status === "REJECTED" && (
                        <span
                          className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-center"
                          title={item.returnRequest.rejectionReason || "Return rejected"}
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">Return Rejected</span>
                        </span>
                      )}

                      {item.returnRequest.status === "CANCELLED" && (
                        <span className="w-full lg:w-auto inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-sans text-slate-400 border border-slate-200 dark:border-white/10 text-center">
                          Return Cancelled
                        </span>
                      )}
                    </div>
                  ) : (
                    (() => {
                      const deliveryDate = new Date(order.trackingInfo?.deliveredAt || order.updatedAt || Date.now());
                      const diffDays = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
                      const isReturnEligible = diffDays <= 7;

                      return isReturnEligible ? (
                        <button
                          type="button"
                          onClick={() => onOpenReturnModal(item)}
                          className="col-span-2 lg:col-span-1 w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 transition-colors cursor-pointer active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">Return / Replace</span>
                        </button>
                      ) : (
                        <span className="col-span-2 lg:col-span-1 text-[11px] font-sans text-slate-400 dark:text-slate-500 italic text-center lg:text-right">
                          Return window closed
                        </span>
                      );
                    })()
                  )
                )}
              </div>
            </div>

            {/* Delivered Product Interactive Review Status Banner */}
            {isDelivered && (
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 bg-white dark:bg-[#0c0f17]">
                {item.userReview ? (
                  <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/25 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-heading font-bold text-slate-900 dark:text-white">
                        Your Verified Review:{" "}
                        <span className="text-amber-500 font-mono">
                          {item.userReview.rating}.0 ★
                        </span>
                        {item.userReview.title && (
                          <span className="font-normal text-slate-500 dark:text-slate-400 ml-1.5 hidden sm:inline">
                            "{item.userReview.title}"
                          </span>
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenReviewModal(item, item.userReview.rating)}
                      className="inline-flex items-center gap-1 text-[11px] font-heading font-bold text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Review</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0">
                        <Sparkles className="w-4 h-4 fill-amber-400" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-heading font-extrabold text-slate-900 dark:text-white">
                            Delivered! How is this hardware performing?
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Review Pending
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                          Share your benchmarks and build quality rating to help other buyers.
                        </p>
                      </div>
                    </div>

                    {/* Direct Clickable Quick-Rate Stars */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <div className="flex items-center gap-1 bg-white dark:bg-black/40 px-2 py-1 rounded-lg border border-amber-500/25 shadow-2xs">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => onOpenReviewModal(item, star)}
                            className="p-0.5 hover:scale-125 transition-transform text-slate-300 dark:text-white/20 hover:text-amber-400 cursor-pointer"
                            title={`Rate ${star} star and review`}
                          >
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400 opacity-60 hover:opacity-100" />
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenReviewModal(item, 5)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-xs shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>Rate Product</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
