import React, { useState } from "react";
import {
  Palette,
  Plus,
  Trash2,
  Check,
  Star,
  AlertCircle,
  Sparkles,
  Boxes,
  Minus,
  RefreshCw,
} from "lucide-react";

// Flagship Electronics Color Presets (Apple / Samsung / Sony inspired)
const FLAGSHIP_COLOR_PRESETS = [
  { name: "Space Black", code: "#18191B" },
  { name: "Natural Titanium", code: "#9E9885" },
  { name: "Desert Titanium", code: "#C5A880" },
  { name: "White Titanium", code: "#F5F5F7" },
  { name: "Space Gray", code: "#4B4846" },
  { name: "Silver", code: "#E2E4E6" },
  { name: "Midnight", code: "#192231" },
  { name: "Starlight", code: "#E8E5DD" },
  { name: "Phantom Black", code: "#0D0E11" },
  { name: "Cobalt Violet", code: "#4D4665" },
  { name: "Amber Yellow", code: "#F2CD70" },
  { name: "Alpine Green", code: "#2B3C35" },
];

export default function ColorVariantsSection({
  colorVariants = [],
  setColorVariants,
  masterSku = "",
}) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#18191B");
  const [newStock, setNewStock] = useState(15);
  const [newSku, setNewSku] = useState("");
  const [newPriceOverride, setNewPriceOverride] = useState("");
  const [isDefaultVariant, setIsDefaultVariant] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Calculate total units across all configured variants
  const totalVariantStock = colorVariants.reduce(
    (sum, v) => sum + (Number(v.stock) || 0),
    0
  );

  const handleApplyPreset = (preset) => {
    setNewColorName(preset.name);
    setNewColorCode(preset.code);
    setValidationError("");
  };

  const handleAddVariant = () => {
    setValidationError("");

    if (!newColorName.trim()) {
      setValidationError(
        "Please enter a color finish name (e.g. 'Space Black', 'Natural Titanium')."
      );
      return;
    }

    if (!newColorCode || !/^#([0-9A-F]{3}){1,2}$/i.test(newColorCode.trim())) {
      setValidationError("Please provide a valid Hex color code (e.g. #1A1D24).");
      return;
    }

    const exists = colorVariants.some(
      (v) =>
        v.colorName.toLowerCase().trim() === newColorName.toLowerCase().trim()
    );
    if (exists) {
      setValidationError(`Variant "${newColorName}" has already been added.`);
      return;
    }

    // Auto-generate variant SKU if blank
    const autoSku =
      newSku.trim() ||
      `${(masterSku || "PRD").slice(0, 7)}-${newColorName
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 3)
        .toUpperCase()}`;

    const variantObj = {
      colorName: newColorName.trim(),
      colorCode: newColorCode.trim().toUpperCase(),
      stock: Math.max(0, Number(newStock) || 0),
      sku: autoSku.toUpperCase(),
      priceOverride:
        newPriceOverride !== "" && newPriceOverride !== null
          ? Number(newPriceOverride)
          : null,
      isDefault: colorVariants.length === 0 ? true : isDefaultVariant,
    };

    if (variantObj.isDefault) {
      setColorVariants((prev) =>
        prev.map((v) => ({ ...v, isDefault: false }))
      );
    }

    setColorVariants((prev) => [...prev, variantObj]);

    // Reset inputs for rapid sequential entry
    setNewColorName("");
    setNewColorCode("#4B4846");
    setNewStock(15);
    setNewSku("");
    setNewPriceOverride("");
    setIsDefaultVariant(false);
  };

  // Stock controller helpers
  const handleUpdateStock = (index, value) => {
    const parsed = Math.max(0, Number(value) || 0);
    setColorVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, stock: parsed } : v))
    );
  };

  const handleIncrementStock = (index) => {
    setColorVariants((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, stock: (Number(v.stock) || 0) + 1 } : v
      )
    );
  };

  const handleDecrementStock = (index) => {
    setColorVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? { ...v, stock: Math.max(0, (Number(v.stock) || 0) - 1) }
          : v
      )
    );
  };

  const handleUpdatePriceOverride = (index, val) => {
    setColorVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? { ...v, priceOverride: val === "" ? null : Number(val) }
          : v
      )
    );
  };

  const handleRemoveVariant = (index) => {
    setColorVariants((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((v) => v.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
  };

  const handleSetDefault = (index) => {
    setColorVariants((prev) =>
      prev.map((v, i) => ({
        ...v,
        isDefault: i === index,
      }))
    );
  };

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-white/30 bg-white dark:bg-[#0c0f17] p-4 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group overflow-hidden space-y-5 sm:space-y-6">
      {/* Contained Ambient Background Glow */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-pink-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
      </div>

      {/* Section Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200 dark:border-white/15">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-pink-500/20 via-rose-500/15 to-pink-500/10 text-pink-600 dark:text-pink-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-pink-500/30 shrink-0 shadow-xs">
            04
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white truncate">
              Color Finishes & Variant Studio
            </h2>
            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 line-clamp-1">
              Configure finish swatches, allocate warehouse stock per color, and set custom pricing overrides.
            </p>
          </div>
        </div>

        {/* Total Variants Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 shadow-xs">
            <Boxes className="w-3.5 h-3.5 text-orange-500" />
            <span>
              {colorVariants.length} {colorVariants.length === 1 ? "Finish" : "Finishes"} · {totalVariantStock} Units
            </span>
          </span>
        </div>
      </div>

      {/* Auto-Sync Banner when Variants Exist */}
      {colorVariants.length > 0 && (
        <div className="relative z-10 p-3 sm:p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-700 dark:text-orange-300 text-xs font-sans font-semibold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <RefreshCw className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate">
              Warehouse inventory synchronized: Total stock in Section 02 will reflect{" "}
              <strong>{totalVariantStock} units</strong>.
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-600 dark:text-orange-300 shrink-0">
            Auto-Sync
          </span>
        </div>
      )}

      {/* Flagship Quick Presets */}
      <div className="relative z-10 space-y-2">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs font-sans text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Industrial Hardware Color Presets:</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Tap to auto-fill swatch & name
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {FLAGSHIP_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#07090e] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/15 text-xs font-sans font-medium text-slate-700 dark:text-slate-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/30 shadow-inner shrink-0"
                style={{ backgroundColor: preset.code }}
              />
              <span className="truncate">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* New Variant Creator Form Card */}
      <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-[#07090e] border border-slate-300 dark:border-white/15 space-y-3 sm:space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-500" />
            <span>Add New Color Finish</span>
          </h3>
          <span className="text-[11px] font-sans text-slate-400">
            Allocates dedicated stock per variant
          </span>
        </div>

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-sans font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Swatch & Color Code */}
          <div className="space-y-1">
            <label className="text-xs font-sans uppercase text-slate-600 dark:text-slate-400 font-semibold">
              HEX Swatch
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColorCode}
                onChange={(e) => setNewColorCode(e.target.value.toUpperCase())}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-white/20 bg-transparent cursor-pointer p-0.5 shrink-0"
                title="Choose Color"
              />
              <input
                type="text"
                value={newColorCode}
                onChange={(e) => setNewColorCode(e.target.value.toUpperCase())}
                placeholder="#18191B"
                maxLength={7}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase outline-hidden focus:border-pink-500 shadow-xs"
              />
            </div>
          </div>

          {/* Color Name */}
          <div className="space-y-1">
            <label className="text-xs font-sans uppercase text-slate-600 dark:text-slate-400 font-semibold">
              Finish Name
            </label>
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="e.g. Natural Titanium"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 text-xs text-slate-900 dark:text-white outline-hidden focus:border-pink-500 font-sans font-medium shadow-xs"
            />
          </div>

          {/* Initial Variant Stock */}
          <div className="space-y-1">
            <label className="text-xs font-sans uppercase text-slate-600 dark:text-slate-400 font-semibold">
              Initial Stock Units
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="15"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 text-xs font-mono font-bold text-slate-900 dark:text-white outline-hidden focus:border-pink-500 shadow-xs"
            />
          </div>

          {/* Price Override (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-sans uppercase text-slate-600 dark:text-slate-400 font-semibold">
              Price Override (Optional ₹)
            </label>
            <input
              type="number"
              min={0}
              value={newPriceOverride}
              onChange={(e) => setNewPriceOverride(e.target.value)}
              placeholder="Default MRP"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 text-xs font-mono text-slate-900 dark:text-white outline-hidden focus:border-pink-500 shadow-xs"
            />
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-slate-600 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={isDefaultVariant}
              onChange={(e) => setIsDefaultVariant(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-orange-500 focus:ring-0 cursor-pointer"
            />
            <span>Set as primary default color on storefront</span>
          </label>

          <button
            type="button"
            onClick={handleAddVariant}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Color Finish</span>
          </button>
        </div>
      </div>

      {/* Color Inventory Matrix */}
      {colorVariants.length > 0 ? (
        <div className="relative z-10 space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-sans text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Active Finishes & Stock Allocation ({colorVariants.length}):
            </span>
            <span className="text-[11px] text-slate-400">
              Adjust stock units directly below
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {colorVariants.map((variant, idx) => {
              const stockNum = Number(variant.stock) || 0;
              const isOutOfStock = stockNum <= 0;
              const isLowStock = stockNum > 0 && stockNum <= 5;

              return (
                <div
                  key={variant.colorName + idx}
                  className={`p-4 rounded-2xl border transition-all space-y-3 shadow-xs ${
                    variant.isDefault
                      ? "border-pink-500/70 bg-pink-500/[0.04] dark:bg-pink-500/[0.08]"
                      : "border-slate-300 dark:border-white/20 bg-slate-50/70 dark:bg-[#07090e] hover:border-slate-400 dark:hover:border-white/40"
                  }`}
                >
                  {/* Variant Top Header: Swatch, Name, Default Badge & Actions */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Swatch Bubble */}
                      <div
                        className="w-9 h-9 rounded-2xl border border-black/20 dark:border-white/30 shadow-xs shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: variant.colorCode }}
                      >
                        {variant.isDefault && (
                          <Star className="w-4 h-4 text-white fill-white drop-shadow-xs" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-heading font-bold text-slate-900 dark:text-white truncate">
                            {variant.colorName}
                          </h4>
                          {variant.isDefault && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-500 text-white font-sans uppercase font-bold shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                          {variant.colorCode}{" "}
                          {variant.sku ? `· SKU: ${variant.sku}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Default star & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!variant.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                          title="Set as Default Storefront Color"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove Color Variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stock Controller Row with Stepper & Status Badge */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/15 flex flex-wrap items-center justify-between gap-2.5">
                    {/* Inline Stock Stepper */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-sans uppercase text-slate-500 dark:text-slate-400 font-bold mr-1">
                        Stock:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDecrementStock(idx)}
                        disabled={stockNum <= 0}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer shadow-xs active:scale-95"
                        title="Decrease stock by 1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={variant.stock}
                        onChange={(e) => handleUpdateStock(idx, e.target.value)}
                        className="w-14 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 rounded-md text-slate-900 dark:text-white outline-hidden focus:border-pink-500"
                      />

                      <button
                        type="button"
                        onClick={() => handleIncrementStock(idx)}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Increase stock by 1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Stock Health Badge */}
                    <div className="shrink-0">
                      {isOutOfStock ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Out of Stock</span>
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Low ({stockNum} left)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{stockNum} units</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Optional Price Override Footer */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>Variant Price:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={variant.priceOverride ?? ""}
                        onChange={(e) =>
                          handleUpdatePriceOverride(idx, e.target.value)
                        }
                        placeholder="Default MRP"
                        className="w-24 px-2 py-0.5 text-right font-mono text-xs font-semibold bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 rounded-md text-slate-900 dark:text-white outline-hidden focus:border-pink-500 shadow-xs"
                        title="Leave blank to use regular price"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="relative z-10 p-5 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 text-center text-xs font-sans text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-bold text-slate-700 dark:text-slate-300">
            No color finishes configured yet.
          </p>
          <p className="text-[11px]">
            Add finishes above to track inventory and swatches individually for each hardware option.
          </p>
        </div>
      )}
    </div>
  );
}
