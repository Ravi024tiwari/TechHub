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
  { label: "Laptops", slug: "laptops" },
  { label: "Audio", slug: "audio" },
  { label: "Gaming GPUs", slug: "gaming" },
  { label: "Displays", slug: "monitors" },
];

export default function NavSearchAutocomplete({
  isMobile = false,
  onCloseMobile,
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Detect OS for shortcut badge
  const isMac =
    typeof window !== "undefined" &&
    navigator.userAgent.toUpperCase().includes("MAC");
  const shortcutLabel = isMac ? "⌘K" : "Ctrl+K";

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
      className={`relative ${
        isMobile ? "w-full" : "w-full max-w-xl xl:max-w-2xl"
      }`}
    >
      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
        className="relative w-full group"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder="Search MacBooks, RTX GPUs, Sony audio, OLEDs..."
          className="w-full h-10 sm:h-11 pl-10 pr-20 rounded-full bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] focus:bg-white dark:focus:bg-[#0c0f17] border-2 border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/35 focus:border-orange-500 dark:focus:border-orange-400 text-xs sm:text-sm font-sans font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 transition-all shadow-xs hover:shadow-md"
        />

        {/* Right Action Icons inside Input */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query ? (
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
          ) : (
            !isMobile && (
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-200/90 dark:bg-white/[0.08] border border-slate-300 dark:border-white/15 shadow-xs">
                {shortcutLabel}
              </span>
            )
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white/98 dark:bg-[#090b10]/98 backdrop-blur-2xl border-2 border-slate-300 dark:border-white/20 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150">
          {/* STATE 1: Empty Query - Show Trending & Categories */}
          {!debouncedQuery ? (
            <div className="p-4 sm:p-5 space-y-4">
              {/* Trending Searches */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>Trending Searches</span>
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
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 text-xs font-sans font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Search className="h-3 w-3 text-slate-500" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Categories */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06]">
                <div className="text-[11px] font-sans uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2">
                  Popular Categories
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        if (onCloseMobile) onCloseMobile();
                        navigate(`/category/${cat.slug}`);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-white text-left transition-all group flex items-center justify-between cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>{cat.label}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
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
