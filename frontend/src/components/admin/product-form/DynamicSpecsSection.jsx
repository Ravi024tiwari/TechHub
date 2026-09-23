import React, { useState } from "react";
import { Cpu, Plus, Trash2, Sliders, CheckCircle2, Sparkles } from "lucide-react";

// Category-Driven Specifications Validation Matrix (Matches Backend CATEGORY_SPECS_RULES)
const CATEGORY_SPECS_RULES = {
  smartphone: [
    { field: "processor", label: "Processor / Chipset", placeholder: "e.g. Snapdragon 8 Gen 3 / Apple A18 Pro" },
    { field: "ram", label: "RAM Capacity", placeholder: "e.g. 12GB LPDDR5X" },
    { field: "storage", label: "Internal Storage", placeholder: "e.g. 256GB UFS 4.0" },
    { field: "rearCamera", label: "Rear Camera Setup", placeholder: "e.g. 50MP OIS + 12MP Ultra-Wide + 10MP Telephoto" },
    { field: "batteryCapacity", label: "Battery Capacity", placeholder: "e.g. 5000 mAh (65W Fast Charging)" },
    { field: "displayType", label: "Display Specs", placeholder: "e.g. 6.7-inch 120Hz LTPO AMOLED (2600 nits)" },
  ],
  laptop: [
    { field: "processor", label: "CPU / Processor", placeholder: "e.g. Intel Core i9-14900HX / Apple M3 Max" },
    { field: "gpu", label: "GPU / Graphics Card", placeholder: "e.g. NVIDIA GeForce RTX 4080 (12GB GDDR6)" },
    { field: "ram", label: "RAM Size & Type", placeholder: "e.g. 32GB DDR5 5600MHz" },
    { field: "storage", label: "SSD Storage Capacity", placeholder: "e.g. 1TB NVMe PCIe 4.0 M.2 SSD" },
    { field: "screenSize", label: "Display Size & Refresh Rate", placeholder: "e.g. 16.0-inch 3.2K 165Hz Mini-LED" },
  ],
  audio: [
    { field: "type", label: "Audio Form Factor", placeholder: "e.g. TWS In-Ear Earbuds / Over-Ear Studio ANC" },
    { field: "driverSizeMm", label: "Driver Size & Magnet", placeholder: "e.g. 11mm Titanium Dynamic Driver" },
    { field: "batteryPlaytimeHours", label: "Playback Battery Time", placeholder: "e.g. 40 Hours total with charging case" },
  ],
  charger: [
    { field: "wattage", label: "Maximum Output Wattage", placeholder: "e.g. 65W GaN Fast Charger" },
    { field: "outputPorts", label: "Port Layout", placeholder: "e.g. 2x USB-C (PD 3.0) + 1x USB-A" },
    { field: "fastChargingProtocols", label: "Supported Protocols", placeholder: "e.g. PD 3.0, QC 4+, PPS 45W, Samsung Super Fast" },
  ],
  wearable: [
    { field: "displayType", label: "Display Type & Sapphire", placeholder: "e.g. 1.96-inch Always-on Retina Sapphire AMOLED" },
    { field: "batteryLifeDays", label: "Battery Life Duration", placeholder: "e.g. Up to 72 Hours in Low Power Mode" },
  ],
  peripheral: [
    { field: "connectivityType", label: "Connectivity Mode", placeholder: "e.g. Tri-Mode (2.4GHz Wireless, Bluetooth 5.3, USB-C)" },
  ],
};

export default function DynamicSpecsSection({
  categoryName = "",
  specifications = {},
  setSpecifications,
}) {
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");

  // Normalize category lookup (handles singular/plural e.g. "smartphones" -> "smartphone")
  const normalizedCategory = categoryName
    .toLowerCase()
    .trim()
    .replace(/s$/, "");

  const matchedRules =
    CATEGORY_SPECS_RULES[normalizedCategory] ||
    CATEGORY_SPECS_RULES[Object.keys(CATEGORY_SPECS_RULES).find((k) => normalizedCategory.includes(k))] ||
    [];

  const handleSpecChange = (field, value) => {
    setSpecifications((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddCustomSpec = () => {
    if (!customKey.trim() || !customValue.trim()) return;
    setSpecifications((prev) => ({
      ...prev,
      [customKey.trim()]: customValue.trim(),
    }));
    setCustomKey("");
    setCustomValue("");
  };

  const handleRemoveSpec = (field) => {
    setSpecifications((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-white/15 bg-white dark:bg-gradient-to-b dark:from-[#141824] dark:via-[#0d1017] dark:to-[#080a0e] p-3.5 sm:p-6 lg:p-7 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.8),_0_0_15px_rgba(255,255,255,0.05)] space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xs sm:text-sm shrink-0 mt-0.5 sm:mt-0">
            05
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-heading font-bold text-slate-900 dark:text-white truncate">
              Dynamic Technical Specifications
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              Technical attributes required for filtering, comparisons, and product technical sheets.
            </p>
          </div>
        </div>

        {categoryName && (
          <span className="text-[11px] sm:text-xs font-mono px-2.5 sm:px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-semibold w-fit">
            {categoryName} Standards
          </span>
        )}
      </div>

      {/* Category Standard Form Fields */}
      {matchedRules.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <Cpu className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>Standard Specifications for {categoryName}:</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Category Schema Matched</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
            {matchedRules.map((rule) => (
              <div key={rule.field} className="space-y-1">
                <label className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-medium">
                  {rule.label}
                </label>
                <input
                  type="text"
                  value={specifications[rule.field] || ""}
                  onChange={(e) => handleSpecChange(rule.field, e.target.value)}
                  placeholder={rule.placeholder}
                  className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-cyan-500 dark:focus:border-cyan-400 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none font-medium"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
          <span>
            {categoryName
              ? `No predefined schema matrix found for "${categoryName}". You can add custom technical specifications below.`
              : "Select a Category above to load standard technical specification fields (CPU, RAM, GPU, etc.)."}
          </span>
        </div>
      )}

      {/* Extra / Custom Key-Value Specifications */}
      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/10">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>Add Custom Technical Specification</span>
        </h4>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder="Spec Name (e.g. 'Operating System', 'Bluetooth')"
            className="w-full sm:w-1/3 px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-cyan-500 dark:focus:border-cyan-400 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Spec Value (e.g. 'macOS Sonoma', 'Bluetooth 5.3 LE')"
            className="w-full sm:flex-1 px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-cyan-500 dark:focus:border-cyan-400 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
          <button
            type="button"
            onClick={handleAddCustomSpec}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0 active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Spec</span>
          </button>
        </div>

        {/* Custom Specifications Chips List */}
        {Object.entries(specifications).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5 pt-2">
            {Object.entries(specifications)
              .filter(([k]) => !matchedRules.some((r) => r.field === k))
              .map(([key, val]) => (
                <div
                  key={key}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="truncate">
                    <p className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 truncate">{key}</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{String(val)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(key)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
