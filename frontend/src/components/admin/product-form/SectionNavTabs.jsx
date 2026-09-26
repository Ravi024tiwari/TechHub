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
      label: "Media",
      fullLabel: "Media & Photos",
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
      fullLabel: "Technical Specs",
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
    <nav
      aria-label="Product form sections"
      className="sticky top-[56px] sm:top-[66px] z-20 -mx-3.5 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 lg:px-8 py-2 bg-slate-50/95 dark:bg-[#08090a]/95 backdrop-blur-md border-b border-slate-300 dark:border-white/15 mb-4 sm:mb-6"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] font-sans uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mr-1 shrink-0 hidden md:inline-block">
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
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-sans whitespace-nowrap transition-all cursor-pointer shrink-0 border select-none ${
                isActive
                  ? "bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/40 shadow-xs font-bold ring-1 ring-orange-500/20"
                  : "bg-white dark:bg-[#0c0f17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/30 font-medium"
              }`}
            >
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab.num}
              </span>

              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />

              <span className="hidden sm:inline">{tab.fullLabel}</span>
              <span className="sm:hidden">{tab.label}</span>

              {tab.count !== null && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                    isActive
                      ? "bg-orange-500/20 text-orange-700 dark:text-orange-300"
                      : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
