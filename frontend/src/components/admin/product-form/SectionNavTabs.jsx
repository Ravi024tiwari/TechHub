import React from "react";
import {
  Layers,
  IndianRupee,
  Image as ImageIcon,
  Palette,
  Cpu,
  ShieldCheck,
} from "lucide-react";

export default function SectionNavTabs({
  activeSection,
  onSelectSection,
  counts = {},
}) {
  const tabs = [
    {
      id: "section-general",
      num: "01",
      label: "General",
      fullLabel: "General Info",
      icon: Layers,
      count: null,
    },
    {
      id: "section-pricing",
      num: "02",
      label: "Pricing",
      fullLabel: "Pricing & Stock",
      icon: IndianRupee,
      count: null,
    },
    {
      id: "section-media",
      num: "03",
      label: "Photos",
      fullLabel: "Media & Gallery",
      icon: ImageIcon,
      count: counts.images ?? null,
    },
    {
      id: "section-variants",
      num: "04",
      label: "Colors",
      fullLabel: "Color Variants",
      icon: Palette,
      count: counts.colors ?? null,
    },
    {
      id: "section-specs",
      num: "05",
      label: "Specs",
      fullLabel: "Tech Specs",
      icon: Cpu,
      count: counts.specs ?? null,
    },
    {
      id: "section-highlights",
      num: "06",
      label: "Highlights",
      fullLabel: "Highlights & Warranty",
      icon: ShieldCheck,
      count: null,
    },
  ];

  return (
    <div className="sticky top-[58px] sm:top-[68px] z-20 -mx-3.5 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 lg:px-8 py-1.5 sm:py-2 bg-slate-50/90 dark:bg-[#090b10]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 mb-4 sm:mb-6">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mr-1 shrink-0 hidden md:inline-block">
          Jump to:
        </span>

        {tabs.map((tab) => {
          const isActive = activeSection === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSection(tab.id)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? "bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40 shadow-xs font-bold"
                  : "bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <span
                className={`text-[9px] sm:text-[10px] font-bold ${
                  isActive
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {tab.num}
              </span>
              <Icon
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  isActive
                    ? "text-sky-500 dark:text-sky-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <span className="inline sm:hidden">{tab.label}</span>
              <span className="hidden sm:inline">{tab.fullLabel}</span>

              {tab.count !== null && (
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? "bg-sky-500/30 text-sky-800 dark:text-sky-200"
                      : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
