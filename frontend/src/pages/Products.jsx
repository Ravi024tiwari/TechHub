import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useParams, useNavigate, Link } from "react-router-dom";
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
  Home,
  X,
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

const CATEGORY_HEADER_CONTENT = {
  default: {
    badge: "Authorized Hardware Catalog",
    titlePrefix: "Flagship",
    titleHighlight: "Precision Gear",
    desc: "Studio displays, workstations, acoustic audio systems, and flagship smartphones backed by official manufacturer warranty.",
  },
  laptops: {
    badge: "High Performance Computing",
    titlePrefix: "Next-Gen",
    titleHighlight: "Laptops & Workstations",
    desc: "Unleash relentless computational power with top-tier silicon, ultra-dense displays, and enterprise thermal engineering.",
  },
  smartphones: {
    badge: "Next-Gen Mobile Telephony",
    titlePrefix: "Flagship",
    titleHighlight: "Mobile Devices",
    desc: "Pro camera arrays, aerospace titanium enclosures, and all-day battery life engineered for modern power users.",
  },
  audio: {
    badge: "Acoustic Fidelity Systems",
    titlePrefix: "Studio-Grade",
    titleHighlight: "Audio & ANC Gear",
    desc: "Audiophile-tuned drivers, spatial sound immersion, and active noise cancellation for pristine acoustic clarity.",
  },
  gaming: {
    badge: "Competitive Esports Hardware",
    titlePrefix: "Pro-Tier",
    titleHighlight: "Gaming Battlestations",
    desc: "High-refresh displays, low-latency audio gear, and tournament-grade peripherals built for peak victory.",
  },
  monitors: {
    badge: "Reference Studio Displays",
    titlePrefix: "Ultra-Crisp",
    titleHighlight: "Displays & Screens",
    desc: "Color-accurate OLED and IPS panels, calibrated for digital creators, engineers, and high-framerate workflows.",
  },
  wearables: {
    badge: "Biometric & Active Tech",
    titlePrefix: "Intelligent",
    titleHighlight: "Wearables & Smartwatches",
    desc: "Advanced biometric telemetry, cellular freedom, and lightweight titanium durability on your wrist.",
  },
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug: routeCategorySlug } = useParams();
  const navigate = useNavigate();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid-4");

  // Extract all active filters from URL query parameters
  const currentFilters = useMemo(() => {
    // If routeCategorySlug is set and no search param, use route slug; otherwise searchParams takes precedence
    const rawCategory =
      searchParams.get("category") !== null
        ? searchParams.get("category")
        : routeCategorySlug || "";

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

  // Dynamic header content based on current category
  const activeHeader = useMemo(() => {
    const cat = (currentFilters.category || "").toLowerCase();
    return CATEGORY_HEADER_CONTENT[cat] || CATEGORY_HEADER_CONTENT.default;
  }, [currentFilters.category]);

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
    // If currently on /category/:categorySlug, transition to /products to avoid route param locking
    if (routeCategorySlug) {
      const next = new URLSearchParams(searchParams);

      // If category is not explicitly being modified in newParams, preserve the route slug
      if (!("category" in newParams)) {
        next.set("category", routeCategorySlug);
      }

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

      const qs = next.toString();
      navigate(`/products${qs ? `?${qs}` : ""}`, { replace: true });
      return;
    }

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

  // Full reset: Navigate directly to /products with clean slate
  const handleResetFilters = () => {
    navigate("/products", { replace: true });
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
      <section className="relative w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-[#0a0d15] dark:via-[#0c101c] dark:to-[#07090e] overflow-hidden">
        {/* Subtle Cyber Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60 dark:opacity-40 pointer-events-none" />

        {/* Ambient Brand Lighting Orbs (Cyber Orange & Amber Slate Glow) */}
        <div className="absolute top-0 right-1/4 w-[360px] h-[360px] bg-orange-500/[0.07] dark:bg-orange-500/[0.05] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-8 w-64 h-64 bg-amber-500/[0.05] dark:bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3.5 sm:py-5 lg:py-6 relative z-10">
          {/* Breadcrumb Navigation + Live Inventory Telemetry */}
          <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3.5">
            <nav className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-tech text-slate-500 dark:text-slate-400">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium group"
              >
                <Home className="h-3.5 w-3.5 text-slate-400 group-hover:text-orange-500 transition-colors shrink-0" />
                <span>TechHub</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600 shrink-0" />
              <button
                type="button"
                onClick={() => updateFilters({ category: undefined })}
                className={`transition-colors font-medium cursor-pointer ${currentFilters.category
                    ? "hover:text-orange-600 dark:hover:text-orange-400 text-slate-600 dark:text-slate-400"
                    : "text-slate-900 dark:text-white font-semibold"
                  }`}
              >
                Hardware Catalog
              </button>
              {currentFilters.category && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    <span>{currentFilters.category}</span>
                    <button
                      type="button"
                      onClick={() => updateFilters({ category: undefined })}
                      title="Clear category filter"
                      className="hover:text-orange-800 dark:hover:text-orange-200 transition-colors p-0.5 rounded-full cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                </>
              )}
            </nav>

            {/* Live Inventory Telemetry Capsule (Visible on all devices!) */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-[10px] sm:text-[11px] font-mono text-slate-600 dark:text-slate-300 backdrop-blur-xs shadow-2xs shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline font-semibold tracking-wider text-slate-700 dark:text-slate-300">
                LIVE CATALOG
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="text-orange-600 dark:text-orange-400 font-bold">
                {pagination.total || 0} UNITS
              </span>
            </div>
          </div>

          {/* Heading + Value Proposition Strip */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-5">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/25 text-orange-600 dark:text-orange-400 text-[10px] sm:text-[11px] font-tech uppercase tracking-wider mb-1.5 font-semibold shadow-2xs">
                <Sparkles className="h-3 w-3 text-orange-500" />
                <span>{activeHeader.badge}</span>
              </div>
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-4.5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {activeHeader.titlePrefix}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">
                  {activeHeader.titleHighlight}
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed font-sans line-clamp-2 sm:line-clamp-none">
                {activeHeader.desc}
              </p>
            </div>

            {/* Live Trust & Guarantee Telemetry Capsule: 2-column horizontal grid on mobile! */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full lg:w-auto shrink-0">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 shadow-xs backdrop-blur-xs">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug truncate">
                    100% Genuine OEM
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-normal truncate">
                    Direct Warranty
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 shadow-xs backdrop-blur-xs">
                <div className="p-1.5 rounded-lg bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug truncate">
                    Same-Day Dispatch
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-normal truncate">
                    Express Tracked
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Category Rail: Interactive edge-to-edge scrollable strip */}
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
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
                    className={`group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-heading font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${isActive
                        ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25 border border-orange-400/50 scale-[1.02]"
                        : "bg-white/80 hover:bg-white dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-400 shadow-2xs"
                      }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110 ${isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-orange-500"
                        }`}
                    />
                    <span>{pill.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN STOREFRONT WORKSPACE (SIDEBAR + PRODUCTS GRID)
          ========================================================================= */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-5 sm:pt-7 pb-16 sm:pb-24 lg:pb-28">
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
                className={`grid gap-2.5 sm:gap-4 lg:gap-5 ${viewMode === "grid-3"
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
                className={`grid gap-2.5 sm:gap-4 lg:gap-5 transition-opacity duration-200 ${isFetching ? "opacity-75" : "opacity-100"
                  } ${viewMode === "grid-3"
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
