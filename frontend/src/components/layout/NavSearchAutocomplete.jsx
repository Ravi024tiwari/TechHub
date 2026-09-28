import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

const PLACEHOLDERS = [
  "Search MacBooks, laptops...",
  "Search RTX 4090, GPUs, CPUs...",
  "Search Sony audio, OLEDs...",
  "Search flagship tech & gear...",
];

export default function NavSearchAutocomplete({
  isMobile = false,
  onCloseMobile,
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef(null);

  // Detect OS for shortcut badge
  const isMac =
    typeof window !== "undefined" &&
    navigator.userAgent.toUpperCase().includes("MAC");
  const shortcutLabel = isMac ? "⌘K" : "Ctrl+K";

  // Cycle placeholder when not typing
  useEffect(() => {
    if (query) return;
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [query]);

  // Global keyboard shortcut (Ctrl+K or ⌘K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const finalVal = query.trim();
    if (finalVal) {
      if (onCloseMobile) onCloseMobile();
      navigate(`/products?search=${encodeURIComponent(finalVal)}`);
    }
  };

  return (
    <div className={`relative ${isMobile ? "w-full" : "w-full"}`}>
      {/* Search Input Box with Precision Focus */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative w-full group transition-all duration-300"
      >
        {/* Soft Ambient Glow (subtle in dark mode, clean in light mode) */}
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-orange-500/30 via-amber-500/30 to-orange-400/30 opacity-0 dark:opacity-0 dark:group-focus-within:opacity-80 blur-xs transition-opacity duration-300 pointer-events-none -z-0" />

        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors duration-200" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={PLACEHOLDERS[placeholderIndex]}
          className="relative z-10 w-full h-10 sm:h-10.5 pl-10 pr-12 sm:pr-20 rounded-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white dark:bg-white/[0.07] dark:hover:bg-white/[0.1] dark:focus:bg-[#07090f] border border-slate-300/90 hover:border-slate-400 focus:border-orange-500 dark:border-white/20 dark:hover:border-white/40 dark:focus:border-orange-400 text-xs sm:text-sm font-sans font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400/80 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/30 shadow-2xs focus:shadow-[0_2px_12px_rgba(249,115,22,0.12)] transition-all"
        />

        {/* Right Action Icons inside Input */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-20">
          {query ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-[11px] font-bold font-heading uppercase transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Search
              </button>
            </div>
          ) : (
            !isMobile && (
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 select-none pointer-events-none group-focus-within:border-orange-400/50 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors">
                {shortcutLabel}
              </span>
            )
          )}
        </div>
      </form>
    </div>
  );
}
