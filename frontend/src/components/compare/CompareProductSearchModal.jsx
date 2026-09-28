import React, { useState, useEffect } from "react";
import { Search, X, Plus, Check, Star, Loader2 } from "lucide-react";
import { fetchProducts } from "@/api/productApi";
import { useCompareStore } from "@/store/useCompareStore";

/**
 * Production-Grade Inline Product Picker Modal:
 * - Allows searching and adding a product directly into an empty comparison slot
 * - Filters out already-compared products
 * - Shows price, image, rating, and stock status
 */
export default function CompareProductSearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const items = useCompareStore((state) => state.items);
  const addToCompare = useCompareStore((state) => state.addToCompare);
  const isInCompare = useCompareStore((state) => state.isInCompare);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(() => {
      fetchProducts({
        search: searchQuery.trim(),
        limit: 12,
      })
        .then((res) => {
          if (isMounted) {
            setProducts(res.products || []);
          }
        })
        .catch(() => {
          if (isMounted) setProducts([]);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, searchQuery]);

  if (!isOpen) return null;

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const handleSelectProduct = (prod) => {
    const res = addToCompare(prod);
    if (res?.success) {
      onClose();
    } else if (res?.reason === "MAX_LIMIT") {
      alert("Maximum 4 comparison items reached.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white dark:bg-[#0c0f18] border-2 border-slate-300 dark:border-white/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
              Add Product to Comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Select an electronics item from catalog to benchmark side-by-side
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, brand (Apple, Samsung, Sony), or model..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#141824] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 ring-2 ring-transparent focus:ring-orange-500/20 transition-all font-sans"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <p className="text-xs font-sans">Searching catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-sans text-xs">
              No matching products found. Try a different keyword.
            </div>
          ) : (
            products.map((prod) => {
              const alreadySelected = isInCompare(prod._id);
              const price = prod.salePrice ?? prod.regularPrice;

              return (
                <div
                  key={prod._id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    alreadySelected
                      ? "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-60"
                      : "bg-white dark:bg-[#10141f] border-slate-200 dark:border-white/10 hover:border-orange-500/50 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 shrink-0">
                      <img
                        src={prod.images?.[0]?.url || prod.image || ""}
                        alt={prod.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                          {prod.brandName || prod.brand?.name || "TechHub"}
                        </span>
                        {prod.averageRating > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            {Number(prod.averageRating).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {prod.title}
                      </h4>
                      <p className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                        {formatINR(price)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectProduct(prod)}
                    disabled={alreadySelected}
                    className={`px-3.5 py-1.5 rounded-xl font-heading font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      alreadySelected
                        ? "bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 text-white shadow-xs active:scale-95"
                    }`}
                  >
                    {alreadySelected ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
