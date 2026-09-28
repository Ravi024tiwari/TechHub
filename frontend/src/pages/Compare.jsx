import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompareProductSearchModal from "@/components/compare/CompareProductSearchModal";
import { useCompareStore } from "@/store/useCompareStore";
import { useCartStore } from "@/store/useCartStore";
import { fetchProductsForComparison } from "@/api/productApi";
import {
  ArrowLeftRight,
  ChevronRight,
  Trash2,
  Plus,
  X,
  ShoppingBag,
  Check,
  Star,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";

/**
 * Production-Grade Side-by-Side Product Comparison Page:
 * - Direct architectural sibling of Catalog & Product Details.
 * - Sticky multi-column comparison table with full hardware matrix.
 * - "Show Only Differences" filter switch for rapid decision making.
 * - 1-Click direct Add to Cart for instant conversion.
 * - Inline slot search modal to swap or add products without leaving the page.
 */
export default function Compare() {
  const navigate = useNavigate();
  const {
    items,
    maxItems,
    removeFromCompare,
    clearCompare,
    hasCategoryMismatch,
  } = useCompareStore();

  const addItemToCart = useCartStore((state) => state.addItem);

  const [detailedProducts, setDetailedProducts] = useState([]);
  const [allSpecKeys, setAllSpecKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [addedCartIds, setAddedCartIds] = useState({});

  const categoryMismatch = hasCategoryMismatch();

  // Fetch full specifications for all compared items
  useEffect(() => {
    if (items.length === 0) {
      setDetailedProducts([]);
      setAllSpecKeys([]);
      return;
    }

    const itemIds = items.map((i) => i._id);
    setIsLoading(true);

    fetchProductsForComparison(itemIds)
      .then((data) => {
        setDetailedProducts(data.products || []);
        setAllSpecKeys(data.allSpecKeys || []);
      })
      .catch((err) => {
        console.error("Failed to fetch compare data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [items]);

  // Format currency
  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Add to cart with visual feedback
  const handleAddToCart = (product) => {
    if (!product || product.stock === 0) return;
    addItemToCart(product, 1);
    setAddedCartIds((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedCartIds((prev) => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  // Helper to extract a spec value from a product
  const getProductSpecValue = (prod, key) => {
    if (!prod) return "—";

    // Direct specifications Map / Object
    if (prod.specifications) {
      if (prod.specifications instanceof Map) {
        if (prod.specifications.has(key)) return prod.specifications.get(key);
      } else if (typeof prod.specifications === "object") {
        if (prod.specifications[key] !== undefined) return prod.specifications[key];
      }
    }

    // Common root level aliases
    const lowerKey = key.toLowerCase();
    if (lowerKey === "ram" && prod.ram) return prod.ram;
    if (lowerKey === "storage" && prod.storage) return prod.storage;
    if (lowerKey === "brand") return prod.brandName || prod.brand?.name || "—";
    if (lowerKey === "category") return prod.categoryName || prod.category?.name || "—";

    return "—";
  };

  // Check if a spec value is identical across all compared products
  const areValuesIdentical = (key) => {
    if (detailedProducts.length <= 1) return false;
    const firstVal = String(getProductSpecValue(detailedProducts[0], key)).trim().toLowerCase();
    return detailedProducts.every(
      (p) => String(getProductSpecValue(p, key)).trim().toLowerCase() === firstVal
    );
  };

  const emptySlotsCount = Math.max(0, maxItems - detailedProducts.length);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-sans text-slate-500 dark:text-slate-400 mb-6"
        >
          <Link
            to="/"
            className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <Link
            to="/products"
            className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            Catalog
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="text-slate-900 dark:text-white font-semibold">
            Product Comparison
          </span>
        </nav>

        {/* Page Header & Global Matrix Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center shrink-0">
                <ArrowLeftRight className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Product Comparison Matrix
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                  Evaluate technical specifications, price-to-performance, and warranty side-by-side.
                </p>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          {detailedProducts.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Show Only Differences Switch */}
              <button
                type="button"
                onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
                className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold border flex items-center gap-2 transition-all cursor-pointer select-none ${
                  showOnlyDifferences
                    ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 ring-2 ring-orange-500/30"
                    : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:border-orange-500"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>
                  {showOnlyDifferences ? "Showing Differences Only" : "Highlight Differences"}
                </span>
              </button>

              {/* Add Product Button (if slot available) */}
              {detailedProducts.length < maxItems && (
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-heading font-bold border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-800 dark:text-white hover:border-orange-500 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Product ({detailedProducts.length}/{maxItems})</span>
                </button>
              )}

              {/* Clear All */}
              <button
                type="button"
                onClick={clearCompare}
                className="px-3 py-2 rounded-xl text-xs font-sans font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Category Mismatch Advisory Banner */}
        {categoryMismatch && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center gap-3">
            <Info className="h-5 w-5 shrink-0 text-amber-500" />
            <div className="text-xs sm:text-sm font-sans">
              <span className="font-bold">Notice:</span> You are comparing items across different electronics categories. Technical specifications are normalized automatically for cross-category benchmarking.
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm font-sans font-medium">
              Generating high-precision spec matrix...
            </p>
          </div>
        )}

        {/* Empty State (When no products selected) */}
        {!isLoading && detailedProducts.length === 0 && (
          <div className="py-20 px-4 text-center rounded-3xl bg-white dark:bg-[#0c0f18] border-2 border-dashed border-slate-200 dark:border-white/10 max-w-2xl mx-auto space-y-4">
            <div className="h-16 w-16 mx-auto rounded-3xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center">
              <ArrowLeftRight className="h-8 w-8 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                No Products in Comparison
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans max-w-md mx-auto mt-1">
                You haven&apos;t added any electronics products yet. Browse our catalog and click the comparison icon on cards or detail pages to evaluate specifications side-by-side.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Search & Add Product</span>
              </button>

              <Link
                to="/products"
                className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs border border-slate-300 dark:border-white/20 hover:border-orange-500 text-slate-800 dark:text-white transition-all cursor-pointer"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        )}

        {/* Single Product Notice (Suggest adding another) */}
        {!isLoading && detailedProducts.length === 1 && (
          <div className="mb-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-800 dark:text-orange-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-orange-500" />
              <p className="text-xs sm:text-sm font-sans font-semibold">
                You have selected 1 product. Add at least 1 more product to unlock side-by-side comparison metrics.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="px-4 py-1.5 rounded-xl font-heading font-bold text-xs bg-orange-500 hover:bg-orange-600 text-white shrink-0 cursor-pointer shadow-xs"
            >
              + Add Second Item
            </button>
          </div>
        )}

        {/* =========================================================================
            SIDE-BY-SIDE SPECIFICATION MATRIX TABLE
            ========================================================================= */}
        {!isLoading && detailedProducts.length > 0 && (
          <div className="rounded-3xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0f18] shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full border-collapse text-left min-w-[720px]">
                {/* -------------------------------------------------------------
                    TOP STICKY ROW: PRODUCT SHOWCASE CARDS (COLUMN HEADERS)
                    ------------------------------------------------------------- */}
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
                    <th className="p-4 sm:p-6 w-48 sm:w-60 align-top shrink-0 border-r border-slate-200 dark:border-white/10">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                          Side-by-Side
                        </span>
                        <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                          Hardware Spec
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                          {detailedProducts.length} Products benchmarked
                        </p>
                      </div>
                    </th>

                    {detailedProducts.map((prod) => {
                      const regularPrice = prod.regularPrice || 0;
                      const salePrice = prod.salePrice ?? regularPrice;
                      const isAdded = Boolean(addedCartIds[prod._id]);
                      const isOutOfStock = (prod.stock ?? 1) === 0;

                      return (
                        <th
                          key={prod._id}
                          className="p-4 sm:p-6 w-64 sm:w-80 align-top border-r border-slate-200 dark:border-white/10 last:border-r-0 relative group"
                        >
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeFromCompare(prod._id)}
                            className="absolute top-3 right-3 h-7 w-7 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove from comparison"
                          >
                            <X className="h-3.5 w-3.5 stroke-[2.5]" />
                          </button>

                          {/* Product Image */}
                          <div className="h-36 sm:h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 mb-3.5 relative">
                            <img
                              src={
                                prod.images?.[0]?.url ||
                                prod.image ||
                                prod.thumbnail ||
                                ""
                              }
                              alt={prod.title}
                              className="h-full w-full object-contain p-2"
                            />
                            {/* Stock Badge */}
                            <span
                              className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-tight uppercase border backdrop-blur-md ${
                                isOutOfStock
                                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              }`}
                            >
                              {isOutOfStock ? "Out of Stock" : "In Stock"}
                            </span>
                          </div>

                          {/* Brand & Title */}
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                            {prod.brandName || prod.brand?.name || "TechHub"}
                          </span>
                          <Link
                            to={`/product/${prod.slug || prod._id}`}
                            className="block font-heading font-black text-sm text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors line-clamp-2 mt-0.5"
                          >
                            {prod.title}
                          </Link>

                          {/* Price Display */}
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="font-heading font-black text-lg sm:text-xl text-slate-950 dark:text-white">
                              {formatINR(salePrice)}
                            </span>
                            {regularPrice > salePrice && (
                              <span className="text-xs text-slate-400 line-through font-mono">
                                {formatINR(regularPrice)}
                              </span>
                            )}
                          </div>

                          {/* 1-Click Buy Action */}
                          <button
                            type="button"
                            onClick={() => handleAddToCart(prod)}
                            disabled={isOutOfStock}
                            className={`w-full mt-3.5 h-10 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                              isOutOfStock
                                ? "bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed"
                                : isAdded
                                ? "bg-emerald-600 text-white font-black"
                                : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="h-4 w-4 stroke-[3]" />
                                <span>Added to Bag!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="h-4 w-4" />
                                <span>{isOutOfStock ? "Sold Out" : "Add to Bag"}</span>
                              </>
                            )}
                          </button>
                        </th>
                      );
                    })}

                    {/* Empty Slot Column (Invites user to add another item) */}
                    {emptySlotsCount > 0 && (
                      <th className="p-4 sm:p-6 w-56 sm:w-72 align-middle text-center border-r border-slate-200 dark:border-white/10 last:border-r-0 bg-slate-100/40 dark:bg-white/[0.01]">
                        <button
                          type="button"
                          onClick={() => setIsSearchModalOpen(true)}
                          className="h-full min-h-[220px] w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-orange-500 dark:hover:border-orange-500/80 p-6 flex flex-col items-center justify-center gap-2.5 transition-all text-slate-500 hover:text-orange-500 cursor-pointer group"
                        >
                          <div className="h-10 w-10 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 block">
                              Add Product
                            </span>
                            <span className="text-[11px] text-slate-400 font-sans block mt-0.5">
                              {emptySlotsCount} slot{emptySlotsCount > 1 ? "s" : ""} free
                            </span>
                          </div>
                        </button>
                      </th>
                    )}
                  </tr>
                </thead>

                {/* -------------------------------------------------------------
                    BODY SECTION 1: COMMERCIALS & PRICING
                    ------------------------------------------------------------- */}
                <tbody>
                  <tr className="bg-slate-100/60 dark:bg-white/[0.03]">
                    <td
                      colSpan={detailedProducts.length + 1 + (emptySlotsCount > 0 ? 1 : 0)}
                      className="px-4 sm:px-6 py-2.5 font-heading font-black text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400"
                    >
                      1. Pricing & Commercials
                    </td>
                  </tr>

                  {/* Regular MRP */}
                  {(!showOnlyDifferences || !areValuesIdentical("regularPrice")) && (
                    <tr className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                      <td className="p-3.5 sm:p-4 text-xs font-heading font-bold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
                        Regular Price (MRP)
                      </td>
                      {detailedProducts.map((prod) => (
                        <td
                          key={prod._id}
                          className="p-3.5 sm:p-4 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-white/10 last:border-r-0"
                        >
                          {formatINR(prod.regularPrice || 0)}
                        </td>
                      ))}
                      {emptySlotsCount > 0 && <td className="border-r border-slate-200 dark:border-white/10 last:border-r-0"></td>}
                    </tr>
                  )}

                  {/* Savings / Discount */}
                  {(!showOnlyDifferences || !areValuesIdentical("discount")) && (
                    <tr className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                      <td className="p-3.5 sm:p-4 text-xs font-heading font-bold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
                        Instant Savings
                      </td>
                      {detailedProducts.map((prod) => {
                        const savings = Math.max(0, (prod.regularPrice || 0) - (prod.salePrice ?? prod.regularPrice));
                        return (
                          <td
                            key={prod._id}
                            className="p-3.5 sm:p-4 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/10 last:border-r-0"
                          >
                            {savings > 0 ? `${formatINR(savings)} OFF` : "Standard Price"}
                          </td>
                        );
                      })}
                      {emptySlotsCount > 0 && <td className="border-r border-slate-200 dark:border-white/10 last:border-r-0"></td>}
                    </tr>
                  )}

                  {/* Monthly EMI Estimate */}
                  <tr className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-3.5 sm:p-4 text-xs font-heading font-bold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
                      Estimated No-Cost EMI
                    </td>
                    {detailedProducts.map((prod) => {
                      const emi = Math.round((prod.salePrice ?? prod.regularPrice) / 12);
                      return (
                        <td
                          key={prod._id}
                          className="p-3.5 sm:p-4 text-xs font-sans font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-white/10 last:border-r-0"
                        >
                          From <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(emi)}</span>/mo
                        </td>
                      );
                    })}
                    {emptySlotsCount > 0 && <td className="border-r border-slate-200 dark:border-white/10 last:border-r-0"></td>}
                  </tr>

                  {/* -------------------------------------------------------------
                      BODY SECTION 2: HARDWARE & TECHNICAL SPECIFICATIONS
                      ------------------------------------------------------------- */}
                  <tr className="bg-slate-100/60 dark:bg-white/[0.03]">
                    <td
                      colSpan={detailedProducts.length + 1 + (emptySlotsCount > 0 ? 1 : 0)}
                      className="px-4 sm:px-6 py-2.5 font-heading font-black text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400"
                    >
                      2. Technical & Hardware Specifications
                    </td>
                  </tr>

                  {/* Brand & Category Rows */}
                  <tr className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-3.5 sm:p-4 text-xs font-heading font-bold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
                      Manufacturer Brand
                    </td>
                    {detailedProducts.map((prod) => (
                      <td
                        key={prod._id}
                        className="p-3.5 sm:p-4 text-xs font-sans font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-white/10 last:border-r-0"
                      >
                        {prod.brandName || prod.brand?.name || "TechHub Official"}
                      </td>
                    ))}
                    {emptySlotsCount > 0 && <td className="border-r border-slate-200 dark:border-white/10 last:border-r-0"></td>}
                  </tr>

                  {/* Dynamic Category Specifications extracted across products */}
                  {allSpecKeys.map((key) => {
                    const isIdentical = areValuesIdentical(key);
                    if (showOnlyDifferences && isIdentical) return null;

                    return (
                      <tr
                        key={key}
                        className={`border-b border-slate-200 dark:border-white/5 transition-colors ${
                          !isIdentical
                            ? "bg-orange-500/[0.02] dark:bg-orange-500/[0.04]"
                            : "hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="p-3.5 sm:p-4 text-xs font-heading font-bold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-white/10 capitalize flex items-center justify-between gap-2">
                          <span>{key.replace(/([A-Z])/g, " $1")}</span>
                          {!isIdentical && (
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" title="Values differ" />
                          )}
                        </td>
                        {detailedProducts.map((prod) => {
                          const val = getProductSpecValue(prod, key);
                          return (
                            <td
                              key={prod._id}
                              className={`p-3.5 sm:p-4 text-xs font-sans border-r border-slate-200 dark:border-white/10 last:border-r-0 ${
                                !isIdentical
                                  ? "font-semibold text-slate-900 dark:text-white"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                        {emptySlotsCount > 0 && <td className="border-r border-slate-200 dark:border-white/10 last:border-r-0"></td>}
                      </tr>
                    );
                  })}

                  {/* Available Color Finishes */}
                  <tr className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-3.5 sm:p-4 text-xs font-heading font-bold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
                      Color Finishes
                    </td>
                    {detailedProducts.map((prod) => (
                      <td
                        key={prod._id}
                        className="p-3.5 sm:p-4 text-xs font-sans border-r border-slate-200 dark:border-white/10 last:border-r-0"
                      >
                        {prod.colors && prod.colors.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {prod.colors.map((c, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-sans font-medium"
                              >
                                <span
                                  className="h-2 w-2 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: c.colorCode || "#ccc" }}
                                />
                                <span>{c.colorName}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">Single Finish</span>
                        )}
                      </td>
                    ))}
                    {emptySlotsCount > 0 && <td className="border-r border-slate-200 dark:border-white/10 last:border-r-0"></td>}
                  </tr>

                  {/* -------------------------------------------------------------
                      BODY SECTION 3: WARRANTY & POLICY COVERAGE
                      ------------------------------------------------------------- */}
                  <tr className="bg-slate-100/60 dark:bg-white/[0.03]">
                    <td
                      colSpan={detailedProducts.length + 1 + (emptySlotsCount > 0 ? 1 : 0)}
                      className="px-4 sm:px-6 py-2.5 font-heading font-black text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400"
                    >
                      3. Warranty & Return Policy
                    </td>
                  </tr>

                  {/* Warranty Period */}
                  <tr className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-3.5 sm:p-4 text-xs font-heading font-bold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
                      Standard Warranty
                    </td>
                    {detailedProducts.map((prod) => (
                      <td
                        key={prod._id}
                        className="p-3.5 sm:p-4 text-xs font-sans text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-white/10 last:border-r-0"
                      >
                        <span className="font-semibold">
                          {prod.warranty?.durationMonths ? `${prod.warranty.durationMonths} Months` : "12 Months"}
                        </span>
                        <span className="text-slate-400 text-[11px] block mt-0.5">
                          {prod.warranty?.claimType === "onsite" ? "On-site Technician Visit" : "Brand Authorized Service Center"}
                        </span>
                      </td>
                    ))}
                    {emptySlotsCount > 0 && <td className="border-r border-slate-200 dark:border-white/10 last:border-r-0"></td>}
                  </tr>

                  {/* Return Eligibility */}
                  <tr className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-3.5 sm:p-4 text-xs font-heading font-bold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
                      Return & Replacement
                    </td>
                    {detailedProducts.map((prod) => (
                      <td
                        key={prod._id}
                        className="p-3.5 sm:p-4 text-xs font-sans text-emerald-600 dark:text-emerald-400 font-semibold border-r border-slate-200 dark:border-white/10 last:border-r-0"
                      >
                        7-Day Replacement / Full Refund Guaranteed
                      </td>
                    ))}
                    {emptySlotsCount > 0 && <td className="border-r border-slate-200 dark:border-white/10 last:border-r-0"></td>}
                  </tr>

                  {/* -------------------------------------------------------------
                      BODY SECTION 4: RATINGS & CUSTOMER SENTIMENT
                      ------------------------------------------------------------- */}
                  <tr className="bg-slate-100/60 dark:bg-white/[0.03]">
                    <td
                      colSpan={detailedProducts.length + 1 + (emptySlotsCount > 0 ? 1 : 0)}
                      className="px-4 sm:px-6 py-2.5 font-heading font-black text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400"
                    >
                      4. Customer Feedback & Sentiment
                    </td>
                  </tr>

                  {/* Customer Rating */}
                  <tr className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-3.5 sm:p-4 text-xs font-heading font-bold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
                      Average Rating
                    </td>
                    {detailedProducts.map((prod) => {
                      const rating = prod.averageRating || prod.rating || 0;
                      return (
                        <td
                          key={prod._id}
                          className="p-3.5 sm:p-4 text-xs font-sans border-r border-slate-200 dark:border-white/10 last:border-r-0"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center text-amber-500">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-slate-900 dark:text-white ml-1">
                                {Number(rating).toFixed(1)}
                              </span>
                            </div>
                            <span className="text-slate-400 text-[11px]">/ 5.0</span>
                          </div>
                        </td>
                      );
                    })}
                    {emptySlotsCount > 0 && <td className="border-r border-slate-200 dark:border-white/10 last:border-r-0"></td>}
                  </tr>

                  {/* Total Reviews */}
                  <tr className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-3.5 sm:p-4 text-xs font-heading font-bold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
                      Verified Reviews
                    </td>
                    {detailedProducts.map((prod) => (
                      <td
                        key={prod._id}
                        className="p-3.5 sm:p-4 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-white/10 last:border-r-0"
                      >
                        {prod.numReviews || prod.totalReviews || 0} reviews
                      </td>
                    ))}
                    {emptySlotsCount > 0 && <td className="border-r border-slate-200 dark:border-white/10 last:border-r-0"></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Inline Slot Search & Product Picker Modal */}
      <CompareProductSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
