import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Edit3,
  Trash2,
  ExternalLink,
  Package,
  Layers,
  Laptop,
  Smartphone,
  Headphones,
  Gamepad2,
  Monitor,
  Watch,
  Camera,
  Tv,
  Cpu,
  HardDrive
} from "lucide-react";

// Map electronics category name to appropriate tech icon
const getCategoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("laptop") || n.includes("macbook") || n.includes("computer")) return Laptop;
  if (n.includes("phone") || n.includes("mobile") || n.includes("iphone") || n.includes("smartphone")) return Smartphone;
  if (n.includes("audio") || n.includes("headphone") || n.includes("earbud") || n.includes("sound")) return Headphones;
  if (n.includes("game") || n.includes("gaming") || n.includes("console")) return Gamepad2;
  if (n.includes("monitor") || n.includes("display") || n.includes("screen")) return Monitor;
  if (n.includes("watch") || n.includes("wearable")) return Watch;
  if (n.includes("camera") || n.includes("lens")) return Camera;
  if (n.includes("tv") || n.includes("television")) return Tv;
  if (n.includes("storage") || n.includes("ssd") || n.includes("drive")) return HardDrive;
  if (n.includes("component") || n.includes("processor") || n.includes("chip")) return Cpu;
  return Layers;
};

// Dynamic Category Palette for Rich Contrast & Visual Distinction
const getCategoryTheme = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("audio") || n.includes("headphone") || n.includes("sound") || n.includes("earbud")) {
    return {
      accent: "amber",
      borderHover: "hover:border-amber-400 dark:hover:border-amber-500/50",
      shadowHover: "hover:shadow-[0_16px_40px_-10px_rgba(245,158,11,0.2)] dark:hover:shadow-[0_16px_40px_-10px_rgba(245,158,11,0.25)]",
      bannerGradient: "from-amber-500/15 via-orange-500/10 to-transparent dark:from-amber-500/25 dark:via-orange-600/15 dark:to-transparent",
      glowBg: "bg-amber-500/20",
      emblemBg: "bg-amber-50 dark:bg-gradient-to-br dark:from-amber-500/25 dark:via-orange-500/15 dark:to-[#1c1810]",
      emblemBorder: "border-amber-300/80 dark:border-amber-400/40 group-hover:border-amber-500 shadow-xs dark:shadow-[0_0_15px_rgba(245,158,11,0.25)]",
      emblemText: "text-amber-600 dark:text-amber-400",
      badge: "text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/15 dark:border-amber-500/35",
      textHover: "group-hover:text-amber-600 dark:group-hover:text-amber-300",
      linkText: "text-amber-600 group-hover:text-amber-700 dark:text-amber-400 dark:group-hover:text-amber-300",
      watermark: "text-amber-500/20 dark:text-amber-400/30 group-hover:text-amber-500/35 dark:group-hover:text-amber-400/50",
      ambientLight: "rgba(245, 158, 11, 0.12)",
    };
  }
  if (n.includes("game") || n.includes("gaming") || n.includes("console")) {
    return {
      accent: "emerald",
      borderHover: "hover:border-emerald-400 dark:hover:border-emerald-500/50",
      shadowHover: "hover:shadow-[0_16px_40px_-10px_rgba(16,185,129,0.2)] dark:hover:shadow-[0_16px_40px_-10px_rgba(16,185,129,0.25)]",
      bannerGradient: "from-emerald-500/15 via-teal-500/10 to-transparent dark:from-emerald-500/25 dark:via-teal-600/15 dark:to-transparent",
      glowBg: "bg-emerald-500/20",
      emblemBg: "bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-500/25 dark:via-teal-500/15 dark:to-[#0d1c16]",
      emblemBorder: "border-emerald-300/80 dark:border-emerald-400/40 group-hover:border-emerald-500 shadow-xs dark:shadow-[0_0_15px_rgba(16,185,129,0.25)]",
      emblemText: "text-emerald-600 dark:text-emerald-400",
      badge: "text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-500/35",
      textHover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-300",
      linkText: "text-emerald-600 group-hover:text-emerald-700 dark:text-emerald-400 dark:group-hover:text-emerald-300",
      watermark: "text-emerald-500/20 dark:text-emerald-400/30 group-hover:text-emerald-500/35 dark:group-hover:text-emerald-400/50",
      ambientLight: "rgba(16, 185, 129, 0.12)",
    };
  }
  if (n.includes("laptop") || n.includes("macbook") || n.includes("computer")) {
    return {
      accent: "cyan",
      borderHover: "hover:border-cyan-400 dark:hover:border-cyan-500/50",
      shadowHover: "hover:shadow-[0_16px_40px_-10px_rgba(6,182,212,0.2)] dark:hover:shadow-[0_16px_40px_-10px_rgba(6,182,212,0.25)]",
      bannerGradient: "from-cyan-500/15 via-blue-500/10 to-transparent dark:from-cyan-500/25 dark:via-blue-600/15 dark:to-transparent",
      glowBg: "bg-cyan-500/20",
      emblemBg: "bg-cyan-50 dark:bg-gradient-to-br dark:from-cyan-500/25 dark:via-blue-500/15 dark:to-[#0e1a24]",
      emblemBorder: "border-cyan-300/80 dark:border-cyan-400/40 group-hover:border-cyan-500 shadow-xs dark:shadow-[0_0_15px_rgba(6,182,212,0.25)]",
      emblemText: "text-cyan-600 dark:text-cyan-400",
      badge: "text-cyan-800 bg-cyan-50 border-cyan-200 dark:text-cyan-300 dark:bg-cyan-500/15 dark:border-cyan-500/35",
      textHover: "group-hover:text-cyan-600 dark:group-hover:text-cyan-300",
      linkText: "text-cyan-600 group-hover:text-cyan-700 dark:text-cyan-400 dark:group-hover:text-cyan-300",
      watermark: "text-cyan-500/20 dark:text-cyan-400/30 group-hover:text-cyan-500/35 dark:group-hover:text-cyan-400/50",
      ambientLight: "rgba(6, 182, 212, 0.12)",
    };
  }
  if (n.includes("phone") || n.includes("mobile") || n.includes("iphone") || n.includes("smartphone")) {
    return {
      accent: "violet",
      borderHover: "hover:border-violet-400 dark:hover:border-violet-500/50",
      shadowHover: "hover:shadow-[0_16px_40px_-10px_rgba(139,92,246,0.2)] dark:hover:shadow-[0_16px_40px_-10px_rgba(139,92,246,0.25)]",
      bannerGradient: "from-violet-500/15 via-purple-500/10 to-transparent dark:from-violet-500/25 dark:via-purple-600/15 dark:to-transparent",
      glowBg: "bg-violet-500/20",
      emblemBg: "bg-violet-50 dark:bg-gradient-to-br dark:from-violet-500/25 dark:via-purple-500/15 dark:to-[#181224]",
      emblemBorder: "border-violet-300/80 dark:border-violet-400/40 group-hover:border-violet-500 shadow-xs dark:shadow-[0_0_15px_rgba(139,92,246,0.25)]",
      emblemText: "text-violet-600 dark:text-violet-400",
      badge: "text-violet-800 bg-violet-50 border-violet-200 dark:text-violet-300 dark:bg-violet-500/15 dark:border-violet-500/35",
      textHover: "group-hover:text-violet-600 dark:group-hover:text-violet-300",
      linkText: "text-violet-600 group-hover:text-violet-700 dark:text-violet-400 dark:group-hover:text-violet-300",
      watermark: "text-violet-500/20 dark:text-violet-400/30 group-hover:text-violet-500/35 dark:group-hover:text-violet-400/50",
      ambientLight: "rgba(139, 92, 246, 0.12)",
    };
  }
  if (n.includes("watch") || n.includes("wearable")) {
    return {
      accent: "rose",
      borderHover: "hover:border-rose-400 dark:hover:border-rose-500/50",
      shadowHover: "hover:shadow-[0_16px_40px_-10px_rgba(244,63,94,0.2)] dark:hover:shadow-[0_16px_40px_-10px_rgba(244,63,94,0.25)]",
      bannerGradient: "from-rose-500/15 via-pink-500/10 to-transparent dark:from-rose-500/25 dark:via-pink-600/15 dark:to-transparent",
      glowBg: "bg-rose-500/20",
      emblemBg: "bg-rose-50 dark:bg-gradient-to-br dark:from-rose-500/25 dark:via-pink-500/15 dark:to-[#241217]",
      emblemBorder: "border-rose-300/80 dark:border-rose-400/40 group-hover:border-rose-500 shadow-xs dark:shadow-[0_0_15px_rgba(244,63,94,0.25)]",
      emblemText: "text-rose-600 dark:text-rose-400",
      badge: "text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-500/15 dark:border-rose-500/35",
      textHover: "group-hover:text-rose-600 dark:group-hover:text-rose-300",
      linkText: "text-rose-600 group-hover:text-rose-700 dark:text-rose-400 dark:group-hover:text-rose-300",
      watermark: "text-rose-500/20 dark:text-rose-400/30 group-hover:text-rose-500/35 dark:group-hover:text-rose-400/50",
      ambientLight: "rgba(244, 63, 94, 0.12)",
    };
  }
  // Default / Peripherals / Components
  return {
    accent: "sky",
    borderHover: "hover:border-sky-400 dark:hover:border-sky-500/50",
    shadowHover: "hover:shadow-[0_16px_40px_-10px_rgba(14,165,233,0.2)] dark:hover:shadow-[0_16px_40px_-10px_rgba(14,165,233,0.25)]",
    bannerGradient: "from-sky-500/15 via-indigo-500/10 to-transparent dark:from-sky-500/25 dark:via-indigo-600/15 dark:to-transparent",
    glowBg: "bg-sky-500/20",
    emblemBg: "bg-sky-50 dark:bg-gradient-to-br dark:from-sky-500/25 dark:via-indigo-500/15 dark:to-[#0e1824]",
    emblemBorder: "border-sky-300/80 dark:border-sky-400/40 group-hover:border-sky-500 shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.25)]",
    emblemText: "text-sky-600 dark:text-sky-400",
    badge: "text-sky-800 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-500/15 dark:border-sky-500/35",
    textHover: "group-hover:text-sky-600 dark:group-hover:text-sky-300",
    linkText: "text-sky-600 group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-300",
    watermark: "text-sky-500/20 dark:text-sky-400/30 group-hover:text-sky-500/35 dark:group-hover:text-sky-400/50",
    ambientLight: "rgba(14, 165, 233, 0.12)",
  };
};

export default function CategoryCard({
  category,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();
  const IconComponent = getCategoryIcon(category.name);
  const theme = getCategoryTheme(category.name);
  const count = category.productCount || 0;
  const bannerImage = category.banner?.url || category.bannerUrl || "";
  const iconImage = category.icon?.url || category.iconUrl || "";

  const handleCardClick = () => {
    navigate(`/admin/products?category=${category.slug || category.name.toLowerCase()}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl border border-slate-200/90 dark:border-white/[0.12] ${theme.borderHover} bg-white dark:bg-[#111319] hover:bg-slate-50/70 dark:hover:bg-[#151821] ${theme.shadowHover} hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full overflow-hidden select-none cursor-pointer shadow-xs hover:shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]`}
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-30 dark:opacity-40 group-hover:opacity-60 dark:group-hover:opacity-75 transition-opacity"
        style={{ background: theme.ambientLight }}
      />

      {/* Top Banner / Visual Showcase */}
      <div className={`relative w-full h-32 sm:h-36 bg-slate-100 dark:bg-[#161922] border-b border-slate-100 dark:border-white/[0.08] overflow-hidden flex items-center justify-center bg-gradient-to-b ${theme.bannerGradient}`}>
        {bannerImage ? (
          <img
            src={bannerImage}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Ambient Radial Spotlight */}
            <div
              className="absolute w-28 h-28 rounded-full blur-2xl opacity-60"
              style={{ background: theme.ambientLight }}
            />
            {/* Holographic Watermark Icon */}
            <IconComponent className={`w-20 h-20 ${theme.watermark} group-hover:scale-110 transition-all duration-500`} />
          </div>
        )}

        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-black/10 dark:from-[#111319] dark:via-transparent dark:to-black/30 pointer-events-none" />

        {/* Floating Category Icon Emblem */}
        <div className={`absolute -bottom-3.5 left-4.5 w-12 h-12 rounded-xl ${theme.emblemBg} ${theme.emblemBorder} border backdrop-blur-md flex items-center justify-center ${theme.emblemText} group-hover:scale-105 transition-all z-10 overflow-hidden shadow-sm`}>
          {iconImage ? (
            <img src={iconImage} alt={category.name} className="w-full h-full object-cover p-1" />
          ) : (
            <IconComponent className="w-6 h-6 stroke-[2.2]" />
          )}
        </div>

        {/* Top-Right Action Toolbar */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 bg-white/90 dark:bg-black/60 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl">
          {/* Edit Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:text-slate-300 dark:hover:text-sky-300 dark:hover:bg-sky-500/20 transition-all cursor-pointer"
            title="Edit Category"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-300 dark:hover:text-rose-400 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
            title="Delete Category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top-Left Active Status Pill */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border flex items-center gap-1.5 shadow-xs ${
              category.isActive !== false
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40"
                : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/40"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                category.isActive !== false ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse" : "bg-slate-400 dark:bg-slate-500"
              }`}
            />
            {category.isActive !== false ? "Active" : "Draft"}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4.5 pt-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Category Slug Pill & Hierarchy */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border tracking-wide truncate ${theme.badge}`}>
              /{category.slug || category.name.toLowerCase()}
            </span>
            {category.parent && (
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate max-w-[120px] bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/5">
                Parent: {category.parent.name || "Main"}
              </span>
            )}
          </div>

          {/* Category Title */}
          <h3 className={`text-base font-heading font-extrabold text-slate-900 dark:text-white ${theme.textHover} transition-colors tracking-tight truncate`}>
            {category.name}
          </h3>

          {/* Category Description */}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {category.description || "Electronics category taxonomy branch with dynamic specifications."}
          </p>
        </div>

        {/* Footer Info & View Products Link */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
          {/* Product Count Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-300 shadow-inner">
            <Package className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="font-bold text-slate-900 dark:text-white font-mono">{count}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">items</span>
          </div>

          {/* Filter Catalog Action CTA */}
          <div className={`inline-flex items-center gap-1 text-xs font-mono font-semibold ${theme.linkText} transition-all`}>
            <span>Filter Catalog</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
