import React from "react";
import { X, Sparkles, SlidersHorizontal } from "lucide-react";

/**
 * Active Filter Chips and Search Context Ribbon:
 * - Gives customers clear visual feedback of active filters.
 * - Allows instant single-click removal of any individual facet or all filters.
 */
export default function ActiveFilterBadges({
  filters,
  metadata,
  totalProducts = 0,
  onRemoveFilter,
  onResetFilters,
  className = "",
}) {
  const chips = [];

  // 1. Search Query Chip
  if (filters.search) {
    chips.push({
      id: "search",
      label: `Search: "${filters.search}"`,
      onRemove: () => onRemoveFilter("search"),
    });
  }

  // 2. Categories Chips
  if (filters.category) {
    const catSlugs = filters.category.split(",").map((s) => s.trim()).filter(Boolean);
    catSlugs.forEach((slug) => {
      const catMeta = metadata?.categories?.find(
        (c) => c.slug === slug || c._id === slug
      );
      const label = catMeta?.name || slug;
      chips.push({
        id: `category_${slug}`,
        label: `Category: ${label}`,
        onRemove: () => {
          const remaining = catSlugs.filter((s) => s !== slug);
          onRemoveFilter("category", remaining.length > 0 ? remaining.join(",") : undefined);
        },
      });
    });
  }

  // 3. Brands Chips
  if (filters.brand) {
    const brandSlugs = filters.brand.split(",").map((s) => s.trim()).filter(Boolean);
    brandSlugs.forEach((slug) => {
      const brandMeta = metadata?.brands?.find(
        (b) => b.slug === slug || b.name?.toLowerCase() === slug.toLowerCase() || b._id === slug
      );
      const label = brandMeta?.name || slug;
      chips.push({
        id: `brand_${slug}`,
        label: `Brand: ${label}`,
        onRemove: () => {
          const remaining = brandSlugs.filter((s) => s !== slug);
          onRemoveFilter("brand", remaining.length > 0 ? remaining.join(",") : undefined);
        },
      });
    });
  }

  // 4. Price Range Chip
  if (filters.minPrice || filters.maxPrice) {
    const minText = filters.minPrice ? `₹${Number(filters.minPrice).toLocaleString("en-IN")}` : "₹0";
    const maxText = filters.maxPrice ? `₹${Number(filters.maxPrice).toLocaleString("en-IN")}` : "Any";
    chips.push({
      id: "price",
      label: `Price: ${minText} - ${maxText}`,
      onRemove: () => {
        onRemoveFilter("minPrice", undefined);
        onRemoveFilter("maxPrice", undefined);
      },
    });
  }

  // 5. In Stock Only filter
  if (filters.inStock === "true" || filters.inStock === true) {
    chips.push({
      id: "inStock",
      label: "In Stock Only",
      onRemove: () => onRemoveFilter("inStock", undefined),
    });
  }

  // 6. Rating filter
  if (filters.rating) {
    chips.push({
      id: "rating",
      label: `${filters.rating}★ & above`,
      onRemove: () => onRemoveFilter("rating", undefined),
    });
  }

  // 7. RAM filter adding
  if (filters.ram) {
    chips.push({
      id: "ram",
      label: `RAM: ${filters.ram}`,
      onRemove: () => onRemoveFilter("ram", undefined),
    });
  }

  // 8. Storage filter
  if (filters.storage) {
    chips.push({
      id: "storage",
      label: `Storage: ${filters.storage}`,
      onRemove: () => onRemoveFilter("storage", undefined),
    });
  }

  // 9. Processor Chip
  if (filters.processor) {
    chips.push({
      id: "processor",
      label: `CPU: ${filters.processor}`,
      onRemove: () => onRemoveFilter("processor", undefined),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 p-3 sm:p-3.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-800/80 rounded-xl transition-all ${className}`}
    >
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-tech uppercase tracking-wider pr-1">
        <SlidersHorizontal className="h-3.5 w-3.5 text-sky-500" />
        <span>Active Filters:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip.id}
            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-400 transition-colors animate-in fade-in"
          >
            <span>{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              title="Remove filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline hover:text-rose-700 dark:hover:text-rose-300 ml-1 cursor-pointer"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
