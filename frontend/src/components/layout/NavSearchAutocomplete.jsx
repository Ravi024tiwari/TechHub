import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  Star,
  Cpu,
  CornerDownLeft,
  Laptop,
  Headphones,
  Zap,
  Monitor,
  Smartphone,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { useSearchSuggestionsQuery } from "@/hooks/useProducts";

const TRENDING_SEARCHES = [
  "MacBook Pro M3 Max",
  "GeForce RTX 4090",
  "Sony WH-1000XM5",
  "OLED Gaming Monitor",
  "iPhone 16 Pro",
  "Mechanical Keyboard",
];

const QUICK_CATEGORIES = [
  { label: "Laptops & MacBooks", slug: "laptops", icon: Laptop },
  { label: "Audio Gear", slug: "audio", icon: Headphones },
  { label: "Gaming GPUs", slug: "gaming", icon: Zap },
  { label: "4K Displays", slug: "monitors", icon: Monitor },
  { label: "Smartphones", slug: "smartphones", icon: Smartphone },
];

const PLACEHOLDERS = [
  "Search MacBooks, laptops & iPads...",
  "Search RTX 4090, GPUs & processors...",
  "Search Sony audio, headphones & DACs...",
  "Search 4K OLED gaming monitors...",
  "Search flagship tech & accessories...",
];

export default function NavSearchAutocomplete({
  isMobile = false,
  onCloseMobile,
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Detect OS for shortcut badge
  const isMac =
    typeof window !== "undefined" &&
    navigator.userAgent.toUpperCase().includes("MAC");
  const shortcutLabel = isMac ? "⌘K" : "Ctrl+K";

  // Cycle placeholder when not typing
  useEffect(() => {
    if (query || isOpen) return;
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [query, isOpen]);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);

  // Live suggestions query
  const { data: suggestions = [], isLoading } =
    useSearchSuggestionsQuery(debouncedQuery);

  // Global keyboard shortcut (Ctrl+K or ⌘K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (searchVal) => {
    const finalVal = (searchVal ?? query).trim();
    if (finalVal) {
      setIsOpen(false);
      if (onCloseMobile) onCloseMobile();
      navigate(`/products?search=${encodeURIComponent(finalVal)}`);
    }
  };

  const handleProductSelect = (product) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    navigate(`/product/${product.slug || product._id}`);
  };

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div
      ref={containerRef}
      className={`relative ${isMobile ? "w-full" : "w-full"}`}
    >
      {/* Search Input Box with Ambient Gradient Halo on Focus */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
        className="relative w-full group transition-all duration-300"
      >
        {/* Ambient Neon Beam behind search bar on focus */}
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-400 opacity-0 group-focus-within:opacity-100 blur-xs transition-opacity duration-300 pointer-events-none -z-0" />

        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-sky-500 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-400 group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 group-focus-within:scale-110 transition-all duration-200" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={PLACEHOLDERS[placeholderIndex]}
          className="relative z-10 w-full h-10 sm:h-11 pl-10 pr-24 rounded-full bg-slate-100/95 dark:bg-white/[0.07] hover:bg-slate-200/90 dark:hover:bg-white/[0.1] focus:bg-white dark:focus:bg-[#07090f] border-2 border-slate-300 dark:border-white/20 hover:border-sky-400/80 dark:hover:border-white/40 focus:border-sky-500 dark:focus:border-sky-400 text-xs sm:text-sm font-sans font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400/80 focus:outline-hidden focus:ring-4 focus:ring-sky-500/20 shadow-xs hover:shadow-md transition-all"
        />

        {/* Right Action Icons inside Input */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-20">
          {query ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setDebouncedQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-[11px] font-bold font-heading uppercase transition-colors shadow-xs"
              >
                Search
              </button>
            </div>
          ) : (
            !isMobile && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-200/90 dark:bg-white/10 border border-slate-300 dark:border-white/15 shadow-xs group-focus-within:border-sky-500/40 group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors">
                {shortcutLabel}
              </span>
            )
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2.5 z-50 overflow-hidden text-left rounded-2xl bg-white/98 dark:bg-[#0a0d14]/98 backdrop-blur-2xl border-2 border-slate-300 dark:border-white/20 shadow-2xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] animate-in fade-in slide-in-from-top-2 duration-200 ${
            isMobile
              ? "left-0 right-0 w-full"
              : "left-1/2 -translate-x-1/2 w-[calc(100vw-24px)] sm:w-[500px] md:w-[560px] lg:w-[620px] max-w-[620px]"
          }`}
        >
          {/* STATE 1: Empty Query - Show Trending & Categories */}
          {!debouncedQuery ? (
            <div>
              <div className="p-4 sm:p-5 space-y-4">
                {/* Trending Searches */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-heading uppercase tracking-wider text-[11px]">
                        Trending Searches
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300">
                      Hot right now
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setQuery(item);
                          handleSearchSubmit(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-xs font-sans font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Search className="h-3 w-3 text-slate-400 group-hover:text-sky-500" />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Categories */}
                <div className="pt-3.5 border-t border-slate-200 dark:border-white/[0.08]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-heading uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
                      Popular Categories
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        if (onCloseMobile) onCloseMobile();
                        navigate("/products");
                      }}
                      className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Explore all</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {QUICK_CATEGORIES.map((cat) => {
                      const CatIcon = cat.icon;
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            if (onCloseMobile) onCloseMobile();
                            navigate(`/category/${cat.slug}`);
                          }}
                          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white text-left transition-all group flex items-center justify-between cursor-pointer shadow-xs active:scale-95"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors shrink-0">
                              <CatIcon className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate">{cat.label}</span>
                          </div>
                          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Keyboard Hint */}
              <div className="px-4 py-2 bg-slate-100/70 dark:bg-white/[0.02] border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/15 text-[10px] font-bold">↵</kbd>
                  Press Enter to search
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/15 text-[10px] font-bold">ESC</kbd>
                  to close
                </span>
              </div>
            </div>
          ) : (
            /* STATE 2: Query Active - Show Live Suggestions */
            <div>
              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-sans">
                <span>
                  Search results for{" "}
                  <strong className="text-slate-900 dark:text-white font-bold">
                    "{debouncedQuery}"
                  </strong>
                </span>
                {isLoading && (
                  <span className="text-[11px] text-orange-600 dark:text-orange-400 font-mono font-bold animate-pulse">
                    Scanning catalog...
                  </span>
                )}
              </div>

              {/* Suggestions List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
                {suggestions && suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleProductSelect(item)}
                      className="flex items-center gap-3.5 p-3 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] cursor-pointer transition-colors group"
                    >
                      {/* Product Thumbnail */}
                      <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-xs">
                        {(() => {
                          const imgUrl =
                            typeof item.images?.[0] === "object"
                              ? item.images[0]?.url
                              : item.images?.[0];
                          return imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={item.title}
                              className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Cpu className="h-5 w-5 text-slate-400" />
                          );
                        })()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.brand && (
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold">
                              {item.brand}
                            </span>
                          )}
                          {item.averageRating && (
                            <span className="flex items-center gap-0.5 text-[11px] text-amber-500 dark:text-amber-300 font-bold">
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                              {item.averageRating}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mt-0.5">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                            {formatINR(item.salePrice || item.regularPrice)}
                          </span>
                          {item.salePrice &&
                            item.regularPrice > item.salePrice && (
                              <span className="text-[10px] text-slate-400 line-through font-mono">
                                {formatINR(item.regularPrice)}
                              </span>
                            )}
                        </div>
                      </div>

                      {/* Quick jump icon */}
                      <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-orange-600 dark:group-hover:text-white group-hover:bg-orange-50 dark:group-hover:bg-white/10 transition-colors shrink-0">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  ))
                ) : !isLoading ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      No matching products found for "{debouncedQuery}"
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Check for spelling errors or try searching for general
                      terms like "MacBook", "GPU", or "Headphones".
                    </p>
                  </div>
                ) : null}
              </div>

              {/* View All Matches Footer */}
              <div className="p-2.5 bg-slate-50 dark:bg-white/[0.03] border-t border-slate-200 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-white text-xs font-sans font-bold flex items-center justify-center gap-2 transition-all group cursor-pointer shadow-xs active:scale-95"
                >
                  <span>View all results for "{debouncedQuery}"</span>
                  <CornerDownLeft className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
