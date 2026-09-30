import React, { useState, useMemo, useEffect } from "react";
import {
  Filter,
  X,
  RotateCcw,
  Check,
  Boxes,
  Tag,
  DollarSign,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Cpu,
  Smartphone,
  Laptop,
  Headphones,
  Gamepad2,
  Monitor,
  HardDrive,
  Star,
  Sparkles,
  SlidersHorizontal,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Watch,
  Camera,
  Tv,
  Radio
} from "lucide-react";

// Helper: map category icons
const getCategoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("laptop") || n.includes("macbook") || n.includes("computer")) return Laptop;
  if (n.includes("phone") || n.includes("mobile") || n.includes("iphone")) return Smartphone;
  if (n.includes("audio") || n.includes("headphone") || n.includes("earbud")) return Headphones;
  if (n.includes("game") || n.includes("gaming") || n.includes("console")) return Gamepad2;
  if (n.includes("monitor") || n.includes("display") || n.includes("screen")) return Monitor;
  if (n.includes("watch") || n.includes("wearable")) return Watch;
  if (n.includes("camera") || n.includes("lens")) return Camera;
  if (n.includes("tv") || n.includes("television")) return Tv;
  if (n.includes("storage") || n.includes("ssd") || n.includes("drive")) return HardDrive;
  if (n.includes("component") || n.includes("processor") || n.includes("chip")) return Cpu;
  return Layers;
};

export default function ProductFiltersSidebar({
  filters,
  setFilters,
  categories = [],
  brands = [],
  isOpenMobile,
  setIsOpenMobile,
  onReset,
  totalResults = 0,
  onCloseDesktop,
  showDesktop = true,
}) {
  // Accordion collapsed state for sections
  const [openSections, setOpenSections] = useState({
    status: true,
    categories: true,
    brands: true,
    price: true,
    specs: false,
    rating: false,
  });

  // Micro-search within categories and brands
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpenMobile]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCategoryToggle = (slug) => {
    setFilters((prev) => {
      const current = prev.category ? prev.category.split(",").filter(Boolean) : [];
      const updated = current.includes(slug)
        ? current.filter((c) => c !== slug)
        : [...current, slug];
      return { ...prev, category: updated.join(",") };
    });
  };

  const handleBrandToggle = (brandName) => {
    setFilters((prev) => {
      const current = prev.brand ? prev.brand.split(",").filter(Boolean) : [];
      const updated = current.includes(brandName)
        ? current.filter((b) => b !== brandName)
        : [...current, brandName];
      return { ...prev, brand: updated.join(",") };
    });
  };

  const activeCategories = useMemo(
    () => (filters.category ? filters.category.split(",").filter(Boolean) : []),
    [filters.category]
  );

  const activeBrands = useMemo(
    () => (filters.brand ? filters.brand.split(",").filter(Boolean) : []),
    [filters.brand]
  );

  // Filtered categories by micro-search (Deduplicated)
  const filteredCategoriesList = useMemo(() => {
    const rawList =
      categories.length > 0
        ? categories
        : [
            { name: "Laptops", slug: "laptops", count: 42 },
            { name: "Smartphones", slug: "smartphones", count: 58 },
            { name: "Audio", slug: "audio", count: 35 },
            { name: "Gaming", slug: "gaming", count: 24 },
            { name: "Monitors", slug: "monitors", count: 18 },
            { name: "Accessories", slug: "accessories", count: 29 },
          ];

    const map = new Map();
    for (const c of rawList) {
      const slug = (c.slug || c.name || "").toLowerCase().trim();
      if (!slug) continue;
      if (map.has(slug)) {
        map.get(slug).count = (map.get(slug).count || 0) + (c.count || 0);
      } else {
        map.set(slug, { ...c, slug });
      }
    }
    const list = Array.from(map.values());

    if (!categorySearch.trim()) return list;
    return list.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase().trim())
    );
  }, [categories, categorySearch]);

  // Filtered brands by micro-search (Deduplicated)
  const filteredBrandsList = useMemo(() => {
    const rawList =
      brands.length > 0
        ? brands
        : [
            { name: "Apple", count: 32 },
            { name: "Samsung", count: 28 },
            { name: "Sony", count: 19 },
            { name: "Asus", count: 16 },
            { name: "Dell", count: 14 },
            { name: "HP", count: 12 },
            { name: "Logitech", count: 15 },
          ];

    const map = new Map();
    for (const b of rawList) {
      const name = (b.name || b.slug || "").trim();
      const key = name.toLowerCase();
      if (!key) continue;
      if (map.has(key)) {
        map.get(key).count = (map.get(key).count || 0) + (b.count || 0);
      } else {
        map.set(key, { ...b, name });
      }
    }
    const list = Array.from(map.values());

    if (!brandSearch.trim()) return list;
    return list.filter((b) =>
      b.name.toLowerCase().includes(brandSearch.toLowerCase().trim())
    );
  }, [brands, brandSearch]);

  // Total active criteria count
  const activeCount = useMemo(() => {
    let count = 0;
    if (activeCategories.length) count += activeCategories.length;
    if (activeBrands.length) count += activeBrands.length;
    if (filters.stockStatus) count += 1;
    if (filters.minPrice || filters.maxPrice) count += 1;
    if (filters.rating) count += 1;
    if (filters.ram) count += 1;
    if (filters.storage) count += 1;
    if (filters.isFeatured) count += 1;
    return count;
  }, [activeCategories, activeBrands, filters]);

  // Quick price presets handler
  const setPricePreset = (min, max) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: min !== null ? String(min) : "",
      maxPrice: max !== null ? String(max) : "",
    }));
  };

  // Bulk select visible categories
  const handleSelectAllCategories = () => {
    const visibleSlugs = filteredCategoriesList.map((c) => c.slug || c.name.toLowerCase());
    setFilters((prev) => {
      const current = prev.category ? prev.category.split(",").filter(Boolean) : [];
      const merged = Array.from(new Set([...current, ...visibleSlugs]));
      return { ...prev, category: merged.join(",") };
    });
  };

  const handleClearVisibleCategories = () => {
    const visibleSlugs = filteredCategoriesList.map((c) => c.slug || c.name.toLowerCase());
    setFilters((prev) => {
      const current = prev.category ? prev.category.split(",").filter(Boolean) : [];
      const remaining = current.filter((s) => !visibleSlugs.includes(s));
      return { ...prev, category: remaining.join(",") };
    });
  };

  // Bulk select visible brands
  const handleSelectAllBrands = () => {
    const visibleNames = filteredBrandsList.map((b) => b.name);
    setFilters((prev) => {
      const current = prev.brand ? prev.brand.split(",").filter(Boolean) : [];
      const merged = Array.from(new Set([...current, ...visibleNames]));
      return { ...prev, brand: merged.join(",") };
    });
  };

  const handleClearVisibleBrands = () => {
    const visibleNames = filteredBrandsList.map((b) => b.name);
    setFilters((prev) => {
      const current = prev.brand ? prev.brand.split(",").filter(Boolean) : [];
      const remaining = current.filter((b) => !visibleNames.includes(b));
      return { ...prev, brand: remaining.join(",") };
    });
  };

  // Core Filter Body Content (Shared between Desktop Sidebar & Mobile Drawer)
  const filterContent = (
    <div className="space-y-4">
      {/* -------------------------------------------------------------
          SIDEBAR CONTROL HEADER & ACTIVE BADGE
          ------------------------------------------------------------- */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-white/[0.08] border border-sky-200/80 dark:border-white/10 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Filters Matrix
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">
              {activeCount > 0 ? (
                <span className="text-sky-600 dark:text-sky-400 font-semibold">{activeCount} criteria active</span>
              ) : (
                "Refine catalog"
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="group inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer"
              title="Clear all active criteria"
            >
              <RotateCcw className="w-3 h-3 group-hover:-rotate-45 transition-transform duration-200" />
              <span>Reset</span>
            </button>
          )}

          {onCloseDesktop && (
            <button
              type="button"
              onClick={onCloseDesktop}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Hide filter sidebar"
              aria-label="Hide filter sidebar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          ACTIVE FILTER CHIPS TRAY (Quick removal from within sidebar)
          ------------------------------------------------------------- */}
      {activeCount > 0 && (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400">
            <span>ACTIVE PARAMETERS</span>
            <span className="text-sky-600 dark:text-sky-400 font-medium">Tap × to drop</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.stockStatus && (
              <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 dark:bg-white/[0.06] border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200">
                <span className="capitalize">{filters.stockStatus}</span>
                <button
                  onClick={() => setFilters((p) => ({ ...p, stockStatus: "" }))}
                  className="p-0.5 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {activeCategories.map((slug) => (
              <span
                key={slug}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[10px] font-mono font-medium bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300"
              >
                <span>{slug}</span>
                <button
                  onClick={() => handleCategoryToggle(slug)}
                  className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {activeBrands.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[10px] font-mono font-medium bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300"
              >
                <span>{b}</span>
                <button
                  onClick={() => handleBrandToggle(b)}
                  className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[10px] font-mono font-medium bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300">
                <span>
                  ₹{filters.minPrice || 0}–₹{filters.maxPrice || "∞"}
                </span>
                <button
                  onClick={() => setFilters((p) => ({ ...p, minPrice: "", maxPrice: "" }))}
                  className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filters.rating && (
              <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[10px] font-mono font-medium bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-300">
                <span>{filters.rating}★+</span>
                <button
                  onClick={() => setFilters((p) => ({ ...p, rating: "" }))}
                  className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filters.ram && (
              <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                <span>RAM: {filters.ram}</span>
                <button
                  onClick={() => setFilters((p) => ({ ...p, ram: "" }))}
                  className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filters.storage && (
              <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[10px] font-mono font-medium bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300">
                <span>SSD: {filters.storage}</span>
                <button
                  onClick={() => setFilters((p) => ({ ...p, storage: "" }))}
                  className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          1. INVENTORY AVAILABILITY & STATUS
          ========================================================================= */}
      <div className="border-b border-slate-200/80 dark:border-white/5 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection("status")}
          className="w-full flex items-center justify-between py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Boxes className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
            <span className="tracking-wide">INVENTORY STATUS</span>
            {filters.stockStatus && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
            )}
          </div>
          {openSections.status ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          )}
        </button>

        {openSections.status && (
          <div className="grid grid-cols-2 gap-1.5 pt-2.5">
            {[
              { label: "All Items", key: "all", dot: "bg-slate-700 dark:bg-white", desc: "Catalog" },
              { label: "In Stock", key: "inStock", dot: "bg-emerald-500 dark:bg-emerald-400", desc: "Ready to ship" },
              { label: "Low Stock (≤5)", key: "lowStock", dot: "bg-amber-500 dark:bg-amber-400", desc: "Reorder alert" },
              { label: "Out of Stock", key: "outOfStock", dot: "bg-rose-500 dark:bg-rose-400", desc: "0 inventory" },
            ].map((status) => {
              const isSelected =
                (status.key === "all" && !filters.stockStatus) ||
                filters.stockStatus === status.key;
              return (
                <button
                  key={status.key}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      stockStatus: status.key === "all" ? "" : status.key,
                    }))
                  }
                  className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white font-bold border-slate-900 shadow-md shadow-slate-900/10 dark:bg-white dark:text-black dark:border-white dark:shadow-white/10"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200 hover:border-slate-300 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:text-white dark:border-white/5 dark:hover:bg-white/[0.07] dark:hover:border-white/10 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isSelected ? "bg-white dark:bg-black" : status.dot
                      }`}
                    />
                    <span className="text-[11px] font-mono font-semibold truncate">{status.label}</span>
                  </div>
                  <div
                    className={`text-[9px] font-mono font-medium truncate ${
                      isSelected ? "text-slate-300 dark:text-slate-700" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {status.desc}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          2. CATEGORIES ACCORDION WITH LIVE SEARCH & BULK SELECT
          ========================================================================= */}
      <div className="border-b border-slate-200/80 dark:border-white/5 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
            <span className="tracking-wide">CATEGORIES</span>
            {activeCategories.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-sky-500 text-white dark:text-black text-[10px] font-bold font-mono">
                {activeCategories.length}
              </span>
            )}
          </div>
          {openSections.categories ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          )}
        </button>

        {openSections.categories && (
          <div className="space-y-2 pt-2.5">
            {/* Micro search bar */}
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-[11px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500/50 transition-colors font-sans"
              />
              {categorySearch && (
                <button
                  type="button"
                  onClick={() => setCategorySearch("")}
                  className="p-1 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Quick bulk action row if searching */}
            {categorySearch && filteredCategoriesList.length > 0 && (
              <div className="flex items-center justify-between text-[10px] font-mono px-1">
                <button
                  type="button"
                  onClick={handleSelectAllCategories}
                  className="text-sky-600 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
                >
                  Select all visible
                </button>
                <button
                  type="button"
                  onClick={handleClearVisibleCategories}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium cursor-pointer"
                >
                  Clear visible
                </button>
              </div>
            )}

            {/* Category list */}
            <div className="space-y-1 max-h-48 overflow-y-auto overscroll-contain pr-1 custom-scrollbar">
              {filteredCategoriesList.length === 0 ? (
                <div className="text-center py-4 px-2 bg-slate-50 dark:bg-white/[0.02] rounded-lg border border-slate-200/80 dark:border-white/5">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">No categories found</p>
                  <button
                    onClick={() => setCategorySearch("")}
                    className="text-[10px] font-mono text-sky-600 dark:text-sky-400 mt-1 hover:underline font-semibold cursor-pointer"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                filteredCategoriesList.map((cat) => {
                  const slug = cat.slug || cat.name?.toLowerCase();
                  const isChecked = activeCategories.includes(slug);
                  const IconComponent = getCategoryIcon(cat.name);

                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => handleCategoryToggle(slug)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all border cursor-pointer ${
                        isChecked
                          ? "bg-sky-50 dark:bg-sky-500/10 text-sky-950 dark:text-white border-sky-300 dark:border-sky-500/30 font-semibold shadow-2xs"
                          : "bg-transparent text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] border-transparent font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Custom Cyber Checkbox */}
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                            isChecked
                              ? "bg-sky-500 border-sky-500 text-white dark:text-black shadow-xs"
                              : "border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.02]"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <IconComponent
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isChecked ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>

                      {cat.count !== undefined && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-500 border border-slate-200/80 dark:border-transparent shrink-0">
                          {cat.count}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          3. BRANDS ECOSYSTEM WITH LIVE SEARCH & BULK SELECT
          ========================================================================= */}
      <div className="border-b border-slate-200/80 dark:border-white/5 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection("brands")}
          className="w-full flex items-center justify-between py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            <span className="tracking-wide">BRANDS ECOSYSTEM</span>
            {activeBrands.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500 text-white text-[10px] font-bold font-mono">
                {activeBrands.length}
              </span>
            )}
          </div>
          {openSections.brands ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          )}
        </button>

        {openSections.brands && (
          <div className="space-y-2 pt-2.5">
            {/* Micro search bar */}
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-[11px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500/50 transition-colors font-sans"
              />
              {brandSearch && (
                <button
                  type="button"
                  onClick={() => setBrandSearch("")}
                  className="p-1 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Quick bulk action row if searching */}
            {brandSearch && filteredBrandsList.length > 0 && (
              <div className="flex items-center justify-between text-[10px] font-mono px-1">
                <button
                  type="button"
                  onClick={handleSelectAllBrands}
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
                >
                  Select all visible
                </button>
                <button
                  type="button"
                  onClick={handleClearVisibleBrands}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium cursor-pointer"
                >
                  Clear visible
                </button>
              </div>
            )}

            {/* Brands list */}
            <div className="space-y-1 max-h-44 overflow-y-auto overscroll-contain pr-1 custom-scrollbar">
              {filteredBrandsList.length === 0 ? (
                <div className="text-center py-4 px-2 bg-slate-50 dark:bg-white/[0.02] rounded-lg border border-slate-200/80 dark:border-white/5">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">No brands found</p>
                  <button
                    onClick={() => setBrandSearch("")}
                    className="text-[10px] font-mono text-purple-600 dark:text-purple-400 mt-1 hover:underline font-semibold cursor-pointer"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                filteredBrandsList.map((brand) => {
                  const bName = brand.name;
                  const isChecked = activeBrands.includes(bName);

                  return (
                    <button
                      key={bName}
                      type="button"
                      onClick={() => handleBrandToggle(bName)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all border cursor-pointer ${
                        isChecked
                          ? "bg-purple-50 dark:bg-purple-500/10 text-purple-950 dark:text-white border-purple-300 dark:border-purple-500/30 font-semibold shadow-2xs"
                          : "bg-transparent text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] border-transparent font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                            isChecked
                              ? "bg-purple-500 border-purple-500 text-white dark:text-black shadow-xs"
                              : "border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.02]"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{bName}</span>
                      </div>

                      {brand.count !== undefined && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-500 border border-slate-200/80 dark:border-transparent shrink-0">
                          {brand.count}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. PRICE MATRIX & QUICK PRESETS (₹)
          ========================================================================= */}
      <div className="border-b border-slate-200/80 dark:border-white/5 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors" />
            <span className="tracking-wide">PRICE MATRIX (₹)</span>
            {(filters.minPrice || filters.maxPrice) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            )}
          </div>
          {openSections.price ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          )}
        </button>

        {openSections.price && (
          <div className="space-y-3 pt-2.5">
            {/* Quick Presets Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "< ₹25,000", min: 0, max: 25000, sub: "Budget" },
                { label: "₹25k - ₹60k", min: 25000, max: 60000, sub: "Mainstream" },
                { label: "₹60k - ₹1.2L", min: 60000, max: 120000, sub: "Performance" },
                { label: "> ₹1,20,000", min: 120000, max: null, sub: "Flagship" },
              ].map((preset, idx) => {
                const isSelected =
                  filters.minPrice === String(preset.min) &&
                  (preset.max ? filters.maxPrice === String(preset.max) : !filters.maxPrice);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      isSelected
                        ? setPricePreset(null, null)
                        : setPricePreset(preset.min, preset.max)
                    }
                    className={`p-2 rounded-xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-white dark:bg-amber-400 dark:text-black font-bold border-amber-500 dark:border-amber-400 shadow-md shadow-amber-500/20"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200 hover:border-slate-300 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:text-white dark:border-white/5 dark:hover:bg-white/[0.06] shadow-2xs"
                    }`}
                  >
                    <div className="text-[11px] font-mono font-semibold">{preset.label}</div>
                    <div
                      className={`text-[9px] font-mono font-medium ${
                        isSelected ? "text-amber-100 dark:text-black/75" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {preset.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Inputs */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>CUSTOM RANGE</span>
                {(filters.minPrice || filters.maxPrice) && (
                  <button
                    onClick={() => setPricePreset(null, null)}
                    className="text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-mono font-bold absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                    }
                    className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400/50 transition-colors"
                  />
                </div>

                <span className="text-slate-500 dark:text-slate-400 text-xs font-mono font-medium">to</span>

                <div className="relative flex-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-mono font-bold absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                    }
                    className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          5. HARDWARE SPECIFICATIONS (RAM & STORAGE) - Critical for Electronics
          ========================================================================= */}
      <div className="border-b border-slate-200/80 dark:border-white/5 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection("specs")}
          className="w-full flex items-center justify-between py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
            <span className="tracking-wide">HARDWARE SPECS</span>
            {(filters.ram || filters.storage) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            )}
          </div>
          {openSections.specs ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          )}
        </button>

        {openSections.specs && (
          <div className="space-y-3 pt-2.5">
            {/* RAM Chips */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>SYSTEM MEMORY (RAM)</span>
                {filters.ram && (
                  <button
                    onClick={() => setFilters((p) => ({ ...p, ram: "" }))}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {["8GB", "16GB", "32GB", "64GB"].map((ramVal) => {
                  const isSel = filters.ram === ramVal;
                  return (
                    <button
                      key={ramVal}
                      type="button"
                      onClick={() =>
                        setFilters((p) => ({ ...p, ram: isSel ? "" : ramVal }))
                      }
                      className={`py-1.5 rounded-lg text-[10px] font-mono text-center transition-all border cursor-pointer ${
                        isSel
                          ? "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black font-bold border-emerald-500 dark:border-emerald-400 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200 hover:border-slate-300 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:text-white dark:border-white/5 dark:hover:bg-white/[0.07] font-semibold shadow-2xs"
                      }`}
                    >
                      {ramVal}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Storage Chips */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>STORAGE CAPACITY (SSD)</span>
                {filters.storage && (
                  <button
                    onClick={() => setFilters((p) => ({ ...p, storage: "" }))}
                    className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {["256GB", "512GB", "1TB", "2TB"].map((storageVal) => {
                  const isSel = filters.storage === storageVal;
                  return (
                    <button
                      key={storageVal}
                      type="button"
                      onClick={() =>
                        setFilters((p) => ({
                          ...p,
                          storage: isSel ? "" : storageVal,
                        }))
                      }
                      className={`py-1.5 rounded-lg text-[10px] font-mono text-center transition-all border cursor-pointer ${
                        isSel
                          ? "bg-cyan-600 text-white dark:bg-cyan-400 dark:text-black font-bold border-cyan-600 dark:border-cyan-400 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200 hover:border-slate-300 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:text-white dark:border-white/5 dark:hover:bg-white/[0.07] font-semibold shadow-2xs"
                      }`}
                    >
                      {storageVal}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          6. CUSTOMER REVIEWS & RATINGS TIER
          ========================================================================= */}
      <div className="pb-1">
        <button
          type="button"
          onClick={() => toggleSection("rating")}
          className="w-full flex items-center justify-between py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors" />
            <span className="tracking-wide">MINIMUM RATING</span>
            {filters.rating && (
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 dark:bg-yellow-400" />
            )}
          </div>
          {openSections.rating ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          )}
        </button>

        {openSections.rating && (
          <div className="space-y-1.5 pt-2.5">
            {[
              { val: "4", label: "4.0 & above", stars: 4, desc: "Top Rated" },
              { val: "3", label: "3.0 & above", stars: 3, desc: "Community Fav" },
              { val: "2", label: "2.0 & above", stars: 2, desc: "All Rated" },
            ].map((r) => {
              const isSel = filters.rating === r.val;
              return (
                <button
                  key={r.val}
                  type="button"
                  onClick={() =>
                    setFilters((p) => ({ ...p, rating: isSel ? "" : r.val }))
                  }
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all border cursor-pointer ${
                    isSel
                      ? "bg-yellow-50 dark:bg-yellow-400/10 text-yellow-950 dark:text-white border-yellow-300 dark:border-yellow-400/30 font-semibold shadow-2xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200 hover:border-slate-300 dark:bg-white/[0.02] dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.05] dark:border-white/5 font-medium shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500 dark:text-yellow-400">
                      {[...Array(r.stars)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-500 dark:fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">{r.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">{r.desc}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* -------------------------------------------------------------
          DESKTOP SIDEBAR (Independent Scrollable Titanium Glass Panel)
          ------------------------------------------------------------- */}
      {showDesktop && (
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 h-full min-h-0 overflow-hidden animate-in fade-in duration-200">
          <div className="glass-card bg-white/95 dark:bg-[#0c0d12]/90 p-4 sm:p-4.5 flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-2xl">
            {filterContent}
          </div>
        </aside>
      )}

      {/* -------------------------------------------------------------
          MOBILE & TABLET SLIDE-OVER DRAWER (Ultra-Smooth Touch Layer)
          ------------------------------------------------------------- */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start sm:justify-end animate-in fade-in duration-200">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsOpenMobile(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-[#08090a] border-r sm:border-r-0 sm:border-l border-slate-200 dark:border-white/10 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left sm:slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/95 dark:bg-[#0e0f13]/90 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    Filter Matrix
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {totalResults} items matching current view
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenMobile(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body (Touch Friendly Scroll) */}
            <div className="flex-1 overflow-y-auto p-4.5 custom-scrollbar space-y-4">
              {filterContent}
            </div>

            {/* Sticky Drawer Footer Dock */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/95 dark:bg-[#0c0d11] flex items-center gap-2.5 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setIsOpenMobile(false);
                }}
                disabled={activeCount === 0}
                className="flex-1 py-3 px-3 rounded-xl text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsOpenMobile(false)}
                className="flex-[2] py-3 px-4 rounded-xl text-xs font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 dark:text-black dark:bg-white dark:hover:bg-slate-200 shadow-md shadow-slate-900/10 dark:shadow-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply & View</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/20 dark:bg-black/15 text-white dark:text-black text-[10px] font-mono">
                  {totalResults}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
