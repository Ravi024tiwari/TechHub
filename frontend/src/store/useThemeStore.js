import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "dark", // default theme

      setTheme: (newTheme) => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
        root.style.colorScheme = newTheme;
        set({ theme: newTheme });
      },

      toggleTheme: () => {
        const currentTheme = get().theme || "dark";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        get().setTheme(nextTheme);
      },

      initTheme: () => {
        const storedTheme = get().theme || "dark";
        get().setTheme(storedTheme);
      },
    }),
    {
      name: "techhaven-theme-preference",
    }
  )
);
