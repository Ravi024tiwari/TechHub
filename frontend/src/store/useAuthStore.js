import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Industrial-Grade Zustand Auth Store:
 * - Backed by localStorage via `persist` middleware for 0ms rehydration on page refresh.
 * - Stores user profile and accessToken synchronously.
 * - Central single source of truth for client authentication state.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Set credentials on successful login / registration
      setCredentials: ({ user, accessToken }) => {
        set({
          user: user || null,
          token: accessToken || null,
          isAuthenticated: Boolean(accessToken && user),
        });
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
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "techhaven_auth_session", // Key in localStorage
      storage: createJSONStorage(() => localStorage),
      // Only persist user, token, and isAuthenticated
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
