import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const MAX_COMPARE_ITEMS = 4;

/**
 * Production-Grade Product Comparison Store:
 * - Backed by localStorage for persistence across routes and reloads.
 * - Enforces 4-item hard limit for optimal side-by-side spec grid rendering.
 * - Detects category variance to advise customers on spec matching fidelity.
 */
export const useCompareStore = create(
  persist(
    (set, get) => ({
      items: [],
      maxItems: MAX_COMPARE_ITEMS,
      isDockOpen: true, // Controls collapse/expand of floating bar

      // Toggle Dock open/collapsed
      toggleDock: () => set((state) => ({ isDockOpen: !state.isDockOpen })),
      setDockOpen: (isOpen) => set({ isDockOpen: isOpen }),

      // Add product to comparison
      addToCompare: (product) => {
        const current = get().items;
        const exists = current.some((item) => item._id === product._id);

        if (exists) {
          return { success: false, reason: "ALREADY_EXISTS" };
        }

        if (current.length >= MAX_COMPARE_ITEMS) {
          return { success: false, reason: "MAX_LIMIT", limit: MAX_COMPARE_ITEMS };
        }

        const categoryName =
          product.categoryName ||
          product.category?.name ||
          (typeof product.category === "string" ? product.category : "");

        const categorySlug =
          product.categorySlug ||
          product.category?.slug ||
          "";

        // Check if there is already an item with a different category
        const hasDifferentCategory =
          current.length > 0 &&
          current.some(
            (c) =>
              c.categoryName &&
              categoryName &&
              c.categoryName.toLowerCase() !== categoryName.toLowerCase()
          );

        const newProduct = {
          _id: product._id,
          title: product.title,
          slug: product.slug,
          brandName: product.brandName || product.brand?.name || "",
          categoryName,
          categorySlug,
          salePrice: product.salePrice ?? product.regularPrice,
          regularPrice: product.regularPrice,
          image:
            product.images?.[0]?.url ||
            product.image ||
            product.thumbnail ||
            "",
          inStock: (product.stock ?? 1) > 0,
          averageRating: product.averageRating || product.rating || 0,
        };

        set({
          items: [...current, newProduct],
          isDockOpen: true,
        });

        return {
          success: true,
          categoryMismatch: hasDifferentCategory,
          total: current.length + 1,
        };
      },

      // Remove single product
      removeFromCompare: (productId) => {
        const current = get().items;
        set({ items: current.filter((item) => item._id !== productId) });
      },

      // Toggle in/out of comparison
      toggleCompare: (product) => {
        const isPresent = get().isInCompare(product._id);
        if (isPresent) {
          get().removeFromCompare(product._id);
          return { action: "REMOVED" };
        } else {
          const res = get().addToCompare(product);
          return { action: "ADDED", ...res };
        }
      },

      // Check if product is in compare list
      isInCompare: (productId) => {
        return get().items.some((item) => item._id === productId);
      },

      // Clear all items
      clearCompare: () => set({ items: [] }),

      // Total count
      getCompareCount: () => get().items.length,

      // Checks if currently selected items span multiple categories
      hasCategoryMismatch: () => {
        const current = get().items;
        if (current.length <= 1) return false;
        const firstCat = current[0]?.categoryName?.toLowerCase();
        return current.some(
          (item) =>
            item.categoryName &&
            item.categoryName.toLowerCase() !== firstCat
        );
      },
    }),
    {
      name: "shop_compare",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
