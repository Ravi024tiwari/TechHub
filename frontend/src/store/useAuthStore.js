import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Industrial-Grade Zustand Auth Store:
 * - Backed by localStorage via `persist` middleware for 0ms rehydration on page refresh.
 * - Stores user profile, accessToken, and refreshToken synchronously.
 * - Central single source of truth for client authentication state.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      // Set credentials on successful login / registration / refresh
      setCredentials: ({ user, accessToken, refreshToken }) => {
        set((state) => ({
          user: user !== undefined ? user : state.user,
          token: accessToken || null,
          refreshToken: refreshToken || state.refreshToken || null,
          isAuthenticated: Boolean(accessToken && (user || state.user)),
        }));
      },

      // Update user profile in place (e.g. after profile edit or background /me fetch)
      updateUser: (updatedUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
        }));
      },

      // Clear authentication state on logout
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "shop_auth", // Key in localStorage
      storage: createJSONStorage(() => localStorage),
      // Persist user, token, refreshToken, and isAuthenticated
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
