import React from "react";
import { Cpu, Sparkles } from "lucide-react";

/**
 * Radiant Silver Light Beam Divider:
 * Directly inspired by the reference UI (Linear/Suprema keynote aesthetic).
 * Provides clean section separation with a glowing horizontal light tube and ambient aura,
 * completely replacing noisy background grid lines.
 */
export default function SilverBeamDivider({
  badgeText = "Flagship Catalog",
  title = "Precision at a Glance",
  subtitle = "High-performance architecture engineered with uncompromising standards.",
}) {
  return (
    <div className="relative w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 sm:py-14 flex flex-col items-center text-center overflow-hidden">
      {/* 1. Atmospheric Silver Ambient Halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] sm:w-[42rem] h-28 bg-white/[0.08] blur-3xl rounded-full pointer-events-none" />

      {/* 2. Intense Radiant Silver Horizontal Light Tube */}
      <div className="relative w-full max-w-4xl h-[2px] mb-8 sm:mb-10">
        {/* Soft edge blur */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent blur-[2px] opacity-80" />
        {/* Crisp core beam */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_25px_5px_rgba(255,255,255,0.75)]" />
      </div>

      {/* 3. Glowing Center Hardware Icon */}
      <div className="relative mb-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-b from-white/20 to-white/5 border border-white/25 flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.2)]">
          <Cpu className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* 4. Section Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/15 text-[11px] font-tech text-slate-200 uppercase tracking-widest mb-3">
        <Sparkles className="h-3 w-3 text-cyan-300" />
        <span>{badgeText}</span>
      </div>

      {/* 5. Heading & Subtitle */}
      <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight max-w-xl">
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-xs sm:text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
