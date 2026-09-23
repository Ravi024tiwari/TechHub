import React from "react";
import { Check, AlertTriangle, Sparkles } from "lucide-react";

export default function ColorVariantSelector({
  colors = [],
  selectedColor = null,
  onSelectColor,
  basePrice = 0,
}) {
  if (!colors || colors.length === 0) return null;

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-3 pt-2">
      {/* Header: Finish Label & Selection Name */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Color Finish:
          </span>
          <span className="text-xs sm:text-sm font-heading font-extrabold text-slate-900 dark:text-white">
            {selectedColor?.colorName || colors[0]?.colorName || "Standard"}
          </span>
        </div>

        <span className="text-[10px] font-mono text-slate-400">
          {colors.length} {colors.length === 1 ? "Option" : "Options"}
        </span>
      </div>

      {/* Interactive Color Chips Grid */}
      <div className="flex flex-wrap gap-2.5">
        {colors.map((color, idx) => {
          const isSelected =
            selectedColor?._id === color._id ||
            selectedColor?.colorName === color.colorName ||
            (!selectedColor && idx === 0);

          const stock = Number(color.stock);
          const isOut = stock === 0;
          const isLow = stock > 0 && stock <= 3;

          // Price difference if override exists
          const priceDiff =
            color.priceOverride && color.priceOverride !== basePrice
              ? color.priceOverride - basePrice
              : 0;

          return (
            <button
              key={color._id || idx}
              type="button"
              onClick={() => onSelectColor(color)}
              className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer border-2 ${
                isSelected
                  ? "border-sky-500 bg-sky-50/70 dark:bg-sky-500/10 ring-2 ring-sky-500/25 shadow-sm scale-102"
                  : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0e14] hover:border-slate-300 dark:hover:border-white/25 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
              }`}
            >
              {/* Color Swatch Circle with Halo */}
              <div className="relative">
                <span
                  style={{ backgroundColor: color.colorCode || "#000000" }}
                  className="w-5 h-5 rounded-full block border border-black/20 shadow-sm shrink-0"
                />
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check
                      className={`w-3 h-3 stroke-[3] ${
                        color.colorCode?.toLowerCase() === "#ffffff" ||
                        color.colorCode?.toLowerCase() === "#fff" ||
                        color.colorCode?.toLowerCase() === "#fafafa"
                          ? "text-black"
                          : "text-white drop-shadow-md"
                      }`}
                    />
                  </span>
                )}
              </div>

              {/* Finish Details */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-heading font-bold leading-tight ${
                      isSelected
                        ? "text-sky-700 dark:text-sky-300"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {color.colorName}
                  </span>

                  {priceDiff !== 0 && (
                    <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {priceDiff > 0
                        ? `+${formatINR(priceDiff)}`
                        : `-${formatINR(Math.abs(priceDiff))}`}
                    </span>
                  )}
                </div>

                {/* Stock telemetry mini indicator */}
                {isOut ? (
                  <span className="text-[9px] font-mono text-rose-500 font-bold leading-none mt-0.5">
                    Sold Out
                  </span>
                ) : isLow ? (
                  <span className="text-[9px] font-mono text-amber-500 font-bold leading-none mt-0.5">
                    Only {stock} left
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-400 leading-none mt-0.5">
                    {color.sku || "In Stock"}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
