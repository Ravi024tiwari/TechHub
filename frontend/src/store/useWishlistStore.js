import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Production Wishlist Store:
 * - Backed by localStorage for instant (0ms) heart toggles and counter badges.
 */
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Toggle product in/out of wishlist
      toggleWishlist: (product) => {
        const current = get().items;
        const exists = current.some((item) => item._id === product._id);

        if (exists) {
          set({ items: current.filter((item) => item._id !== product._id) });
        } else {
          set({
            items: [
              ...current,
              {
                _id: product._id,
                title: product.title,
                slug: product.slug,
                brandName: product.brandName || product.brand?.name || "",
                categoryName: product.categoryName || product.category?.name || "",
                salePrice: product.salePrice ?? product.regularPrice,
                regularPrice: product.regularPrice,
                image: product.images?.[0]?.url || product.image || "",
                inStock: (product.stock ?? 1) > 0,
              },
            ],
          });
        }
      },

      // Check if a product is in wishlist
      isInWishlist: (productId) => {
        return get().items.some((item) => item._id === productId);
      },

      // Total count
      getWishlistCount: () => get().items.length,

      // Clear wishlist
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "shop_wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
