import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Layers,
  Tag,
  Plus,
  Search,
  X,
  RotateCcw,
  Loader2,
  FolderTree,
  SlidersHorizontal,
  CheckCircle2
} from "lucide-react";
import {
  fetchAdminCategories,
  fetchAdminBrands,
} from "../../api/adminApi";
import CategoryCard from "../../components/admin/taxonomy/CategoryCard";
import BrandCard from "../../components/admin/taxonomy/BrandCard";
import CategoryFormModal from "../../components/admin/taxonomy/CategoryFormModal";
import BrandFormModal from "../../components/admin/taxonomy/BrandFormModal";
import TaxonomyDeleteModal from "../../components/admin/taxonomy/TaxonomyDeleteModal";

export default function AdminTaxonomy() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") === "brands" ? "brands" : "categories";

  // Search input state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Categories state & pagination
  const [categories, setCategories] = useState([]);
  const [catPage, setCatPage] = useState(1);
  const [catTotal, setCatTotal] = useState(0);
  const [catHasNext, setCatHasNext] = useState(true);
  const [catLoadingInitial, setCatLoadingInitial] = useState(true);
  const [catLoadingMore, setCatLoadingMore] = useState(false);

  // Brands state & pagination
  const [brands, setBrands] = useState([]);
  const [brandPage, setBrandPage] = useState(1);
  const [brandTotal, setBrandTotal] = useState(0);
  const [brandHasNext, setBrandHasNext] = useState(true);
  const [brandLoadingInitial, setBrandLoadingInitial] = useState(true);
  const [brandLoadingMore, setBrandLoadingMore] = useState(false);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    type: "category",
  });

  // Success toast feedback
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Tab switcher
  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setSearchTerm("");
  };

  // Load Categories (page 1 or append)
  const loadCategories = useCallback(
    async (targetPage = 1, isAppending = false) => {
      try {
        if (isAppending) {
          setCatLoadingMore(true);
        } else {
          setCatLoadingInitial(true);
        }

        const data = await fetchAdminCategories({
          page: targetPage,
          limit: 12,
          search: debouncedSearch,
        });

        // Normalize response (data can be { categories, pagination } or flat array)
        const items = data.categories || (Array.isArray(data) ? data : []);
        const pagination = data.pagination || {};

        if (isAppending) {
          setCategories((prev) => [...prev, ...items]);
        } else {
          setCategories(items);
        }

        setCatPage(pagination.page || targetPage);
        setCatTotal(pagination.total ?? items.length);
        setCatHasNext(
          pagination.hasNextPage ?? (targetPage < (pagination.totalPages || 1))
        );
      } catch (err) {
        console.error("Load categories failed:", err);
      } finally {
        setCatLoadingInitial(false);
        setCatLoadingMore(false);
      }
    },
    [debouncedSearch]
  );

  // Load Brands (page 1 or append)
  const loadBrands = useCallback(
    async (targetPage = 1, isAppending = false) => {
      try {
        if (isAppending) {
          setBrandLoadingMore(true);
        } else {
          setBrandLoadingInitial(true);
        }

        const data = await fetchAdminBrands({
          page: targetPage,
          limit: 12,
          search: debouncedSearch,
        });

        const items = data.brands || (Array.isArray(data) ? data : []);
        const pagination = data.pagination || {};

        if (isAppending) {
          setBrands((prev) => [...prev, ...items]);
        } else {
          setBrands(items);
        }

        setBrandPage(pagination.page || targetPage);
        setBrandTotal(pagination.total ?? items.length);
        setBrandHasNext(
          pagination.hasNextPage ?? (targetPage < (pagination.totalPages || 1))
        );
      } catch (err) {
        console.error("Load brands failed:", err);
      } finally {
        setBrandLoadingInitial(false);
        setBrandLoadingMore(false);
      }
    },
    [debouncedSearch]
  );

  // Pre-load counts for both tabs on mount so badges reflect real database totals immediately
  useEffect(() => {
    fetchAdminCategories({ page: 1, limit: 1 })
      .then((res) => {
        if (res?.pagination?.total !== undefined) {
          setCatTotal(res.pagination.total);
        } else if (Array.isArray(res)) {
          setCatTotal(res.length);
        }
      })
      .catch(() => {});

    fetchAdminBrands({ page: 1, limit: 1 })
      .then((res) => {
        if (res?.pagination?.total !== undefined) {
          setBrandTotal(res.pagination.total);
        } else if (Array.isArray(res)) {
          setBrandTotal(res.length);
        }
      })
      .catch(() => {});
  }, []);

  // Trigger query on search or tab change
  useEffect(() => {
    if (currentTab === "categories") {
      setCatPage(1);
      loadCategories(1, false);
    } else {
      setBrandPage(1);
      loadBrands(1, false);
    }
  }, [currentTab, debouncedSearch, loadCategories, loadBrands]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;

        if (currentTab === "categories") {
          if (catHasNext && !catLoadingInitial && !catLoadingMore) {
            loadCategories(catPage + 1, true);
          }
        } else {
          if (brandHasNext && !brandLoadingInitial && !brandLoadingMore) {
            loadBrands(brandPage + 1, true);
          }
        }
      },
      { threshold: 0.1, rootMargin: "250px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [
    currentTab,
    catHasNext,
    catLoadingInitial,
    catLoadingMore,
    catPage,
    loadCategories,
    brandHasNext,
    brandLoadingInitial,
    brandLoadingMore,
    brandPage,
    loadBrands,
  ]);

  // Handle Category Saved Callback
  const handleCategorySaved = (savedCategory) => {
    showToast(editingCategory ? "Category updated successfully!" : "Category published successfully!");
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c._id === savedCategory._id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = savedCategory;
        return next;
      }
      return [savedCategory, ...prev];
    });
    setCatTotal((p) => (editingCategory ? p : p + 1));
  };

  // Handle Brand Saved Callback
  const handleBrandSaved = (savedBrand) => {
    showToast(editingBrand ? "Brand partner updated successfully!" : "Brand partner registered successfully!");
    setBrands((prev) => {
      const idx = prev.findIndex((b) => b._id === savedBrand._id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = savedBrand;
        return next;
      }
      return [savedBrand, ...prev];
    });
    setBrandTotal((p) => (editingBrand ? p : p + 1));
  };

  // Handle Deleted Callback
  const handleItemDeleted = (deletedId, type) => {
    if (type === "category") {
      setCategories((prev) => prev.filter((c) => c._id !== deletedId));
      setCatTotal((p) => Math.max(0, p - 1));
      showToast("Category permanently deleted");
    } else {
      setBrands((prev) => prev.filter((b) => b._id !== deletedId));
      setBrandTotal((p) => Math.max(0, p - 1));
      showToast("Brand permanently deleted");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/90 text-black font-semibold text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              Catalog Taxonomy
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-200 border border-white/15">
              {currentTab === "categories"
                ? `${catTotal.toLocaleString()} Categories`
                : `${brandTotal.toLocaleString()} Brands`}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Register and manage official electronics departments, specifications, and brand partners.
          </p>
        </div>

        {/* Primary Create CTA */}
        <div>
          {currentTab === "categories" ? (
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-all shadow-md shadow-white/10"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingBrand(null);
                setIsBrandModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-all shadow-md shadow-white/10"
            >
              <Plus className="w-4 h-4" />
              <span>Add Brand</span>
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar: Tabs & Search Filter */}
      <div className="glass-card p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Tab Switcher Pills */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleTabChange("categories")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              currentTab === "categories"
                ? "bg-white text-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] ${
                currentTab === "categories"
                  ? "bg-black/15 text-black"
                  : "bg-white/[0.06] text-slate-400"
              }`}
            >
              {catTotal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("brands")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              currentTab === "brands"
                ? "bg-white text-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Brands</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] ${
                currentTab === "brands"
                  ? "bg-black/15 text-black"
                  : "bg-white/[0.06] text-slate-400"
              }`}
            >
              {brandTotal}
            </span>
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              currentTab === "categories"
                ? "Search categories by name, slug, description..."
                : "Search brand ecosystem by name, slug..."
            }
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
      </div>

      {/* Main Grid View */}
      {currentTab === "categories" ? (
        <>
          {/* Categories Grid */}
          {catLoadingInitial ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] h-64 animate-pulse p-4 space-y-3"
                >
                  <div className="w-full h-28 rounded-xl bg-white/5" />
                  <div className="w-2/3 h-4 rounded bg-white/10" />
                  <div className="w-full h-3 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="glass-card p-12 text-center max-w-md mx-auto my-8 space-y-3">
              <FolderTree className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="font-heading font-bold text-base text-white">No Categories Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {debouncedSearch
                  ? `No categories matched your query "${debouncedSearch}".`
                  : "Your catalog currently has no registered electronics categories."}
              </p>
              {debouncedSearch ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Search</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }}
                  className="btn-pill-primary text-xs mt-2"
                >
                  Register First Category
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat._id}
                  category={cat}
                  onEdit={(categoryToEdit) => {
                    setEditingCategory(categoryToEdit);
                    setIsCategoryModalOpen(true);
                  }}
                  onDelete={(categoryToDelete) => {
                    setDeleteModal({
                      isOpen: true,
                      item: categoryToDelete,
                      type: "category",
                    });
                  }}
                />
              ))}
            </div>
          )}

          {/* Infinite Scroll Sentinel & Loader */}
          <div ref={sentinelRef} className="py-6 flex justify-center">
            {catLoadingMore && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 shadow-xl">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Loading more categories...</span>
              </div>
            )}
            {!catHasNext && categories.length > 0 && !catLoadingInitial && (
              <p className="text-[11px] font-mono text-slate-600">
                End of registered categories catalog ({categories.length} loaded)
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Brands Grid */}
          {brandLoadingInitial ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] h-64 animate-pulse p-4 space-y-3"
                >
                  <div className="w-full h-28 rounded-xl bg-white/5" />
                  <div className="w-2/3 h-4 rounded bg-white/10" />
                  <div className="w-full h-3 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : brands.length === 0 ? (
            <div className="glass-card p-12 text-center max-w-md mx-auto my-8 space-y-3">
              <Tag className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="font-heading font-bold text-base text-white">No Brands Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {debouncedSearch
                  ? `No brand partners matched your query "${debouncedSearch}".`
                  : "Your catalog currently has no registered electronics brands."}
              </p>
              {debouncedSearch ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/20"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Search</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBrand(null);
                    setIsBrandModalOpen(true);
                  }}
                  className="btn-pill-primary text-xs mt-2"
                >
                  Register First Brand
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {brands.map((b) => (
                <BrandCard
                  key={b._id}
                  brand={b}
                  onEdit={(brandToEdit) => {
                    setEditingBrand(brandToEdit);
                    setIsBrandModalOpen(true);
                  }}
                  onDelete={(brandToDelete) => {
                    setDeleteModal({
                      isOpen: true,
                      item: brandToDelete,
                      type: "brand",
                    });
                  }}
                />
              ))}
            </div>
          )}

          {/* Infinite Scroll Sentinel & Loader */}
          <div ref={sentinelRef} className="py-6 flex justify-center">
            {brandLoadingMore && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 shadow-xl">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Loading more brands...</span>
              </div>
            )}
            {!brandHasNext && brands.length > 0 && !brandLoadingInitial && (
              <p className="text-[11px] font-mono text-slate-600">
                End of registered brand partners catalog ({brands.length} loaded)
              </p>
            )}
          </div>
        </>
      )}

      {/* Category Modal (Create / Edit) */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={editingCategory}
        parentCategories={categories}
        onSaved={handleCategorySaved}
      />

      {/* Brand Modal (Create / Edit) */}
      <BrandFormModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        brand={editingBrand}
        onSaved={handleBrandSaved}
      />

      {/* Safe Deletion Modal */}
      <TaxonomyDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, type: "category" })}
        item={deleteModal.item}
        type={deleteModal.type}
        onDeleted={handleItemDeleted}
      />
    </div>
  );
}
