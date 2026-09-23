import React from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

export default function ThemeToggle({ className = "", compact = false }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative p-2 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-1.5 outline-none select-none active:scale-95 ${
        isDark
          ? "bg-white/[0.06] hover:bg-white/12 border-white/15 text-slate-200 hover:text-white hover:border-white/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.25)]"
          : "bg-slate-100 hover:bg-slate-200/80 border-slate-300/80 text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
      } ${className}`}
      title={`Switch to ${isDark ? "Bright (Light)" : "Dark"} Mode`}
      aria-label={`Toggle theme (currently ${isDark ? "Dark" : "Bright"} mode)`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-500 fill-amber-400/20" />
          {!compact && (
            <span className="text-xs font-mono font-bold text-slate-200 hidden sm:inline">
              Bright
            </span>
          )}
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-500 fill-indigo-600/20" />
          {!compact && (
            <span className="text-xs font-mono font-bold text-slate-800 hidden sm:inline">
              Dark
            </span>
          )}
        </>
      )}
    </button>
  );
}
