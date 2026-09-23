import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpDown,
  Boxes,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
  ExternalLink,
  Edit3,
  Trash2,
  X
} from "lucide-react";
import {
  fetchAdminProducts,
  fetchFilterMetadata,
} from "../../api/adminApi";

// Components
import AdminProductCard from "../../components/admin/product/AdminProductCard";
import ProductFiltersSidebar from "../../components/admin/product/ProductFiltersSidebar";
import QuickStockModal from "../../components/admin/product/QuickStockModal";
import DeleteConfirmModal from "../../components/admin/product/DeleteConfirmModal";

export default function AdminProducts() {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const isNavCollapsed = outletContext?.isCollapsed ?? false;

  // State: Filter parameters
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    stockStatus: "", // 'inStock' | 'lowStock' | 'outOfStock'
    rating: "", // '4' | '3' | '2'
    ram: "", // '8GB' | '16GB' | '32GB' | '64GB'
    storage: "", // '256GB' | '512GB' | '1TB' | '2TB'
    isFeatured: false,
    sort: "newest", // 'newest' | 'price_asc' | 'price_desc' | 'stock_asc' | 'rating'
  });

  // State: Debounced search term
  const [searchTerm, setSearchTerm] = useState("");

  // State: View mode (Grid vs Table)
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // State: Mobile Filter Drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // State: Desktop Filter Sidebar Toggle (Independent collapsible panel)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);

  // State: Filter metadata (categories and brands)
  const [filterMeta, setFilterMeta] = useState({ categories: [], brands: [] });

  // State: Products and pagination
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  // State: Modals
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState(null);

  // Sentinel & independent scroll container references
  const sentinelRef = useRef(null);
  const productsScrollRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load filter metadata (categories, brands) on mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await fetchFilterMetadata();
        setFilterMeta({
          categories: meta.categories || [],
          brands: meta.brands || [],
        });
      } catch (err) {
        console.error("Filter metadata fetch error:", err);
      }
    }
    loadMeta();
  }, []);

  // Fetch products (Page 1 reset when filters change)
  const loadProducts = useCallback(
    async (targetPage = 1, isAppending = false) => {
      try {
        if (isAppending) {
          setLoadingMore(true);
        } else {
          setLoadingInitial(true);
        }

        const queryParams = {
          page: targetPage,
          limit: 12,
        };

        if (filters.search) queryParams.search = filters.search;
        if (filters.category) queryParams.category = filters.category;
        if (filters.brand) queryParams.brand = filters.brand;
        if (filters.minPrice) queryParams.minPrice = filters.minPrice;
        if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
        if (filters.rating) queryParams.rating = filters.rating;
        if (filters.ram) queryParams.ram = filters.ram;
        if (filters.storage) queryParams.storage = filters.storage;
        if (filters.isFeatured) queryParams.isFeatured = true;
        if (filters.sort && filters.sort !== "newest") queryParams.sort = filters.sort;

        // Stock status parameter mapping
        if (filters.stockStatus === "inStock") queryParams.inStock = true;
        if (filters.stockStatus === "lowStock") queryParams.lowStock = true;
        if (filters.stockStatus === "outOfStock") queryParams.outOfStock = true;

        const data = await fetchAdminProducts(queryParams);
        const newProducts = data.products || [];
        const pagination = data.pagination || {};

        if (isAppending) {
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        setPage(pagination.page || targetPage);
        setTotalPages(pagination.totalPages || 1);
        setTotalCount(pagination.total || newProducts.length);
        setHasNextPage(pagination.hasNextPage ?? (targetPage < (pagination.totalPages || 1)));
      } catch (err) {
        console.error("Products load failed:", err);
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [filters]
  );

  // Trigger query on filter change
  useEffect(() => {
    setPage(1);
    loadProducts(1, false);
  }, [loadProducts]);

  // Infinite Scroll IntersectionObserver (bound to products independent scroll container)
  useEffect(() => {
    if (!sentinelRef.current) return;

    const scrollContainer = productsScrollRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !loadingInitial && !loadingMore) {
          loadProducts(page + 1, true);
        }
      },
      {
        root: window.innerWidth >= 1024 ? scrollContainer : null,
        threshold: 0.1,
        rootMargin: "250px",
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, loadingInitial, loadingMore, page, loadProducts]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters({
      search: "",
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      stockStatus: "",
      rating: "",
      ram: "",
      storage: "",
      isFeatured: false,
      sort: "newest",
    });
  };

  // Optimistic stock update callback
  const handleStockUpdated = (productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, stock: newStock } : p
      )
    );
  };

  // Optimistic product deletion callback
  const handleProductDeleted = (productId) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  // Active filters count
  const activeFiltersCount =
    (filters.category ? filters.category.split(",").filter(Boolean).length : 0) +
    (filters.brand ? filters.brand.split(",").filter(Boolean).length : 0) +
    (filters.stockStatus ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.ram ? 1 : 0) +
    (filters.storage ? 1 : 0) +
    (filters.isFeatured ? 1 : 0);

  // Currency format
  const formatINR = (val = 0) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  // Dynamic responsive grid columns:
  // 4 cards per row on collapse, 3 cards on open on desktop; 2-3 cards on small devices for modern mobile density
  const isSidebarCollapsed = isNavCollapsed || !showDesktopFilters;
  const gridColumnsClass = isSidebarCollapsed
    ? "grid-cols-2 min-[540px]:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
    : "grid-cols-2 min-[540px]:grid-cols-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3";

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 h-full overflow-hidden">
      {/* Top Title & Primary Actions */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-white tracking-tight">
              Products Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-200 border border-white/15">
              {totalCount.toLocaleString()} items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage electronics catalog, real-time stock allocation, and specs.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Desktop Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowDesktopFilters((prev) => !prev)}
            className={`hidden lg:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all border ${
              showDesktopFilters
                ? "bg-white/[0.08] hover:bg-white/[0.12] text-white border-white/20 shadow-sm"
                : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border-white/10"
            }`}
            title={showDesktopFilters ? "Hide Filter Sidebar" : "Show Filter Sidebar"}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
            <span>{showDesktopFilters ? "Hide Filters" : "Show Filters"}</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-sky-500 text-black font-bold text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table Inventory View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Product CTA */}
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-all shadow-md shadow-white/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Controls Bar: Search, Mobile Filter Toggle, Sort Dropdown */}
      <div className="shrink-0 glass-card p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products by title, brand, SKU, processor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-slate-200"
          >
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-sky-500 text-black font-bold text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sort: e.target.value }))
              }
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#121316] text-white">Newest First</option>
              <option value="price_asc" className="bg-[#121316] text-white">Price: Low to High</option>
              <option value="price_desc" className="bg-[#121316] text-white">Price: High to Low</option>
              <option value="stock_asc" className="bg-[#121316] text-white">Stock: Restock First</option>
              <option value="rating" className="bg-[#121316] text-white">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="shrink-0 flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[11px] font-mono text-slate-500">Active Filters:</span>

          {filters.stockStatus && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-white/[0.06] border border-white/10 text-white">
              Stock: {filters.stockStatus}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, stockStatus: "" }))}
                className="hover:text-rose-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.category &&
            filters.category.split(",").map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-sky-500/10 border border-sky-500/20 text-sky-300"
              >
                {c}
                <button
                  onClick={() => {
                    const updated = filters.category
                      .split(",")
                      .filter((item) => item !== c);
                    setFilters((prev) => ({ ...prev, category: updated.join(",") }));
                  }}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

          {filters.brand &&
            filters.brand.split(",").map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-purple-500/10 border border-purple-500/20 text-purple-300"
              >
                {b}
                <button
                  onClick={() => {
                    const updated = filters.brand
                      .split(",")
                      .filter((item) => item !== b);
                    setFilters((prev) => ({ ...prev, brand: updated.join(",") }));
                  }}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300">
              ₹{filters.minPrice || 0} - ₹{filters.maxPrice || "Max"}
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }))
                }
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.rating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
              Rating: {filters.rating}★+
              <button
                onClick={() => setFilters((prev) => ({ ...prev, rating: "" }))}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.ram && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              RAM: {filters.ram}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, ram: "" }))}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.storage && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              SSD: {filters.storage}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, storage: "" }))}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] font-mono text-slate-400 hover:text-white underline underline-offset-2 ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Workspace: Filters Sidebar + Dynamic Product Stream */}
      <div className="flex-1 min-h-0 flex items-stretch gap-5 lg:gap-6 overflow-hidden">
        {/* Desktop & Mobile Filter Sidebar */}
        <ProductFiltersSidebar
          filters={filters}
          setFilters={setFilters}
          categories={filterMeta.categories}
          brands={filterMeta.brands}
          isOpenMobile={isMobileFilterOpen}
          setIsOpenMobile={setIsMobileFilterOpen}
          onReset={handleResetFilters}
          totalResults={totalCount}
          onCloseDesktop={() => setShowDesktopFilters(false)}
          showDesktop={showDesktopFilters}
        />

        {/* Right Section: Dynamic Product Stream with Independent Scrollbar */}
        <div
          ref={productsScrollRef}
          className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-16 lg:pb-6 space-y-4 sm:space-y-5 touch-pan-y"
        >

          {/* Initial Loading Skeleton */}
          {loadingInitial ? (
            <div className={`grid ${gridColumnsClass} gap-2.5 sm:gap-4 lg:gap-5 animate-pulse`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="rounded-xl sm:rounded-2xl border-2 border-white/20 sm:border-white/10 bg-[#0e1017] p-2.5 sm:p-4 space-y-2 sm:space-y-3"
                >
                  <div className="w-full aspect-[4/3] xs:aspect-square sm:aspect-auto sm:h-52 bg-white/5 rounded-lg sm:rounded-xl" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 bg-white/5 rounded" />
                    <div className="h-3.5 w-full bg-white/5 rounded" />
                  </div>
                  <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <div className="h-4 w-20 bg-white/5 rounded" />
                    <div className="h-3 w-10 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="glass-card p-12 text-center max-w-lg mx-auto my-8 space-y-4">
              <Package className="w-12 h-12 text-slate-500 mx-auto" />
              <div>
                <h3 className="text-lg font-heading font-bold text-white">
                  No Products Found
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  We couldn't find any products matching your active filters or search query.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-pill-primary inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* =========================================================
               1. GRID VIEW (Dynamic Reflow: 4 Cards on Collapse, 3 Cards on Open)
               ========================================================= */
            <div className={`grid ${gridColumnsClass} gap-2.5 sm:gap-4 lg:gap-5 transition-all duration-300`}>
              {products.map((product) => (
                <AdminProductCard
                  key={product._id}
                  product={product}
                  onQuickStock={(p) => setStockModalProduct(p)}
                  onDeleteRequest={(p) => setDeleteModalProduct(p)}
                />
              ))}
            </div>
          ) : (
            /* =========================================================
               2. LIST / TABLE VIEW (Floating Card Rows with White Border & Gaps)
               ========================================================= */
            <div className="overflow-x-auto custom-scrollbar -mx-1 px-1 pb-3">
              <table className="w-full text-left text-xs border-separate border-spacing-y-2.5 min-w-[760px]">
                <thead>
                  <tr className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="pb-1 pt-0 px-4 font-medium">Product</th>
                    <th className="pb-1 pt-0 px-3 font-medium">Category</th>
                    <th className="pb-1 pt-0 px-3 font-medium">SKU</th>
                    <th className="pb-1 pt-0 px-3 font-medium">Price</th>
                    <th className="pb-1 pt-0 px-3 font-medium">Stock Units</th>
                    <th className="pb-1 pt-0 px-3 font-medium">Status</th>
                    <th className="pb-1 pt-0 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stock = product.stock ?? 0;
                    const isLow = stock > 0 && stock <= (product.lowStockThreshold || 5);
                    return (
                      <tr
                        key={product._id}
                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                        className="group transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                      >
                        {/* 1. Product Title, Brand & Image */}
                        <td className="py-3 px-4 bg-[#0e1118]/90 group-hover:bg-[#151924] border-y border-l border-white/15 group-hover:border-white/35 rounded-l-2xl transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                          <div className="flex items-center gap-3 max-w-[250px]">
                            <img
                              src={product.images?.[0]?.url || product.image || ""}
                              alt={product.title}
                              className="w-11 h-11 rounded-xl object-cover bg-slate-800 shrink-0 border border-white/15 group-hover:border-white/35 group-hover:scale-105 transition-all shadow-sm"
                            />
                            <div className="truncate">
                              <p className="font-semibold text-white truncate text-xs group-hover:text-sky-300 transition-colors">
                                {product.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {product.brandName || "Brand"}
                                </span>
                                {product.isFeatured && (
                                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-semibold">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Category */}
                        <td className="py-3 px-3 bg-[#0e1118]/90 group-hover:bg-[#151924] border-y border-white/15 group-hover:border-white/35 text-slate-300 font-mono text-xs transition-all duration-200">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[11px] text-slate-300">
                            {product.categoryName || "General"}
                          </span>
                        </td>

                        {/* 3. SKU */}
                        <td className="py-3 px-3 bg-[#0e1118]/90 group-hover:bg-[#151924] border-y border-white/15 group-hover:border-white/35 font-mono text-slate-400 text-[11px] transition-all duration-200">
                          {product.sku || "N/A"}
                        </td>

                        {/* 4. Price */}
                        <td className="py-3 px-3 bg-[#0e1118]/90 group-hover:bg-[#151924] border-y border-white/15 group-hover:border-white/35 font-mono font-bold text-white whitespace-nowrap transition-all duration-200">
                          <span className="text-sm font-semibold tracking-tight">
                            {formatINR(product.salePrice ?? product.regularPrice)}
                          </span>
                          {product.salePrice && product.regularPrice > product.salePrice && (
                            <span className="block text-[10px] text-slate-500 line-through font-normal">
                              {formatINR(product.regularPrice)}
                            </span>
                          )}
                        </td>

                        {/* 5. Stock Units */}
                        <td className="py-3 px-3 bg-[#0e1118]/90 group-hover:bg-[#151924] border-y border-white/15 group-hover:border-white/35 transition-all duration-200">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStockModalProduct(product);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all hover:scale-105 cursor-pointer shadow-sm ${
                              stock === 0
                                ? "bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25"
                                : isLow
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                                : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                            }`}
                          >
                            {stock} units ✎
                          </button>
                        </td>

                        {/* 6. Status */}
                        <td className="py-3 px-3 bg-[#0e1118]/90 group-hover:bg-[#151924] border-y border-white/15 group-hover:border-white/35 transition-all duration-200">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                              product.isActive !== false
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            }`}
                          >
                            {product.isActive !== false ? "Active" : "Draft"}
                          </span>
                        </td>

                        {/* 7. Actions */}
                        <td className="py-3 px-4 bg-[#0e1118]/90 group-hover:bg-[#151924] border-y border-r border-white/15 group-hover:border-white/35 rounded-r-2xl text-right whitespace-nowrap transition-all duration-200">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/product/${product.slug || product._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="View in Store"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/products/edit/${product._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/15 transition-colors"
                              title="Edit Product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModalProduct(product);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* =========================================================
              3. SCROLLING PAGINATION SENTINEL & LOADING SPINNER
              ========================================================= */}
          <div ref={sentinelRef} className="py-6 flex justify-center items-center">
            {loadingMore && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>Loading more electronics...</span>
              </div>
            )}

            {!hasNextPage && products.length > 0 && !loadingInitial && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-[11px] font-mono text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>All {totalCount} products loaded into memory</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          MODALS: Quick Stock Adjustment & Permanent Deletion
          ========================================================= */}
      {stockModalProduct && (
        <QuickStockModal
          product={stockModalProduct}
          onClose={() => setStockModalProduct(null)}
          onSuccess={handleStockUpdated}
        />
      )}

      {deleteModalProduct && (
        <DeleteConfirmModal
          product={deleteModalProduct}
          onClose={() => setDeleteModalProduct(null)}
          onDeleted={handleProductDeleted}
        />
      )}
    </div>
  );
}
