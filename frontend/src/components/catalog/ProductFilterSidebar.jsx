import React, { useState, useMemo } from "react";
import {
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Star,
  SlidersHorizontal,
  X,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

/**
 * Production-Grade Dynamic Filter Sidebar:
 * - Automatically deduplicates category and brand facets (aggregating counts).
 * - Interactive Price Range slider + quick preset chips.
 * - Hardware specifications filters (RAM, Storage, Silicon).
 * - Customer Rating filter with star indicators.
 * - Live "In Stock Only" toggle.
 */
export default function ProductFilterSidebar({
  filters,
  metadata,
  isLoadingMetadata,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  className = "",
  isMobileModal = false,
  onCloseMobile,
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    price: true,
    specs: true,
    rating: true,
    availability: true,
  });

  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || "");

  // Synchronize local price input when external filters change
  React.useEffect(() => {
    setLocalMinPrice(filters.minPrice || "");
    setLocalMaxPrice(filters.maxPrice || "");
  }, [filters.minPrice, filters.maxPrice]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // =========================================================================
  // DEDUPLICATION: Merge duplicate categories and brands by slug/name
  // =========================================================================
  const uniqueCategories = useMemo(() => {
    const rawList = metadata?.categories || [];
    const map = new Map();

    for (const cat of rawList) {
      const key = (cat.slug || cat.name || "").toLowerCase().trim();
      if (!key) continue;

      if (map.has(key)) {
        const existing = map.get(key);
        existing.count = (existing.count || 0) + (cat.count || 0);
      } else {
        map.set(key, {
          _id: cat._id,
          name: cat.name || key,
          slug: cat.slug || key,
          count: cat.count || 0,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [metadata?.categories]);

  const uniqueBrands = useMemo(() => {
    const rawList = metadata?.brands || [];
    const map = new Map();

    for (const brand of rawList) {
      const key = (brand.slug || brand.name || "").toLowerCase().trim();
      if (!key) continue;

      if (map.has(key)) {
        const existing = map.get(key);
        existing.count = (existing.count || 0) + (brand.count || 0);
      } else {
        map.set(key, {
          _id: brand._id,
          name: brand.name || key,
          slug: brand.slug || key,
          logo: brand.logo,
          count: brand.count || 0,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [metadata?.brands]);

  // Helper for multi-select array toggles
  const handleToggleArrayItem = (key, itemValue) => {
    const currentValues = filters[key]
      ? filters[key].split(",").map((v) => v.trim()).filter(Boolean)
      : [];

    let updated;
    const itemStr = String(itemValue).trim();
    if (currentValues.includes(itemStr)) {
      updated = currentValues.filter((v) => v !== itemStr);
    } else {
      updated = [...currentValues, itemStr];
    }

    onFilterChange({
      [key]: updated.length > 0 ? updated.join(",") : undefined,
    });
  };

  const isItemSelected = (key, itemValue) => {
    if (!filters[key]) return false;
    const currentValues = filters[key]
      .split(",")
      .map((v) => v.trim().toLowerCase());
    return currentValues.includes(String(itemValue).trim().toLowerCase());
  };

  const handlePriceApply = (e) => {
    e?.preventDefault();
    onFilterChange({
      minPrice: localMinPrice ? Number(localMinPrice) : undefined,
      maxPrice: localMaxPrice ? Number(localMaxPrice) : undefined,
    });
  };

  const handlePricePreset = (min, max) => {
    setLocalMinPrice(min !== undefined ? String(min) : "");
    setLocalMaxPrice(max !== undefined ? String(max) : "");
    onFilterChange({
      minPrice: min,
      maxPrice: max,
    });
  };

  // Filtered brands by search input
  const filteredBrands = uniqueBrands.filter((b) =>
    (b.name || "").toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

  return (
    <aside
      className={`flex flex-col bg-white dark:bg-[#0b0e17] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-sm text-slate-800 dark:text-slate-200 text-xs ${className}`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Filter Catalog
            </h3>
            <span className="text-[10px] text-slate-400 font-tech">
              Hardware Specifications
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span>Reset</span>
            </button>
          )}

          {isMobileModal && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Filter Options */}
      <div className="p-4 space-y-5 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.06] max-h-[calc(100vh-10rem)] custom-scrollbar">
        {/* =========================================================================
            1. AVAILABILITY TOGGLE (IN STOCK ONLY)
            ========================================================================= */}
        <div className="pt-1">
          <label className="flex items-center justify-between cursor-pointer group select-none">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="font-heading font-bold text-xs text-slate-900 dark:text-white block">
                  In Stock Only
                </span>
                <span className="text-[10px] text-slate-400">
                  Ready for immediate shipping
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={filters.inStock === "true" || filters.inStock === true}
              onChange={(e) =>
                onFilterChange({
                  inStock: e.target.checked ? "true" : undefined,
                })
              }
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500 relative cursor-pointer" />
          </label>
        </div>

        {/* =========================================================================
            2. CATEGORIES (DEDUPLICATED)
            ========================================================================= */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => toggleSection("categories")}
            className="w-full flex items-center justify-between text-left group"
          >
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-sky-400 transition-colors">
              Departments ({uniqueCategories.length})
            </span>
            {openSections.categories ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>

          {openSections.categories && (
            <div className="mt-2.5 space-y-1">
              {uniqueCategories.map((cat) => {
                const isSelected = isItemSelected("category", cat.slug);
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => handleToggleArrayItem("category", cat.slug)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30"
                        : "hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-sky-500 border-sky-500 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate text-xs">{cat.name}</span>
                    </div>
                    {cat.count !== undefined && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md">
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* =========================================================================
            3. OEM BRANDS (DEDUPLICATED)
            ========================================================================= */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => toggleSection("brands")}
            className="w-full flex items-center justify-between text-left group"
          >
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-sky-400 transition-colors">
              OEM Brands ({uniqueBrands.length})
            </span>
            {openSections.brands ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>

          {openSections.brands && (
            <div className="mt-2.5 space-y-2">
              {uniqueBrands.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search brand..."
                    value={brandSearchQuery}
                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                    className="w-full h-7 pl-8 pr-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {filteredBrands.map((b) => {
                  const isSelected = isItemSelected("brand", b.slug);
                  return (
                    <button
                      key={b.slug}
                      type="button"
                      onClick={() => handleToggleArrayItem("brand", b.slug)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all ${
                        isSelected
                          ? "bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30"
                          : "hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-sky-500 border-sky-500 text-white"
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate text-xs">{b.name}</span>
                      </div>
                      {b.count !== undefined && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md">
                          {b.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            4. PRICE RANGE (INR)
            ========================================================================= */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between text-left group"
          >
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-sky-400 transition-colors">
              Price Range
            </span>
            {openSections.price ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>

          {openSections.price && (
            <div className="mt-2.5 space-y-2.5">
              {/* Presets */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePricePreset(undefined, 25000)}
                  className="px-2 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-white/10 hover:border-sky-500 text-slate-600 dark:text-slate-300 hover:text-sky-400 transition-colors text-center"
                >
                  Under ₹25k
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset(25000, 50000)}
                  className="px-2 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-white/10 hover:border-sky-500 text-slate-600 dark:text-slate-300 hover:text-sky-400 transition-colors text-center"
                >
                  ₹25k - ₹50k
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset(50000, 100000)}
                  className="px-2 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-white/10 hover:border-sky-500 text-slate-600 dark:text-slate-300 hover:text-sky-400 transition-colors text-center"
                >
                  ₹50k - ₹1L
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset(100000, undefined)}
                  className="px-2 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-white/10 hover:border-sky-500 text-slate-600 dark:text-slate-300 hover:text-sky-400 transition-colors text-center"
                >
                  Above ₹1L
                </button>
              </div>

              {/* Min - Max Inputs */}
              <form onSubmit={handlePriceApply} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={localMinPrice}
                      onChange={(e) => setLocalMinPrice(e.target.value)}
                      className="w-full h-8 pl-6 pr-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <span className="text-slate-500 font-bold">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={localMaxPrice}
                      onChange={(e) => setLocalMaxPrice(e.target.value)}
                      className="w-full h-8 pl-6 pr-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold text-[11px] hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  Apply Price
                </button>
              </form>
            </div>
          )}
        </div>

        {/* =========================================================================
            5. HARDWARE SPECIFICATIONS (RAM, STORAGE, PROCESSOR)
            ========================================================================= */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => toggleSection("specs")}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-sky-400" />
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-sky-400 transition-colors">
                Hardware Specs
              </span>
            </div>
            {openSections.specs ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>

          {openSections.specs && (
            <div className="mt-2.5 space-y-3">
              {/* RAM Chips */}
              {metadata?.availableSpecs?.ram && metadata.availableSpecs.ram.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    RAM Memory
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {metadata.availableSpecs.ram.slice(0, 5).map((ramItem) => {
                      const isSelected = filters.ram === ramItem;
                      return (
                        <button
                          key={ramItem}
                          type="button"
                          onClick={() =>
                            onFilterChange({
                              ram: isSelected ? undefined : ramItem,
                            })
                          }
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-all ${
                            isSelected
                              ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                              : "bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                          }`}
                        >
                          {ramItem}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Storage Chips */}
              {metadata?.availableSpecs?.storage && metadata.availableSpecs.storage.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Storage Capacity
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {metadata.availableSpecs.storage.slice(0, 5).map((storageItem) => {
                      const isSelected = filters.storage === storageItem;
                      return (
                        <button
                          key={storageItem}
                          type="button"
                          onClick={() =>
                            onFilterChange({
                              storage: isSelected ? undefined : storageItem,
                            })
                          }
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-all truncate max-w-full ${
                            isSelected
                              ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                              : "bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                          }`}
                        >
                          {storageItem.length > 18 ? `${storageItem.slice(0, 18)}...` : storageItem}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            6. CUSTOMER RATINGS
            ========================================================================= */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => toggleSection("rating")}
            className="w-full flex items-center justify-between text-left group"
          >
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-sky-400 transition-colors">
              Rating
            </span>
            {openSections.rating ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>

          {openSections.rating && (
            <div className="mt-2 space-y-1">
              {[4, 3].map((stars) => {
                const isSelected = Number(filters.rating) === stars;
                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        rating: isSelected ? undefined : String(stars),
                      })
                    }
                    className={`w-full flex items-center justify-between px-2.5 py-1 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < stars
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs">& above</span>
                    </div>
                    {isSelected && (
                      <Check className="h-3 w-3 text-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
