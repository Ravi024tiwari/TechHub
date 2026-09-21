import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit3,
  Trash2,
  ExternalLink,
  Globe,
  Package,
  Star,
  Sparkles,
  ShieldCheck
} from "lucide-react";

// Curated Dynamic Brand Design Systems
const BRAND_PALETTES = [
  {
    key: "violet",
    accent: "violet",
    borderHover: "group-hover:border-violet-400/60",
    shadowHover: "group-hover:shadow-[0_20px_45px_-10px_rgba(168,85,247,0.3)]",
    bannerGradient: "from-violet-600/35 via-purple-700/20 to-transparent",
    ambientLight: "rgba(168, 85, 247, 0.22)",
    emblemBg: "bg-gradient-to-br from-violet-500/30 via-purple-600/20 to-[#181226]",
    emblemBorder: "border-violet-400/50 group-hover:border-violet-400/80 shadow-[0_0_20px_rgba(168,85,247,0.35)]",
    emblemText: "text-violet-300",
    badge: "text-violet-300 bg-violet-500/20 border-violet-400/40",
    textHover: "group-hover:text-violet-300",
    linkText: "text-violet-400 group-hover:text-violet-300",
    watermark: "text-violet-400/25 group-hover:text-violet-400/45",
    specialty: "Flagship Silicon & Personal Compute",
  },
  {
    key: "blue",
    accent: "blue",
    borderHover: "group-hover:border-blue-400/60",
    shadowHover: "group-hover:shadow-[0_20px_45px_-10px_rgba(59,130,246,0.3)]",
    bannerGradient: "from-blue-600/35 via-indigo-700/20 to-transparent",
    ambientLight: "rgba(59, 130, 246, 0.22)",
    emblemBg: "bg-gradient-to-br from-blue-500/30 via-indigo-600/20 to-[#0e1628]",
    emblemBorder: "border-blue-400/50 group-hover:border-blue-400/80 shadow-[0_0_20px_rgba(59,130,246,0.35)]",
    emblemText: "text-blue-300",
    badge: "text-blue-300 bg-blue-500/20 border-blue-400/40",
    textHover: "group-hover:text-blue-300",
    linkText: "text-blue-400 group-hover:text-blue-300",
    watermark: "text-blue-400/25 group-hover:text-blue-400/45",
    specialty: "AMOLED Displays & Mobile Ecosystem",
  },
  {
    key: "amber",
    accent: "amber",
    borderHover: "group-hover:border-amber-400/60",
    shadowHover: "group-hover:shadow-[0_20px_45px_-10px_rgba(245,158,11,0.3)]",
    bannerGradient: "from-amber-600/35 via-orange-700/20 to-transparent",
    ambientLight: "rgba(245, 158, 11, 0.22)",
    emblemBg: "bg-gradient-to-br from-amber-500/30 via-orange-600/20 to-[#22180e]",
    emblemBorder: "border-amber-400/50 group-hover:border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.35)]",
    emblemText: "text-amber-300",
    badge: "text-amber-300 bg-amber-500/20 border-amber-400/40",
    textHover: "group-hover:text-amber-300",
    linkText: "text-amber-400 group-hover:text-amber-300",
    watermark: "text-amber-400/25 group-hover:text-amber-400/45",
    specialty: "Master Acoustics & Cinema Imaging",
  },
  {
    key: "rose",
    accent: "rose",
    borderHover: "group-hover:border-rose-400/60",
    shadowHover: "group-hover:shadow-[0_20px_45px_-10px_rgba(244,63,94,0.3)]",
    bannerGradient: "from-rose-600/40 via-red-700/20 to-transparent",
    ambientLight: "rgba(244, 63, 94, 0.22)",
    emblemBg: "bg-gradient-to-br from-rose-500/30 via-red-600/20 to-[#241014]",
    emblemBorder: "border-rose-400/50 group-hover:border-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.35)]",
    emblemText: "text-rose-300",
    badge: "text-rose-300 bg-rose-500/20 border-rose-400/40",
    textHover: "group-hover:text-rose-300",
    linkText: "text-rose-400 group-hover:text-rose-300",
    watermark: "text-rose-400/25 group-hover:text-rose-400/45",
    specialty: "ROG Esports & High-Performance Hardware",
  },
  {
    key: "cyan",
    accent: "cyan",
    borderHover: "group-hover:border-cyan-400/60",
    shadowHover: "group-hover:shadow-[0_20px_45px_-10px_rgba(6,182,212,0.3)]",
    bannerGradient: "from-cyan-600/35 via-sky-700/20 to-transparent",
    ambientLight: "rgba(6, 182, 212, 0.22)",
    emblemBg: "bg-gradient-to-br from-cyan-500/30 via-sky-600/20 to-[#0e1a24]",
    emblemBorder: "border-cyan-400/50 group-hover:border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.35)]",
    emblemText: "text-cyan-300",
    badge: "text-cyan-300 bg-cyan-500/20 border-cyan-400/40",
    textHover: "group-hover:text-cyan-300",
    linkText: "text-cyan-400 group-hover:text-cyan-300",
    watermark: "text-cyan-400/25 group-hover:text-cyan-400/45",
    specialty: "UltraSharp Displays & Workstation Compute",
  },
  {
    key: "emerald",
    accent: "emerald",
    borderHover: "group-hover:border-emerald-400/60",
    shadowHover: "group-hover:shadow-[0_20px_45px_-10px_rgba(16,185,129,0.3)]",
    bannerGradient: "from-emerald-600/35 via-teal-700/20 to-transparent",
    ambientLight: "rgba(16, 185, 129, 0.22)",
    emblemBg: "bg-gradient-to-br from-emerald-500/30 via-teal-600/20 to-[#0d1c16]",
    emblemBorder: "border-emerald-400/50 group-hover:border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.35)]",
    emblemText: "text-emerald-300",
    badge: "text-emerald-300 bg-emerald-500/20 border-emerald-400/40",
    textHover: "group-hover:text-emerald-300",
    linkText: "text-emerald-400 group-hover:text-emerald-300",
    watermark: "text-emerald-400/25 group-hover:text-emerald-400/45",
    specialty: "Esports Mechanical Gear & Precision Optics",
  },
  {
    key: "orange",
    accent: "orange",
    borderHover: "group-hover:border-orange-400/60",
    shadowHover: "group-hover:shadow-[0_20px_45px_-10px_rgba(249,115,22,0.3)]",
    bannerGradient: "from-orange-600/35 via-amber-700/20 to-transparent",
    ambientLight: "rgba(249, 115, 22, 0.22)",
    emblemBg: "bg-gradient-to-br from-orange-500/30 via-amber-600/20 to-[#22150d]",
    emblemBorder: "border-orange-400/50 group-hover:border-orange-400/80 shadow-[0_0_20px_rgba(249,115,22,0.35)]",
    emblemText: "text-orange-300",
    badge: "text-orange-300 bg-orange-500/20 border-orange-400/40",
    textHover: "group-hover:text-orange-300",
    linkText: "text-orange-400 group-hover:text-orange-300",
    watermark: "text-orange-400/25 group-hover:text-orange-400/45",
    specialty: "Acoustic Engineering & Active Noise Cancelling",
  },
];

// Helper: Match known brand signature or calculate deterministic hash palette
const getBrandTheme = (name = "") => {
  const n = name.toLowerCase().trim();
  if (n.includes("apple") || n.includes("google") || n.includes("beats")) return BRAND_PALETTES[0]; // violet
  if (n.includes("samsung") || n.includes("intel") || n.includes("hp")) return BRAND_PALETTES[1]; // blue
  if (n.includes("sony") || n.includes("nikon") || n.includes("canon")) return BRAND_PALETTES[2]; // amber
  if (n.includes("asus") || n.includes("rog") || n.includes("oneplus") || n.includes("lenovo")) return BRAND_PALETTES[3]; // rose
  if (n.includes("dell") || n.includes("alienware") || n.includes("xiaomi") || n.includes("nothing")) return BRAND_PALETTES[4]; // cyan
  if (n.includes("logitech") || n.includes("razer") || n.includes("acer")) return BRAND_PALETTES[5]; // emerald
  if (n.includes("bose") || n.includes("jbl") || n.includes("marshall") || n.includes("sennheiser")) return BRAND_PALETTES[6]; // orange

  let hash = 0;
  for (let i = 0; i < n.length; i++) {
    hash = (hash << 5) - hash + n.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % BRAND_PALETTES.length;
  return BRAND_PALETTES[index];
};

export default function BrandCard({
  brand,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();
  const theme = getBrandTheme(brand.name);
  const count = brand.productCount || 0;
  const logoImage = brand.logo?.url || brand.logoUrl || "";
  const bannerImage = brand.banner?.url || brand.bannerUrl || "";

  const handleCardClick = () => {
    navigate(`/admin/products?brand=${encodeURIComponent(brand.name)}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl border border-white/[0.12] ${theme.borderHover} bg-[#12141c] hover:bg-[#161a26] shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${theme.shadowHover} hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full overflow-hidden select-none cursor-pointer`}
    >
      {/* Ambient Lighting Spotlight */}
      <div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity"
        style={{ background: theme.ambientLight }}
      />

      {/* Top Banner / Showcase Stage */}
      <div className={`relative w-full h-34 sm:h-38 bg-[#161822] border-b border-white/[0.08] overflow-hidden flex items-center justify-center bg-gradient-to-b ${theme.bannerGradient}`}>
        {bannerImage ? (
          <img
            src={bannerImage}
            alt={brand.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        ) : logoImage ? (
          /* Atmospheric photo backdrop with gradient vignette when no explicit banner is provided */
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            <img
              src={logoImage}
              alt={brand.name}
              className="w-full h-full object-cover filter blur-[2px] opacity-25 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700 ease-out"
            />
            {/* Ambient Radial Spotlight */}
            <div
              className="absolute w-32 h-32 rounded-full blur-2xl opacity-70"
              style={{ background: theme.ambientLight }}
            />
            {/* Stylized Brand Typographic Watermark */}
            <span className={`absolute font-heading font-black text-2xl sm:text-3xl tracking-widest uppercase select-none ${theme.watermark} group-hover:scale-105 transition-transform duration-500`}>
              {brand.name}
            </span>
          </div>
        ) : (
          /* High-Tech Monogram Watermark */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <div
              className="absolute w-32 h-32 rounded-full blur-2xl opacity-70"
              style={{ background: theme.ambientLight }}
            />
            <span className={`font-heading font-black text-3xl tracking-widest uppercase select-none ${theme.watermark} group-hover:scale-110 transition-transform duration-500`}>
              {brand.name}
            </span>
          </div>
        )}

        {/* Deep Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-black/20 to-black/40 pointer-events-none" />

        {/* Floating Brand Logo Pedestal */}
        <div className={`absolute -bottom-3.5 left-4.5 w-13 h-13 rounded-2xl ${theme.emblemBg} ${theme.emblemBorder} border backdrop-blur-xl flex items-center justify-center ${theme.emblemText} group-hover:scale-105 transition-all z-10 overflow-hidden p-2`}>
          {logoImage ? (
            <img src={logoImage} alt={brand.name} className="w-full h-full object-contain filter drop-shadow-md" />
          ) : (
            <span className="font-heading font-black text-lg text-white tracking-wider">
              {brand.name?.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Top-Right Action Toolbar */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-xl">
          {/* External Website */}
          {brand.website && (
            <a
              href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition-all"
              title="Visit Official Manufacturer Website"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Edit */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(brand);
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-sky-300 hover:bg-sky-500/20 transition-all"
            title="Edit Brand"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(brand);
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
            title="Delete Brand"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top-Left Badges: Featured & Active */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {brand.isFeatured && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              Featured
            </span>
          )}

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border flex items-center gap-1.5 shadow-sm ${
              brand.isActive !== false
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-500/20 text-slate-400 border-slate-500/40"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                brand.isActive !== false ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            {brand.isActive !== false ? "Active" : "Draft"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4.5 pt-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Slug & Clean Domain Badge */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border tracking-wide truncate ${theme.badge}`}>
              /{brand.slug || brand.name.toLowerCase()}
            </span>
            {brand.website ? (
              <span className="text-[10px] font-mono text-slate-300 truncate max-w-[130px] bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/10">
                {brand.website.replace(/^https?:\/\/(www\.)?/, "")}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-slate-500" />
                Verified OEM
              </span>
            )}
          </div>

          {/* Brand Name */}
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-base font-heading font-extrabold text-white ${theme.textHover} transition-colors tracking-tight truncate`}>
              {brand.name}
            </h3>
            {brand.isFeatured && (
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
          </div>

          {/* Brand Description / Specialty Tagline */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {brand.description || theme.specialty || "Official electronics hardware manufacturer and partner ecosystem."}
          </p>
        </div>

        {/* Footer Info & View Products Link */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-mono text-slate-300 shadow-inner">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-white font-mono">{count}</span>
            <span className="text-[10px] text-slate-400">items</span>
          </div>

          <div className={`inline-flex items-center gap-1 text-xs font-mono font-semibold ${theme.linkText} transition-all`}>
            <span>Filter Catalog</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
