import React, { useState } from "react";
import { Zap, Package, ShieldCheck, Plus, X } from "lucide-react";

export default function HighlightsSection({
  keyFeatures = [],
  setKeyFeatures,
  boxContents = [],
  setBoxContents,
  warranty = { durationMonths: 12, claimType: "Manufacturer Warranty" },
  setWarranty,
}) {
  const [featureInput, setFeatureInput] = useState("");
  const [boxInput, setBoxInput] = useState("");

  const handleAddFeature = (e) => {
    e?.preventDefault();
    if (!featureInput.trim()) return;
    if (keyFeatures.includes(featureInput.trim())) return;
    setKeyFeatures((prev) => [...prev, featureInput.trim()]);
    setFeatureInput("");
  };

  const handleRemoveFeature = (idx) => {
    setKeyFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddBoxItem = (e) => {
    e?.preventDefault();
    if (!boxInput.trim()) return;
    if (boxContents.includes(boxInput.trim())) return;
    setBoxContents((prev) => [...prev, boxInput.trim()]);
    setBoxInput("");
  };

  const handleRemoveBoxItem = (idx) => {
    setBoxContents((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-white/30 bg-white dark:bg-[#0c0f17] p-4 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group overflow-hidden space-y-5 sm:space-y-6">
      {/* Contained Ambient Background Glow */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
      </div>

      {/* Section Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200 dark:border-white/15">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-amber-500/30 shrink-0 shadow-xs">
            06
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white truncate">
              Key Highlights, Box Contents & Warranty
            </h2>
            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 line-clamp-1">
              Storefront highlight bullets, unboxing package contents, and warranty coverage terms.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Key Features Badges */}
      <div className="relative z-10 space-y-2.5">
        <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Key Feature Highlights</span>
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddFeature();
              }
            }}
            placeholder="e.g. 120Hz ProMotion OLED, 65W GaN Fast Charging (Press Enter)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-hidden font-sans shadow-xs"
          />
          <button
            type="button"
            onClick={handleAddFeature}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-sans font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Features Chips */}
        {keyFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {keyFeatures.map((feat, idx) => (
              <span
                key={feat + idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 shadow-xs"
              >
                <span>{feat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                  title="Remove feature"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. In-Box Contents */}
      <div className="relative z-10 space-y-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
        <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-500" />
          <span>Items Included in Box</span>
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={boxInput}
            onChange={(e) => setBoxInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddBoxItem();
              }
            }}
            placeholder="e.g. Device, 65W GaN Power Adapter, Braided USB-C Cable (Press Enter)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-hidden font-sans shadow-xs"
          />
          <button
            type="button"
            onClick={handleAddBoxItem}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-sans font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Box Items Chips */}
        {boxContents.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {boxContents.map((item, idx) => (
              <span
                key={item + idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium bg-orange-500/15 border border-orange-500/30 text-orange-800 dark:text-orange-300 shadow-xs"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBoxItem(idx)}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                  title="Remove box item"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Warranty Terms */}
      <div className="relative z-10 space-y-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
        <label className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Warranty Coverage Terms</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <div className="space-y-1">
            <label className="text-xs font-sans uppercase text-slate-600 dark:text-slate-400 font-semibold">
              Duration (Months)
            </label>
            <select
              value={warranty.durationMonths}
              onChange={(e) =>
                setWarranty((prev) => ({
                  ...prev,
                  durationMonths: Number(e.target.value),
                }))
              }
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-emerald-500 dark:focus:border-emerald-400 text-xs sm:text-sm font-sans font-semibold text-slate-900 dark:text-white outline-hidden cursor-pointer shadow-xs"
            >
              <option value={6} className="bg-white dark:bg-[#12141c]">
                6 Months
              </option>
              <option value={12} className="bg-white dark:bg-[#12141c]">
                12 Months (1 Year Standard)
              </option>
              <option value={24} className="bg-white dark:bg-[#12141c]">
                24 Months (2 Years Flagship)
              </option>
              <option value={36} className="bg-white dark:bg-[#12141c]">
                36 Months (3 Years Extended)
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-sans uppercase text-slate-600 dark:text-slate-400 font-semibold">
              Claim Type
            </label>
            <select
              value={warranty.claimType}
              onChange={(e) =>
                setWarranty((prev) => ({
                  ...prev,
                  claimType: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-white/20 focus:border-emerald-500 dark:focus:border-emerald-400 text-xs sm:text-sm font-sans font-semibold text-slate-900 dark:text-white outline-hidden cursor-pointer shadow-xs"
            >
              <option
                value="Manufacturer Warranty"
                className="bg-white dark:bg-[#12141c]"
              >
                Brand Authorized Service Centers
              </option>
              <option
                value="Onsite Home Inspection"
                className="bg-white dark:bg-[#12141c]"
              >
                Onsite Doorstep Service Warranty
              </option>
              <option
                value="Seller Replacement Guarantee"
                className="bg-white dark:bg-[#12141c]"
              >
                7-Day Replacement Guarantee
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
