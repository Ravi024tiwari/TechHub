import React, { useState } from "react";
import { Palette, Plus, Trash2, Check, Star, AlertCircle, Sparkles } from "lucide-react";

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
}) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#18191B");
  const [newStock, setNewStock] = useState(10);
  const [newSku, setNewSku] = useState("");
  const [newPriceOverride, setNewPriceOverride] = useState("");
  const [isDefaultVariant, setIsDefaultVariant] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleApplyPreset = (preset) => {
    setNewColorName(preset.name);
    setNewColorCode(preset.code);
    setValidationError("");
  };

  const handleAddVariant = () => {
    setValidationError("");

    if (!newColorName.trim()) {
      setValidationError("Please enter a color name (e.g. 'Space Black', 'Natural Titanium').");
      return;
    }

    if (!newColorCode || !/^#([0-9A-F]{3}){1,2}$/i.test(newColorCode.trim())) {
      setValidationError("Please provide a valid Hex color code (e.g. #1A1D24).");
      return;
    }

    const exists = colorVariants.some(
      (v) => v.colorName.toLowerCase().trim() === newColorName.toLowerCase().trim()
    );
    if (exists) {
      setValidationError(`Variant "${newColorName}" has already been added.`);
      return;
    }

    const variantObj = {
      colorName: newColorName.trim(),
      colorCode: newColorCode.trim().toUpperCase(),
      stock: Number(newStock) >= 0 ? Number(newStock) : 0,
      sku: newSku.trim().toUpperCase() || undefined,
      priceOverride: newPriceOverride ? Number(newPriceOverride) : null,
      isDefault: colorVariants.length === 0 ? true : isDefaultVariant,
    };

    if (variantObj.isDefault) {
      // Unset previous defaults
      setColorVariants((prev) => prev.map((v) => ({ ...v, isDefault: false })));
    }

    setColorVariants((prev) => [...prev, variantObj]);

    // Reset inputs
    setNewColorName("");
    setNewColorCode("#4B4846");
    setNewStock(10);
    setNewSku("");
    setNewPriceOverride("");
    setIsDefaultVariant(false);
  };

  const handleRemoveVariant = (index) => {
    setColorVariants((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Ensure at least one default remains if variants exist
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
    <div className="rounded-2xl border-2 border-slate-200 dark:border-white/15 bg-white dark:bg-gradient-to-b dark:from-[#141824] dark:via-[#0d1017] dark:to-[#080a0e] p-3.5 sm:p-6 lg:p-7 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.8),_0_0_15px_rgba(255,255,255,0.05)] space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-600 dark:text-pink-400 font-mono font-bold text-xs sm:text-sm shrink-0 mt-0.5 sm:mt-0">
            04
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-heading font-bold text-slate-900 dark:text-white truncate">
              Color Combinations & Finish Studio
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              Create color variants with precise HEX swatches, individual warehouse stock, and SKU tracking.
            </p>
          </div>
        </div>

        <span className="text-[11px] sm:text-xs font-mono px-2.5 sm:px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 w-fit">
          {colorVariants.length} Configured
        </span>
      </div>

      {/* Flagship Quick Presets Palettes */}
      <div className="space-y-2">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Industrial Hardware Color Presets:</span>
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">Tap to apply palette</span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {FLAGSHIP_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-[#090b10] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-[11px] sm:text-xs font-mono text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <span
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-black/20 dark:border-white/30 shadow-inner shrink-0"
                style={{ backgroundColor: preset.code }}
              />
              <span className="truncate">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* New Variant Creator Form Card */}
      <div className="p-3.5 sm:p-5 rounded-xl bg-slate-50 dark:bg-[#090b10]/80 border border-slate-200 dark:border-white/10 space-y-3 sm:space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
          <Palette className="w-4 h-4 text-pink-500 dark:text-pink-400" />
          <span>Add Custom Color Finish</span>
        </h3>

        {validationError && (
          <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Swatch & Color Code */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">HEX Swatch</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColorCode}
                onChange={(e) => setNewColorCode(e.target.value.toUpperCase())}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-slate-300 dark:border-white/20 bg-transparent cursor-pointer p-0.5"
                title="Choose Color"
              />
              <input
                type="text"
                value={newColorCode}
                onChange={(e) => setNewColorCode(e.target.value.toUpperCase())}
                placeholder="#18191B"
                maxLength={7}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0e1118] border border-slate-200 dark:border-white/15 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-pink-500 dark:focus:border-pink-400"
              />
            </div>
          </div>

          {/* Color Name */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">Color Name</label>
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="e.g. Space Black"
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0e1118] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white outline-none focus:border-pink-500 dark:focus:border-pink-400 font-medium"
            />
          </div>

          {/* Variant Stock */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">Variant Stock Units</label>
            <input
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="10"
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0e1118] border border-slate-200 dark:border-white/15 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-pink-500 dark:focus:border-pink-400"
            />
          </div>

          {/* Price Override (Optional) */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">Price Override (₹)</label>
            <input
              type="number"
              min={0}
              value={newPriceOverride}
              onChange={(e) => setNewPriceOverride(e.target.value)}
              placeholder="Default MRP"
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0e1118] border border-slate-200 dark:border-white/15 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-pink-500 dark:focus:border-pink-400"
            />
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isDefaultVariant}
              onChange={(e) => setIsDefaultVariant(e.target.checked)}
              className="rounded border-slate-300 dark:border-white/20 bg-white dark:bg-[#0e1118] text-pink-500 focus:ring-0 cursor-pointer"
            />
            <span>Set as primary default color on storefront</span>
          </label>

          <button
            type="button"
            onClick={handleAddVariant}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Color Finish</span>
          </button>
        </div>
      </div>

      {/* Rendered Color Variants Swatch Shelf */}
      {colorVariants.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Finish Combinations ({colorVariants.length}):
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {colorVariants.map((variant, idx) => (
              <div
                key={variant.colorName + idx}
                className={`relative p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-2.5 sm:gap-3 ${
                  variant.isDefault
                    ? "border-pink-400/80 bg-pink-500/10 shadow-xs"
                    : "border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#090b10] hover:border-slate-300 dark:hover:border-white/30"
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {/* Swatch Circle */}
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-black/20 dark:border-white/40 shadow-xs shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: variant.colorCode }}
                  >
                    {variant.isDefault && (
                      <Star className="w-3 h-3 text-white fill-white drop-shadow-xs" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{variant.colorName}</span>
                      {variant.isDefault && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500 text-white font-mono uppercase shrink-0">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <span>{variant.colorCode}</span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{variant.stock}u</span>
                      {variant.priceOverride && (
                        <>
                          <span>·</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">₹{variant.priceOverride}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!variant.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-pink-500 dark:hover:text-pink-300 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors"
                      title="Set as Default Color"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete Finish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-center text-xs font-mono text-slate-400 dark:text-slate-500">
          No color combinations added yet. Products without color finishes will render using the primary gallery photo.
        </div>
      )}
    </div>
  );
}
