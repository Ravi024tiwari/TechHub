import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  AlertTriangle,
  AlertOctagon,
  Boxes,
  Package,
  Search,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  SlidersHorizontal,
  XCircle,
  ExternalLink,
  ShieldCheck,
  PackageCheck
} from "lucide-react";
import { fetchLowStockAlerts, deleteProduct } from "../../api/adminApi";

// Directly reuse the perfected AdminProductCard & modals
import AdminProductCard from "../../components/admin/product/AdminProductCard";
import QuickStockModal from "../../components/admin/product/QuickStockModal";
import DeleteConfirmModal from "../../components/admin/product/DeleteConfirmModal";

export default function AdminInventory() {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const isNavCollapsed = outletContext?.isCollapsed ?? false;

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all"); // 'all' | 'outOfStock' | 'critical' | 'warning'
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("stock_asc"); // 'stock_asc' | 'stock_desc' | 'price_desc' | 'price_asc'

  // Modals state
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState(null);
  const [actionSuccessToast, setActionSuccessToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (actionSuccessToast) {
      const timer = setTimeout(() => setActionSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccessToast]);

  // Load low stock alerts
  const loadAlerts = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchLowStockAlerts();
      const list = data?.products || (Array.isArray(data) ? data : []);
      setProducts(list);
    } catch (err) {
      console.error("Failed to load low stock alerts:", err);
      setError(err?.userMessage || "Failed to retrieve real-time inventory alerts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Derived KPI Metrics
  const metrics = useMemo(() => {
    let outOfStockCount = 0;
    let criticalLowCount = 0; // stock <= 3 and > 0
    let warningCount = 0; // stock > 3 and <= threshold
    let totalDeficitUnits = 0;

    products.forEach((p) => {
      const stock = Number(p.stock) || 0;
      const threshold = Number(p.lowStockThreshold) || 5;

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= 3) {
        criticalLowCount++;
      } else {
        warningCount++;
      }

      const deficit = Math.max(0, threshold - stock);
      totalDeficitUnits += deficit;
    });

    return {
      totalAlerts: products.length,
      outOfStockCount,
      criticalLowCount,
      warningCount,
      totalDeficitUnits,
    };
  }, [products]);

  // Unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const cats = new Map();
    products.forEach((p) => {
      const catName = p.category?.name || p.categoryName || (typeof p.category === "string" ? p.category : null);
      const catId = p.category?._id || catName;
      if (catName && catId) {
        cats.set(catId, catName);
      }
    });
    return Array.from(cats.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const stock = Number(p.stock) || 0;
        const threshold = Number(p.lowStockThreshold) || 5;

        // Severity filter
        if (severityFilter === "outOfStock" && stock !== 0) return false;
        if (severityFilter === "critical" && (stock === 0 || stock > 3)) return false;
        if (severityFilter === "warning" && (stock === 0 || stock <= 3)) return false;

        // Category filter
        if (categoryFilter !== "all") {
          const catId = p.category?._id || p.category;
          const catName = p.category?.name || p.categoryName;
          if (catId !== categoryFilter && catName !== categoryFilter) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const title = (p.title || "").toLowerCase();
          const sku = (p.sku || "").toLowerCase();
          const brand = (p.brand?.name || p.brandName || "").toLowerCase();
          if (!title.includes(q) && !sku.includes(q) && !brand.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const stockA = Number(a.stock) || 0;
        const stockB = Number(b.stock) || 0;
        const priceA = Number(a.salePrice ?? a.regularPrice) || 0;
        const priceB = Number(b.salePrice ?? b.regularPrice) || 0;

        if (sortBy === "stock_asc") return stockA - stockB;
        if (sortBy === "stock_desc") return stockB - stockA;
        if (sortBy === "price_desc") return priceB - priceA;
        if (sortBy === "price_asc") return priceA - priceB;
        return 0;
      });
  }, [products, severityFilter, categoryFilter, searchQuery, sortBy]);

  // Handle Quick Stock Update Success
  const handleStockUpdateSuccess = (productId, newStock) => {
    const updated = products.map((p) => {
      if (p._id === productId) {
        return { ...p, stock: newStock };
      }
      return p;
    });

    const targetProduct = products.find((p) => p._id === productId);
    const threshold = targetProduct?.lowStockThreshold || 5;

    setProducts(updated);

    if (newStock > threshold) {
      setActionSuccessToast({
        title: "Inventory Restocked to Healthy Level",
        message: `${targetProduct?.title || "Product"} is now above threshold (${newStock} units).`,
        type: "success",
      });
    } else {
      setActionSuccessToast({
        title: "Stock Adjusted",
        message: `Inventory updated to ${newStock} units.`,
        type: "info",
      });
    }
  };

  // Handle Delete Success
  const handleDeleteSuccess = (productId) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    setActionSuccessToast({
      title: "Product Decommissioned",
      message: "The product was removed from catalog & alerts.",
      type: "warning",
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-20">
      {/* Toast Notification */}
      {actionSuccessToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-[#141824] border-2 border-emerald-500/40 text-slate-900 dark:text-white shadow-2xl backdrop-blur-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-heading font-bold">{actionSuccessToast.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">{actionSuccessToast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TOP HEADER: Responsive Title, Breadcrumbs & Quick CTAs
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Live Warehouse Telemetry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Inventory & Low Stock Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time detection of stock at or below safety threshold. Restock directly using the quick stock tuner.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => loadAlerts(true)}
            disabled={refreshing || loading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 dark:bg-[#121622] dark:hover:bg-[#1a2030] dark:text-slate-300 border border-slate-200 dark:border-white/15 transition-all active:scale-95 shadow-sm"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-sky-500" : ""}`} />
            <span>Sync</span>
          </button>

          <Link
            to="/admin/products/new"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          KPI ALERT TILES: Compact Dimensions & Smooth Horizontal Swipe on Mobile
          ========================================================================= */}
      <div className="space-y-1.5">
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 overflow-x-auto sm:overflow-visible pb-1.5 sm:pb-0 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 snap-x snap-mandatory no-scrollbar touch-pan-x scroll-smooth">
          {/* Card 1: Total Depleted Items */}
          <div
            onClick={() => setSeverityFilter("all")}
            className={`w-[145px] xs:w-[165px] sm:w-auto flex-shrink-0 sm:flex-shrink snap-start p-2.5 xs:p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0e121b] border-2 transition-all cursor-pointer shadow-sm relative overflow-hidden group select-none ${
              severityFilter === "all"
                ? "border-amber-500 ring-2 ring-amber-500/25 dark:border-amber-500"
                : "border-slate-200 dark:border-white/10 hover:border-amber-500/40"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
              <span className="text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Total Depleted
              </span>
              <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                <Boxes className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-lg xs:text-xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white truncate leading-none sm:leading-tight">
              {loading ? "..." : metrics.totalAlerts}
            </div>
            <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-400 mt-1 font-mono truncate">
              Under threshold
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 opacity-70" />
          </div>

          {/* Card 2: Out of Stock (0 units) */}
          <div
            onClick={() => setSeverityFilter("outOfStock")}
            className={`w-[145px] xs:w-[165px] sm:w-auto flex-shrink-0 sm:flex-shrink snap-start p-2.5 xs:p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0e121b] border-2 transition-all cursor-pointer shadow-sm relative overflow-hidden group select-none ${
              severityFilter === "outOfStock"
                ? "border-rose-500 ring-2 ring-rose-500/30 dark:border-rose-500"
                : "border-slate-200 dark:border-white/10 hover:border-rose-500/40"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
              <span className="text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 truncate">
                Out of Stock
              </span>
              <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                <XCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-lg xs:text-xl sm:text-3xl font-heading font-extrabold text-rose-600 dark:text-rose-400 truncate leading-none sm:leading-tight">
              {loading ? "..." : metrics.outOfStockCount}
            </div>
            <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-400 mt-1 font-mono truncate">
              0 inventory units
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 opacity-80" />
          </div>

          {/* Card 3: Critical Low (1-3 units) */}
          <div
            onClick={() => setSeverityFilter("critical")}
            className={`w-[145px] xs:w-[165px] sm:w-auto flex-shrink-0 sm:flex-shrink snap-start p-2.5 xs:p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0e121b] border-2 transition-all cursor-pointer shadow-sm relative overflow-hidden group select-none ${
              severityFilter === "critical"
                ? "border-orange-500 ring-2 ring-orange-500/30 dark:border-orange-500"
                : "border-slate-200 dark:border-white/10 hover:border-orange-500/40"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
              <span className="text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 truncate">
                Critical (≤ 3)
              </span>
              <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-lg xs:text-xl sm:text-3xl font-heading font-extrabold text-orange-600 dark:text-orange-400 truncate leading-none sm:leading-tight">
              {loading ? "..." : metrics.criticalLowCount}
            </div>
            <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-400 mt-1 font-mono truncate">
              Urgent restock
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 opacity-80" />
          </div>

          {/* Card 4: Total Stock Deficit Units */}
          <div
            onClick={() => setSeverityFilter("warning")}
            className={`w-[145px] xs:w-[165px] sm:w-auto flex-shrink-0 sm:flex-shrink snap-start p-2.5 xs:p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0e121b] border-2 transition-all cursor-pointer shadow-sm relative overflow-hidden group select-none ${
              severityFilter === "warning"
                ? "border-sky-500 ring-2 ring-sky-500/30 dark:border-sky-500"
                : "border-slate-200 dark:border-white/10 hover:border-sky-500/40"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
              <span className="text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 truncate">
                Deficit Units
              </span>
              <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
                <TrendingDown className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-lg xs:text-xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white truncate leading-none sm:leading-tight">
              {loading ? "..." : `${metrics.totalDeficitUnits.toLocaleString()}`}
            </div>
            <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-400 mt-1 font-mono truncate">
              Needed to safety
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 opacity-80" />
          </div>
        </div>

        {/* Mobile Swipe Guidance Cue */}
        <div className="sm:hidden flex items-center justify-between px-1 pt-0.5 text-[10px] font-mono text-slate-400">
          <span className="inline-flex items-center gap-1 opacity-70">
            <span>← Swipe metrics horizontally →</span>
          </span>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full transition-all ${severityFilter === "all" ? "w-3 bg-amber-500" : "bg-slate-300 dark:bg-white/20"}`} />
            <span className={`w-1.5 h-1.5 rounded-full transition-all ${severityFilter === "outOfStock" ? "w-3 bg-rose-500" : "bg-slate-300 dark:bg-white/20"}`} />
            <span className={`w-1.5 h-1.5 rounded-full transition-all ${severityFilter === "critical" ? "w-3 bg-orange-500" : "bg-slate-300 dark:bg-white/20"}`} />
            <span className={`w-1.5 h-1.5 rounded-full transition-all ${severityFilter === "warning" ? "w-3 bg-sky-500" : "bg-slate-300 dark:bg-white/20"}`} />
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE CONTROLS: Search, Severity Pills, Category & Sort
          ========================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0d1017] border-2 border-slate-200 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, SKU or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#121622] border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category & Sort controls */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Category dropdown */}
            {uniqueCategories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#121622] border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Categories ({products.length})</option>
                {uniqueCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#121622] border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="stock_asc">Lowest Stock First</option>
              <option value="stock_desc">Highest Stock First</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Severity filter tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pt-1 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={() => setSeverityFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
              severityFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            All Alerts ({products.length})
          </button>

          <button
            onClick={() => setSeverityFilter("outOfStock")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 inline-flex items-center gap-1.5 ${
              severityFilter === "outOfStock"
                ? "bg-rose-500 text-white font-bold shadow-sm shadow-rose-500/20"
                : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Out of Stock ({metrics.outOfStockCount})
          </button>

          <button
            onClick={() => setSeverityFilter("critical")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 inline-flex items-center gap-1.5 ${
              severityFilter === "critical"
                ? "bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/20"
                : "text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Critical ≤ 3 ({metrics.criticalLowCount})
          </button>

          <button
            onClick={() => setSeverityFilter("warning")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 inline-flex items-center gap-1.5 ${
              severityFilter === "warning"
                ? "bg-amber-500 text-white font-bold shadow-sm shadow-amber-500/20"
                : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Warning ≤ Threshold ({metrics.warningCount})
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRODUCT CARD GRID: DIRECTLY REUSING AdminProductCard
          ========================================================================= */}
      {loading ? (
        /* Loading skeleton */
        <div
          className={`grid grid-cols-2 min-[540px]:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 ${
            isNavCollapsed
              ? "lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
              : "lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
          } gap-3 sm:gap-5`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-[#141824] p-3 sm:p-4 space-y-3 animate-pulse"
            >
              <div className="w-full aspect-[4/3] rounded-lg bg-slate-200 dark:bg-white/5" />
              <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/5" />
              <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-white/5" />
              <div className="h-8 rounded-lg bg-slate-200 dark:bg-white/5" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error banner */
        <div className="p-8 rounded-2xl bg-rose-500/10 border-2 border-rose-500/20 text-center max-w-lg mx-auto space-y-3">
          <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-heading font-bold text-rose-600 dark:text-rose-400">
            Telemetry Error
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={() => loadAlerts(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty / Healthy State */
        <div className="p-10 sm:p-14 rounded-3xl bg-white dark:bg-[#0e121b] border-2 border-slate-200 dark:border-white/10 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-heading font-extrabold text-slate-900 dark:text-white">
              {products.length === 0
                ? "Warehouse Inventory Fully Optimal"
                : "No Products Match Selected Filters"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {products.length === 0
                ? "All products in your catalog are currently stocked above their low stock threshold. No immediate replenishment is required."
                : "Try resetting the severity tab or clearing your search term to see other depleted inventory."}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            {products.length > 0 && (
              <button
                onClick={() => {
                  setSeverityFilter("all");
                  setCategoryFilter("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors"
              >
                Reset Filters
              </button>
            )}
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors shadow-sm"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* The Responsive Card Grid */
        <div
          className={`grid grid-cols-2 min-[540px]:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 ${
            isNavCollapsed
              ? "lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
              : "lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
          } gap-3 sm:gap-5`}
        >
          {filteredProducts.map((product) => (
            <AdminProductCard
              key={product._id}
              product={product}
              onQuickStock={(prod) => setStockModalProduct(prod)}
              onDeleteRequest={(prod) => setDeleteModalProduct(prod)}
            />
          ))}
        </div>
      )}

      {/* =========================================================================
          MODALS: Quick Stock Adjustment & Delete Confirmation
          ========================================================================= */}
      {stockModalProduct && (
        <QuickStockModal
          product={stockModalProduct}
          onClose={() => setStockModalProduct(null)}
          onSuccess={handleStockUpdateSuccess}
        />
      )}

      {deleteModalProduct && (
        <DeleteConfirmModal
          product={deleteModalProduct}
          onClose={() => setDeleteModalProduct(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
