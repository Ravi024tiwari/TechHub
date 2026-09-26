import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import ProductFilterSidebar from "@/components/catalog/ProductFilterSidebar";
import ActiveFilterBadges from "@/components/catalog/ActiveFilterBadges";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import CatalogPagination from "@/components/catalog/CatalogPagination";
import CatalogEmptyState from "@/components/catalog/CatalogEmptyState";
import { useProductsQuery, useFilterMetadataQuery } from "@/hooks/useProducts";
import {
  Cpu,
  ChevronRight,
  Sparkles,
  Layers,
  Laptop,
  Smartphone,
  Headphones,
  Monitor,
  Gamepad2,
  Watch,
  ShieldCheck,
  Zap,
  RotateCcw,
} from "lucide-react";

const QUICK_CATEGORY_PILLS = [
  { id: "all", label: "All Gear", slug: "", icon: Layers },
  { id: "laptops", label: "Laptops", slug: "laptops", icon: Laptop },
  { id: "smartphones", label: "Smartphones", slug: "smartphones", icon: Smartphone },
  { id: "audio", label: "Audio Gear", slug: "audio", icon: Headphones },
  { id: "gaming", label: "Gaming", slug: "gaming", icon: Gamepad2 },
  { id: "monitors", label: "Displays", slug: "monitors", icon: Monitor },
  { id: "wearables", label: "Wearables", slug: "wearables", icon: Watch },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug: routeCategorySlug } = useParams();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid-4");

  // Extract all active filters from URL query parameters
  const currentFilters = useMemo(() => {
    const rawCategory = routeCategorySlug || searchParams.get("category") || "";
    return {
      search: searchParams.get("search") || "",
      category: rawCategory,
      brand: searchParams.get("brand") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      rating: searchParams.get("rating") || "",
      inStock: searchParams.get("inStock") || "",
      ram: searchParams.get("ram") || "",
      storage: searchParams.get("storage") || "",
      processor: searchParams.get("processor") || "",
      sort: searchParams.get("sort") || "",
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "12", 10),
    };
  }, [searchParams, routeCategorySlug]);

  // Build API Query Parameters
  const apiQueryParams = useMemo(() => {
    const params = {};
    if (currentFilters.search) params.search = currentFilters.search;
    if (currentFilters.category) params.category = currentFilters.category;
    if (currentFilters.brand) params.brand = currentFilters.brand;
    if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
    if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;
    if (currentFilters.rating) params.rating = currentFilters.rating;
    if (currentFilters.inStock) params.inStock = currentFilters.inStock;
    if (currentFilters.ram) params.ram = currentFilters.ram;
    if (currentFilters.storage) params.storage = currentFilters.storage;
    if (currentFilters.processor) params.processor = currentFilters.processor;
    if (currentFilters.sort) params.sort = currentFilters.sort;
    params.page = currentFilters.page;
    params.limit = currentFilters.limit;
    return params;
  }, [currentFilters]);

  // Queries
  const { data: productsData, isLoading, isFetching } = useProductsQuery(apiQueryParams);
  const { data: metadata, isLoading: isLoadingMetadata } = useFilterMetadataQuery({
    category: currentFilters.category || undefined,
    brand: currentFilters.brand || undefined,
    search: currentFilters.search || undefined,
  });

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  };

  // Calculate active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (currentFilters.search) count++;
    if (currentFilters.category) {
      count += currentFilters.category.split(",").filter(Boolean).length;
    }
    if (currentFilters.brand) {
      count += currentFilters.brand.split(",").filter(Boolean).length;
    }
    if (currentFilters.minPrice || currentFilters.maxPrice) count++;
    if (currentFilters.rating) count++;
    if (currentFilters.inStock) count++;
    if (currentFilters.ram) count++;
    if (currentFilters.storage) count++;
    if (currentFilters.processor) count++;
    return count;
  }, [currentFilters]);

  // Filter updates helper
  const updateFilters = (newParams) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, value]) => {
          if (value === undefined || value === null || value === "") {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });
        if (!("page" in newParams)) {
          next.delete("page");
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleRemoveFilter = (key, customValue) => {
    updateFilters({ [key]: customValue });
  };

  // Lock body scroll when mobile filter is active
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileFilterOpen]);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      {/* Universal Desktop & Mobile Header */}
      <Navbar />

      {/* =========================================================================
          KEYNOTE HERO BANNER WITH AMBIENT GRADIENT & QUICK CATEGORY PILLS
          ========================================================================= */}
      <section className="relative w-full border-b border-slate-200 dark:border-white/[0.08] bg-white dark:bg-gradient-to-r dark:from-[#0a0d15] dark:via-[#0e1320] dark:to-[#0a0d15] overflow-hidden">
        {/* Ambient Silver & Cyan Lighting Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-5 sm:py-7 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-tech text-slate-500 dark:text-slate-400 mb-2.5">
            <Link to="/" className="hover:text-sky-600 dark:hover:text-white transition-colors">
              TechHaven
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-medium">
              Hardware Catalog
            </span>
            {currentFilters.category && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="text-sky-600 dark:text-sky-400 font-bold uppercase">
                  {currentFilters.category}
                </span>
              </>
            )}
          </nav>

          {/* Heading + Value Proposition Strip */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/10 dark:bg-sky-400/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-[11px] font-tech uppercase tracking-widest mb-1.5 font-semibold">
                <Sparkles className="h-3 w-3" />
                <span>Authorized Hardware Catalog</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Flagship Precision Gear
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Studio displays, workstations, audio systems, and flagship smartphones backed by official manufacturer warranty.
              </p>
            </div>

            {/* Live Trust Metrics */}
            <div className="hidden sm:flex items-center gap-4 text-xs font-tech text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl shadow-xs">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">100% Genuine OEM</span>
              </div>
              <span className="h-3 w-[1px] bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Same-Day Dispatch</span>
              </div>
            </div>
          </div>

          {/* Quick Category Strip (Interactive 1-Click Horizontal Filter Rail) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar pt-1">
            {QUICK_CATEGORY_PILLS.map((pill) => {
              const Icon = pill.icon;
              const isActive =
                (!currentFilters.category && pill.id === "all") ||
                currentFilters.category.toLowerCase() === pill.slug.toLowerCase();

              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => updateFilters({ category: pill.slug || undefined })}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-102"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-sky-400 dark:text-sky-600" : "text-slate-400"}`} />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN STOREFRONT WORKSPACE (SIDEBAR + PRODUCTS GRID)
          ========================================================================= */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        <div className="flex items-start gap-6 lg:gap-8">
          {/* =========================================================
              LEFT COLUMN: Sticky Desktop Filter Sidebar
              ========================================================= */}
          <div className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
            <ProductFilterSidebar
              filters={currentFilters}
              metadata={metadata}
              isLoadingMetadata={isLoadingMetadata}
              onFilterChange={updateFilters}
              onResetFilters={handleResetFilters}
              hasActiveFilters={activeFilterCount > 0}
            />
          </div>

          {/* =========================================================
              RIGHT COLUMN: Toolbar, Badges, Product Grid & Pagination
              ========================================================= */}
          <div className="flex-1 w-full min-w-0 space-y-4 sm:space-y-5">
            {/* 1. Catalog Toolbar (Sort, View Mode, Mobile Filter Trigger, Counter) */}
            <CatalogToolbar
              totalProducts={pagination.total || 0}
              currentPage={pagination.page || 1}
              limit={pagination.limit || 12}
              sort={currentFilters.sort}
              viewMode={viewMode}
              onSortChange={(newSort) => updateFilters({ sort: newSort })}
              onViewModeChange={(mode) => setViewMode(mode)}
              onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
              activeFilterCount={activeFilterCount}
            />

            {/* 2. Active Filter Chips Ribbon */}
            <ActiveFilterBadges
              filters={currentFilters}
              metadata={metadata}
              totalProducts={pagination.total || 0}
              onRemoveFilter={handleRemoveFilter}
              onResetFilters={handleResetFilters}
            />

            {/* 3. Products Grid Area: 2-3 cards on small devices for modern mobile density (same as Admin section) */}
            {isLoading ? (
              <div
                className={`grid gap-2.5 sm:gap-4 lg:gap-5 ${
                  viewMode === "grid-3"
                    ? "grid-cols-2 min-[540px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
                    : "grid-cols-2 min-[540px]:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
                }`}
              >
                {Array.from({ length: 8 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div
                className={`grid gap-2.5 sm:gap-4 lg:gap-5 transition-opacity duration-200 ${
                  isFetching ? "opacity-75" : "opacity-100"
                } ${
                  viewMode === "grid-3"
                    ? "grid-cols-2 min-[540px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
                    : "grid-cols-2 min-[540px]:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
                }`}
              >
                {products.map((product) => (
                  <div key={product._id} className="h-full">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <CatalogEmptyState
                onResetFilters={handleResetFilters}
                onSelectCategory={(slug) => updateFilters({ category: slug })}
              />
            )}

            {/* 4. Enterprise Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pt-6">
                <CatalogPagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => updateFilters({ page })}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =========================================================================
          MOBILE SLIDING FILTER DRAWER (< 1024px)
          ========================================================================= */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-sm h-full bg-white dark:bg-[#0c0f17] shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
            <ProductFilterSidebar
              filters={currentFilters}
              metadata={metadata}
              isLoadingMetadata={isLoadingMetadata}
              onFilterChange={updateFilters}
              onResetFilters={handleResetFilters}
              hasActiveFilters={activeFilterCount > 0}
              isMobileModal={true}
              onCloseMobile={() => setIsMobileFilterOpen(false)}
              className="h-full rounded-none border-0"
            />
          </div>
        </div>
      )}

      {/* Universal Enterprise Footer */}
      <Footer />
    </div>
  );
}
