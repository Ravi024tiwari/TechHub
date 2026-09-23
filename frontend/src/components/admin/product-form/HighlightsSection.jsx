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
    <div className="rounded-2xl border-2 border-slate-200 dark:border-white/15 bg-white dark:bg-gradient-to-b dark:from-[#141824] dark:via-[#0d1017] dark:to-[#080a0e] p-3.5 sm:p-6 lg:p-7 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.8),_0_0_15px_rgba(255,255,255,0.05)] space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-mono font-bold text-xs sm:text-sm shrink-0 mt-0.5 sm:mt-0">
            06
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-heading font-bold text-slate-900 dark:text-white truncate">
              Key Highlights, Box Contents & Warranty
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              Bullet points displayed on storefront highlights, unboxing specifications, and warranty coverage.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Key Features Badges */}
      <div className="space-y-2.5 sm:space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
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
            placeholder="e.g. 120Hz ProMotion OLED, 65W GaN Fast Charging"
            className="flex-1 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-amber-500 dark:focus:border-amber-400 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
          <button
            type="button"
            onClick={handleAddFeature}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Features Chips */}
        {keyFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
            {keyFeatures.map((feat, idx) => (
              <span
                key={feat + idx}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-xs"
              >
                <span>{feat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="hover:text-amber-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. In-Box Contents */}
      <div className="space-y-2.5 sm:space-y-3 pt-3 border-t border-slate-200/60 dark:border-white/5">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
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
            placeholder="e.g. Device, 65W GaN Power Adapter, Braided USB-C Cable"
            className="flex-1 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
          <button
            type="button"
            onClick={handleAddBoxItem}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Box Items Chips */}
        {boxContents.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
            {boxContents.map((item, idx) => (
              <span
                key={item + idx}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono bg-sky-500/15 border border-sky-500/30 text-sky-700 dark:text-sky-300 shadow-xs"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBoxItem(idx)}
                  className="hover:text-sky-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Warranty Terms */}
      <div className="space-y-2.5 sm:space-y-3 pt-3 border-t border-slate-200/60 dark:border-white/5">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span>Warranty Terms & Coverage</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">Duration (Months)</label>
            <select
              value={warranty.durationMonths}
              onChange={(e) => setWarranty((prev) => ({ ...prev, durationMonths: Number(e.target.value) }))}
              className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-emerald-500 dark:focus:border-emerald-400 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value={6} className="bg-white dark:bg-[#12141c]">6 Months</option>
              <option value={12} className="bg-white dark:bg-[#12141c]">12 Months (1 Year Standard)</option>
              <option value={24} className="bg-white dark:bg-[#12141c]">24 Months (2 Years Flagship)</option>
              <option value={36} className="bg-white dark:bg-[#12141c]">36 Months (3 Years Extended)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">Claim Type</label>
            <select
              value={warranty.claimType}
              onChange={(e) => setWarranty((prev) => ({ ...prev, claimType: e.target.value }))}
              className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-white/15 focus:border-emerald-500 dark:focus:border-emerald-400 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="Manufacturer Warranty" className="bg-white dark:bg-[#12141c]">Brand Authorized Service Centers</option>
              <option value="Onsite Home Inspection" className="bg-white dark:bg-[#12141c]">Onsite Doorstep Service Warranty</option>
              <option value="Seller Replacement Guarantee" className="bg-white dark:bg-[#12141c]">7-Day Replacement Guarantee</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
