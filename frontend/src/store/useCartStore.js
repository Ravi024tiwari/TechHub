import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Production-Grade Shopping Cart Store:
 * - Backed by localStorage for instant (0ms) rehydration on page refresh.
 * - Reactive state for cart badge counters and checkout calculations.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Add item to cart or increment quantity
      addItem: (product, quantity = 1, selectedColor = null) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (item) =>
            item._id === product._id &&
            (!selectedColor || item.selectedColor === selectedColor)
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          set({ items: updated });
        } else {
          set({
            items: [
              ...currentItems,
              {
                _id: product._id,
                title: product.title,
                slug: product.slug,
                brandName: product.brandName || product.brand?.name || "",
                categoryName: product.categoryName || product.category?.name || "",
                salePrice: product.salePrice ?? product.regularPrice,
                regularPrice: product.regularPrice,
                image: product.images?.[0]?.url || product.image || "",
                quantity,
                selectedColor,
                stock: product.stock ?? 10,
              },
            ],
          });
        }
      },

      // Remove specific item from cart
      removeItem: (productId, selectedColor = null) => {
        set({
          items: get().items.filter(
            (item) =>
              !(
                item._id === productId &&
                (!selectedColor || item.selectedColor === selectedColor)
              )
          ),
        });
      },

      // Update quantity of an item
      updateQuantity: (productId, quantity, selectedColor = null) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedColor);
          return;
        }

        set({
          items: get().items.map((item) => {
            if (
              item._id === productId &&
              (!selectedColor || item.selectedColor === selectedColor)
            ) {
              return { ...item, quantity };
            }
            return item;
          }),
        });
      },

      // Empty the cart
      clearCart: () => set({ items: [] }),

      // Total number of items
      getTotalCount: () => {
        return get().items.reduce((total, item) => total + (item.quantity || 1), 0);
      },

      // Subtotal amount in Rupees
      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.salePrice ?? item.regularPrice ?? 0;
          return sum + price * (item.quantity || 1);
        }, 0);
      },
      getTotalPrice: () => {
        return get().getSubtotal();
      },
    }),
    {
      name: "shop_cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
