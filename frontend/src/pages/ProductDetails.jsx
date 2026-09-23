import React, { useState } from "react";
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
} from "lucide-react";
import { useProductDetailsQuery, useProductsQuery } from "@/hooks/useProducts";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductShelf from "@/components/home/ProductShelf";

export default function ProductDetails() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // TanStack Query for Product Details
  const { data: product, isLoading, isError } = useProductDetailsQuery(idOrSlug);

  // TanStack Query for Related Products
  const categorySlug = product?.category?.slug || product?.categoryName || "";
  const { data: relatedData } = useProductsQuery({
    category: categorySlug,
    limit: 4,
  });

  // Zustand State
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07080a] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
        <Navbar />
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-16 flex-1 flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="h-10 w-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-xs font-tech text-slate-400 uppercase tracking-widest">
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
          <div className="h-16 w-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Cpu className="h-8 w-8 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-bold">Hardware Not Found</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              The requested electronics item could not be retrieved from our inventory catalog.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Storefront</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const regularPrice = product.regularPrice || 0;
  const salePrice = product.salePrice ?? regularPrice;
  const discountPercent =
    regularPrice > salePrice
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  const images = product.images?.length
    ? product.images.map((img) => img.url)
    : [
        product.image ||
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      ];

  const activeImage = images[selectedImageIndex] || images[0];

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate("/cart");
  };

  // Filter out the current product from related products
  const relatedProducts = (relatedData?.products || []).filter(
    (p) => p._id !== product._id
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050608] text-slate-900 dark:text-white flex flex-col transition-colors duration-300 relative">
      <Navbar />

      <main className="flex-1 w-full py-6 sm:py-10 z-10">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 text-left overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="hover:text-white transition-colors capitalize">
              {product.categoryName || product.category?.name || "Electronics"}
            </span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-200 truncate max-w-xs">{product.title}</span>
          </nav>

        {/* Product Details Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start text-left mb-16">
          {/* =========================================================
              LEFT COLUMN: Multi-angle Image Gallery
              ========================================================= */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl bg-[#0c0e12] border border-white/10 overflow-hidden flex items-center justify-center p-8 sm:p-12 shadow-2xl">
              <img
                src={activeImage}
                alt={product.title}
                className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500"
              />
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Switcher (if multiple images) */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-18 w-18 shrink-0 rounded-2xl bg-[#0c0e12] border p-2 overflow-hidden transition-all ${
                      selectedImageIndex === idx
                        ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105"
                        : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =========================================================
              RIGHT COLUMN: Product Meta, Pricing, Specs, CTAs
              ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Brand & Stock Status */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-tech font-bold uppercase tracking-wider text-slate-300">
                {product.brandName || product.brand?.name || "AUTHENTIC"}
              </span>

              <span
                className={`text-xs font-semibold flex items-center gap-1.5 ${
                  product.stock > 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    product.stock > 0 ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                <span>
                  {product.stock > 0
                    ? `In Stock (${product.stock} units)`
                    : "Out of Stock"}
                </span>
              </span>
            </div>

            {/* Product Title */}
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="flex items-center text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                <span className="ml-1 font-bold text-white">
                  {product.rating ? Number(product.rating).toFixed(1) : "4.9"}
                </span>
              </div>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">
                {product.numReviews || "140"} verified owner ratings
              </span>
            </div>

            {/* Pricing Engine */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                  {formatINR(salePrice)}
                </span>
                {regularPrice > salePrice && (
                  <span className="text-sm sm:text-base text-slate-500 line-through">
                    {formatINR(regularPrice)}
                  </span>
                )}
              </div>
              {regularPrice > salePrice && (
                <p className="text-xs text-emerald-400 font-semibold">
                  You save {formatINR(regularPrice - salePrice)} ({discountPercent}%) with launch pricing
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                Inclusive of all taxes & insured doorstep delivery
              </p>
            </div>

            {/* Quantity Selector & Action CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/15 rounded-xl bg-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="h-10 w-10 flex items-center justify-center text-white disabled:opacity-40 hover:bg-white/10 rounded-l-xl transition-colors text-base"
                  >
                    -
                  </button>
                  <span className="h-10 w-12 flex items-center justify-center font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                    disabled={quantity >= (product.stock || 10)}
                    className="h-10 w-10 flex items-center justify-center text-white disabled:opacity-40 hover:bg-white/10 rounded-r-xl transition-colors text-base"
                  >
                    +
                  </button>
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                    isInWishlist
                      ? "bg-red-500/20 border-red-500/40 text-red-300"
                      : "bg-white/[0.04] border-white/15 text-slate-300 hover:text-white"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${isInWishlist ? "fill-red-400" : ""}`}
                  />
                  <span>{isInWishlist ? "Wishlisted" : "Save"}</span>
                </button>
              </div>

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    product.stock === 0
                      ? "bg-white/5 text-slate-500 cursor-not-allowed"
                      : isAdded
                      ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                      : "bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className={`h-12 rounded-xl text-sm font-semibold bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    product.stock === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                >
                  <Zap className="h-4 w-4 text-cyan-300" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Hardware Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/[0.08] text-center">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <Truck className="h-4 w-4 text-slate-400 mx-auto" />
                <p className="text-[10px] font-semibold text-slate-300">
                  Insured Express
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <ShieldCheck className="h-4 w-4 text-slate-400 mx-auto" />
                <p className="text-[10px] font-semibold text-slate-300">
                  2-Yr Warranty
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <RefreshCw className="h-4 w-4 text-slate-400 mx-auto" />
                <p className="text-[10px] font-semibold text-slate-300">
                  7-Day Return
                </p>
              </div>
            </div>

            {/* Technical Specifications Table */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                  Technical Specifications
                </h3>
                <div className="divide-y divide-white/[0.06] border border-white/10 rounded-xl overflow-hidden bg-white/[0.015]">
                  {Object.entries(product.specifications).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-2 p-3 text-xs"
                      >
                        <span className="text-slate-400 capitalize font-medium">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="text-white font-semibold">
                          {String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Related Products Shelf */}
        {relatedProducts.length > 0 && (
          <div className="pt-10 border-t border-white/[0.08]">
            <ProductShelf
              title="Customers Also Viewed"
              subtitle="Complementary flagship hardware from this category"
              badgeText="RELATED GEAR"
              products={relatedProducts}
              limit={4}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
