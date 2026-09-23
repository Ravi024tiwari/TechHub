import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Cpu,
  ChevronRight,
  ArrowLeft,
  Check,
  Zap,
  Tag,
  Package,
  Clock,
  Layers,
  Sparkles
} from "lucide-react";
import { useProductDetailsQuery, useProductsQuery } from "@/hooks/useProducts";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductShelf from "@/components/home/ProductShelf";

// Subcomponents for Product Details
import ProductGallery from "@/components/product-details/ProductGallery";
import ColorVariantSelector from "@/components/product-details/ColorVariantSelector";
import StockTelemetryBadge from "@/components/product-details/StockTelemetryBadge";
import SpecsHighlightsTabs from "@/components/product-details/SpecsHighlightsTabs";
import AdminProductHUD from "@/components/product-details/AdminProductHUD";
import MobileStickyBuyBar from "@/components/product-details/MobileStickyBuyBar";

export default function ProductDetails() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();

  // State
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [localStockOverride, setLocalStockOverride] = useState(null);

  // TanStack Query for Product Details
  const { data: product, isLoading, isError } = useProductDetailsQuery(idOrSlug);

  // Initialize selected color variant on product load
  useEffect(() => {
    if (product?.colors && product.colors.length > 0) {
      const defaultVariant = product.colors.find((c) => c.isDefault) || product.colors[0];
      setSelectedColor(defaultVariant);
    } else {
      setSelectedColor(null);
    }
  }, [product]);

  // TanStack Query for Related Products
  const categorySlug = product?.category?.slug || product?.categoryName || "";
  const { data: relatedData } = useProductsQuery({
    category: categorySlug,
    limit: 4,
  });

  // Zustand Cart & Wishlist
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) =>
    product ? state.isInWishlist(product._id) : false
  );

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  // Dynamic Image Sequence: Color variant photos first, then catalog photos
  const galleryImages = useMemo(() => {
    const list = [];
    if (selectedColor?.images && selectedColor.images.length > 0) {
      selectedColor.images.forEach((img) => {
        const url = typeof img === "string" ? img : img.url;
        if (url && !list.includes(url)) list.push(url);
      });
    }

    if (product?.images && product.images.length > 0) {
      product.images.forEach((img) => {
        const url = typeof img === "string" ? img : img.url;
        if (url && !list.includes(url)) list.push(url);
      });
    } else if (product?.image && !list.includes(product.image)) {
      list.push(product.image);
    }

    return list.length > 0
      ? list
      : ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"];
  }, [selectedColor, product]);

  // Pricing calculations with variant override
  const baseRegularPrice = product?.regularPrice || 0;
  const baseSalePrice = product?.salePrice ?? baseRegularPrice;
  const activePrice = selectedColor?.priceOverride ?? baseSalePrice;
  const activeRegularPrice =
    selectedColor?.priceOverride && selectedColor.priceOverride > baseRegularPrice
      ? selectedColor.priceOverride
      : baseRegularPrice;

  const discountPercent =
    activeRegularPrice > activePrice
      ? Math.round(((activeRegularPrice - activePrice) / activeRegularPrice) * 100)
      : 0;

  // Stock telemetry
  const baseStock =
    selectedColor?.stock !== undefined ? Number(selectedColor.stock) : Number(product?.stock) || 0;
  const currentStock = localStockOverride !== null ? localStockOverride : baseStock;
  const threshold = Number(product?.lowStockThreshold) || 5;

  const activeSku = selectedColor?.sku || product?.sku;

  // Cart actions
  const handleAddToCart = () => {
    addItem(product, quantity, selectedColor?.colorName);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedColor?.colorName);
    navigate("/cart");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07080a] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
        <Navbar />
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-16 flex-1 flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="h-10 w-10 border-2 border-slate-300 dark:border-white/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Hydrating Hardware Blueprint...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07080a] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-24 flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 flex items-center justify-center">
            <Cpu className="h-8 w-8 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
              Hardware Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              The requested electronics item could not be retrieved from our inventory catalog.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 border border-slate-900 dark:border-white text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Storefront</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter out current product from related products
  const relatedProducts = (relatedData?.products || []).filter((p) => p._id !== product._id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050608] text-slate-900 dark:text-white flex flex-col transition-colors duration-300 relative pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 w-full py-6 sm:py-10 z-10">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          {/* Storefront Header Row: Breadcrumb Navigation + Integrated Admin Quick Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-200 dark:border-white/10">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 text-left overflow-x-auto whitespace-nowrap scrollbar-none py-1">
              <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
              <Link
                to={`/category/${product.category?.slug || product.categoryName || ""}`}
                className="hover:text-slate-900 dark:hover:text-white transition-colors capitalize shrink-0"
              >
                {product.categoryName || product.category?.name || "Electronics"}
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs md:max-w-md font-medium">
                {product.title}
              </span>
            </nav>

            {/* Admin Integrated Quick Toolbar (Visible only to authenticated admins) */}
            <AdminProductHUD
              product={product}
              currentStock={currentStock}
              onStockUpdated={(newStock) => setLocalStockOverride(newStock)}
            />
          </div>

          {/* Product Details Two-Column Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-start text-left mb-16">
            {/* =========================================================
                LEFT COLUMN: Multi-Angle Interactive Proportional Gallery
                ========================================================= */}
            <div className="lg:col-span-6">
              <ProductGallery
                images={galleryImages}
                title={product.title}
                discountPercent={discountPercent}
                selectedColorName={selectedColor?.colorName}
              />
            </div>

            {/* =========================================================
                RIGHT COLUMN: Meta, Finish Studio, Pricing, CTAs
                ========================================================= */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6">
              {/* Brand Pill & Stock Status */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-slate-200/90 dark:bg-white/[0.08] border border-slate-300 dark:border-white/15 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {product.brandName || product.brand?.name || "GENUINE"}
                </span>

                {/* Live Stock Telemetry Badge */}
                <StockTelemetryBadge
                  stock={currentStock}
                  threshold={threshold}
                  selectedColorName={selectedColor?.colorName}
                />
              </div>

              {/* Product Title & SKU */}
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-950 dark:text-white tracking-tight leading-tight">
                  {product.title}
                </h1>
                {activeSku && (
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                    MODEL SKU: <span className="text-slate-800 dark:text-slate-200 font-bold">{activeSku}</span>
                  </p>
                )}
              </div>

              {/* Ratings Tier */}
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="ml-1 font-bold text-slate-900 dark:text-white">
                    {product.rating ? Number(product.rating).toFixed(1) : "4.9"}
                  </span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {product.numReviews || "140"} verified customer ratings
                </span>
              </div>

              {/* Pricing Engine */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c0e14] border-2 border-slate-200 dark:border-white/10 shadow-sm space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-950 dark:text-white tracking-tight">
                    {formatINR(activePrice)}
                  </span>
                  {activeRegularPrice > activePrice && (
                    <span className="text-sm sm:text-base text-slate-400 line-through font-mono">
                      {formatINR(activeRegularPrice)}
                    </span>
                  )}
                </div>
                {activeRegularPrice > activePrice && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                    Instant savings of {formatINR(activeRegularPrice - activePrice)} ({discountPercent}% discount)
                  </p>
                )}
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Inclusive of all taxes · Complimentary insured shipping across India
                </p>
              </div>

              {/* Color Finish Studio */}
              {product.colors && product.colors.length > 0 && (
                <ColorVariantSelector
                  colors={product.colors}
                  selectedColor={selectedColor}
                  onSelectColor={(color) => setSelectedColor(color)}
                  basePrice={baseSalePrice}
                />
              )}

              {/* Quantity Stepper & Buy CTAs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Stepper with high-contrast tactile buttons */}
                  <div className="flex items-center border-2 border-slate-300 dark:border-white/15 rounded-xl bg-slate-100 dark:bg-white/[0.04] overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || currentStock === 0}
                      className="h-10 w-10 flex items-center justify-center text-slate-900 dark:text-white font-bold disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors text-base cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="h-10 w-12 flex items-center justify-center font-mono font-bold text-sm text-slate-950 dark:text-white bg-white dark:bg-black/30 border-x border-slate-300 dark:border-white/10">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                      disabled={quantity >= currentStock || currentStock === 0}
                      className="h-10 w-10 flex items-center justify-center text-slate-900 dark:text-white font-bold disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors text-base cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Wishlist Button (Guaranteed Visible Contrast in Both Modes) */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`flex-1 h-10 px-4 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-heading font-bold transition-all shadow-sm cursor-pointer ${
                      isInWishlist
                        ? "bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400"
                        : "bg-white hover:bg-slate-100 dark:bg-white/[0.05] dark:hover:bg-white/10 border-slate-300 dark:border-white/15 text-slate-800 dark:text-white"
                    }`}
                  >
                    <Heart className={`h-4 w-4 shrink-0 ${isInWishlist ? "fill-rose-500 text-rose-500" : "text-slate-600 dark:text-slate-300"}`} />
                    <span>{isInWishlist ? "Saved to Wishlist" : "Save for Later"}</span>
                  </button>
                </div>

                {/* Primary Action Buttons (High Contrast & High Tactile Feedback) */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={currentStock === 0}
                    className={`h-12 rounded-xl text-sm font-heading font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md border-2 ${
                      currentStock === 0
                        ? "bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 border-transparent cursor-not-allowed"
                        : isAdded
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 font-extrabold shadow-emerald-500/30 cursor-pointer"
                        : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:text-white dark:border-white/20 shadow-md shadow-slate-900/15 cursor-pointer"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-4 w-4 stroke-[3] text-white shrink-0" />
                        <span className="text-white font-extrabold">Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4 text-white shrink-0" />
                        <span className="text-white font-bold">Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={currentStock === 0}
                    className={`h-12 rounded-xl text-sm font-heading font-extrabold bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white border-2 border-sky-400/40 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      currentStock === 0 ? "cursor-not-allowed opacity-40 border-transparent" : "cursor-pointer"
                    }`}
                  >
                    <Zap className="h-4 w-4 text-white stroke-[2.5]" />
                    <span className="text-white">Instant Checkout</span>
                  </button>
                </div>
              </div>

              {/* Hardware Value Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 dark:border-white/[0.08] text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1 shadow-sm">
                  <Truck className="h-4 w-4 text-sky-500 mx-auto" />
                  <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    Insured Express
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 mx-auto" />
                  <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    Official Warranty
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1 shadow-sm">
                  <RefreshCw className="h-4 w-4 text-purple-500 mx-auto" />
                  <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    7-Day Return
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              FULL SPECIFICATION MATRIX & UNBOXING TABS
              ========================================================= */}
          <SpecsHighlightsTabs product={product} />

          {/* Related Products Shelf */}
          {relatedProducts.length > 0 && (
            <div className="pt-16 border-t border-slate-200 dark:border-white/[0.08] mt-12">
              <ProductShelf
                title="Complementary Hardware"
                subtitle="High-performance matching accessories & electronics"
                badgeText="MATCHING GEAR"
                products={relatedProducts}
                limit={4}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Purchase Dock */}
      <MobileStickyBuyBar
        product={product}
        selectedColor={selectedColor}
        activePrice={activePrice}
        isAdded={isAdded}
        onAddToCart={handleAddToCart}
        stock={currentStock}
      />

      <Footer />
    </div>
  );
}
