import React, { useState } from "react";
import {
  Cpu,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// Category-Driven Specifications Validation Matrix (Matches Backend CATEGORY_SPECS_RULES)
const CATEGORY_SPECS_RULES = {
  smartphone: [
    {
      field: "processor",
      label: "Processor / Chipset",
      placeholder: "e.g. Snapdragon 8 Gen 3 / Apple A18 Pro",
    },
    {
      field: "ram",
      label: "RAM Capacity",
      placeholder: "e.g. 12GB LPDDR5X",
    },
    {
      field: "storage",
      label: "Internal Storage",
      placeholder: "e.g. 256GB UFS 4.0",
    },
    {
      field: "rearCamera",
      label: "Rear Camera Setup",
      placeholder: "e.g. 50MP OIS + 12MP Ultra-Wide + 10MP Telephoto",
    },
    {
      field: "batteryCapacity",
      label: "Battery Capacity",
      placeholder: "e.g. 5000 mAh (65W Fast Charging)",
    },
    {
      field: "displayType",
      label: "Display Specs",
      placeholder: "e.g. 6.7-inch 120Hz LTPO AMOLED (2600 nits)",
    },
  ],
  laptop: [
    {
      field: "processor",
      label: "CPU / Processor",
      placeholder: "e.g. Intel Core i9-14900HX / Apple M3 Max",
    },
    {
      field: "gpu",
      label: "GPU / Graphics Card",
      placeholder: "e.g. NVIDIA GeForce RTX 4080 (12GB GDDR6)",
    },
    {
      field: "ram",
      label: "RAM Size & Type",
      placeholder: "e.g. 32GB DDR5 5600MHz",
    },
    {
      field: "storage",
      label: "SSD Storage Capacity",
      placeholder: "e.g. 1TB NVMe PCIe 4.0 M.2 SSD",
    },
    {
      field: "screenSize",
      label: "Display Size & Refresh Rate",
      placeholder: "e.g. 16.0-inch 3.2K 165Hz Mini-LED",
    },
  ],
  audio: [
    {
      field: "type",
      label: "Audio Form Factor",
      placeholder: "e.g. TWS In-Ear Earbuds / Over-Ear Studio ANC",
    },
    {
      field: "driverSizeMm",
      label: "Driver Size & Magnet",
      placeholder: "e.g. 11mm Titanium Dynamic Driver",
    },
    {
      field: "batteryPlaytimeHours",
      label: "Playback Battery Time",
      placeholder: "e.g. 40 Hours total with charging case",
    },
  ],
  charger: [
    {
      field: "wattage",
      label: "Maximum Output Wattage",
      placeholder: "e.g. 65W GaN Fast Charger",
    },
    {
      field: "outputPorts",
      label: "Port Layout",
      placeholder: "e.g. 2x USB-C (PD 3.0) + 1x USB-A",
    },
    {
      field: "fastChargingProtocols",
      label: "Supported Protocols",
      placeholder:
        "e.g. PD 3.0, QC 4+, PPS 45W, Samsung Super Fast",
    },
  ],
  wearable: [
    {
      field: "displayType",
      label: "Display Type & Sapphire",
      placeholder: "e.g. 1.96-inch Always-on Retina Sapphire AMOLED",
    },
    {
      field: "batteryLifeDays",
      label: "Battery Life Duration",
      placeholder: "e.g. Up to 72 Hours in Low Power Mode",
    },
  ],
  peripheral: [
    {
      field: "connectivityType",
      label: "Connectivity Mode",
      placeholder:
        "e.g. Tri-Mode (2.4GHz Wireless, Bluetooth 5.3, USB-C)",
    },
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
    CATEGORY_SPECS_RULES[
      Object.keys(CATEGORY_SPECS_RULES).find((k) =>
        normalizedCategory.includes(k)
      )
    ] ||
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
    <div className="relative rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-white/30 bg-white dark:bg-[#0c0f17] p-4 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group overflow-hidden space-y-5 sm:space-y-6">
      {/* Contained Ambient Background Glow */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-cyan-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
      </div>

      {/* Section Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200 dark:border-white/15">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-sky-500/15 to-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-cyan-500/30 shrink-0 shadow-xs">
            05
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white truncate">
              Dynamic Technical Specifications
            </h2>
            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 line-clamp-1">
              Technical attributes required for catalog filters, comparison sheets, and spec sheets.
            </p>
          </div>
        </div>

        {categoryName && (
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 w-fit shrink-0">
            {categoryName} Standards
          </span>
        )}
      </div>

      {/* Category Standard Form Fields */}
      {matchedRules.length > 0 ? (
        <div className="relative z-10 space-y-3 sm:space-y-4">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs font-sans text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Cpu className="w-4 h-4 text-cyan-500" />
              <span>Standard Specifications for {categoryName}:</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Category Schema Matched</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {matchedRules.map((rule) => (
              <div key={rule.field} className="space-y-1">
                <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold">
                  {rule.label}
                </label>
                <input
                  type="text"
                  value={specifications[rule.field] || ""}
                  onChange={(e) => handleSpecChange(rule.field, e.target.value)}
                  placeholder={rule.placeholder}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-hidden font-sans font-medium shadow-xs"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative z-10 p-4 rounded-2xl bg-slate-50/70 dark:bg-[#07090e] border border-slate-300 dark:border-white/15 text-xs font-sans text-slate-600 dark:text-slate-400 flex items-center gap-3">
          <Sliders className="w-5 h-5 text-cyan-500 shrink-0" />
          <span>
            {categoryName
              ? `No predefined schema matrix found for "${categoryName}". Add custom technical specs below.`
              : "Select a Category in Section 01 to load standard hardware specifications (CPU, RAM, GPU, etc.)."}
          </span>
        </div>
      )}

      {/* Extra / Custom Key-Value Specifications */}
      <div className="relative z-10 space-y-3 pt-3 border-t border-slate-200 dark:border-white/15">
        <h4 className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-cyan-500" />
          <span>Add Custom Technical Specification</span>
        </h4>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder="Spec Name (e.g. Operating System, Bluetooth)"
            className="w-full sm:w-1/3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-hidden font-sans shadow-xs"
          />
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Spec Value (e.g. macOS Sonoma, Bluetooth 5.3 LE)"
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-hidden font-sans shadow-xs"
          />
          <button
            type="button"
            onClick={handleAddCustomSpec}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Spec</span>
          </button>
        </div>

        {/* Custom Specifications Chips List */}
        {Object.entries(specifications).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
            {Object.entries(specifications)
              .filter(([k]) => !matchedRules.some((r) => r.field === k))
              .map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/15 flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="truncate">
                    <p className="text-[10px] font-sans uppercase font-bold text-slate-500 dark:text-slate-400 truncate">
                      {key}
                    </p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {String(val)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(key)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                    title="Remove specification"
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
