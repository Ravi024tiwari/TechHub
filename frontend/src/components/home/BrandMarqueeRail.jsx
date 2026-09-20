import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useBrandsQuery } from "@/hooks/useProducts";

// Brand Logo Component with Crisp Official Vectors (Optimized for Dark Greyish Titanium Background)
function BrandLogoRenderer({ slug, name, logoUrl }) {
  // Apple
  if (slug === "apple") {
    return (
      <svg className="h-8 w-8 fill-white" viewBox="0 0 170 170">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.86-11.96-14.44-7.23-11.11-12.87-23.77-16.91-37.98-4.04-14.21-6.06-27.18-6.06-38.92 0-16.73 4.67-30.73 14-42 9.33-11.27 20.91-17 34.74-17.18 5.76 0 11.89 1.48 18.39 4.43 6.5 2.96 10.74 4.48 12.74 4.58 1.63-.1 5.92-1.63 12.87-4.58 6.95-2.95 12.81-4.38 17.58-4.3 12.19.66 22.38 5.17 30.56 13.54-10.89 6.64-16.22 15.75-15.98 27.32.24 9.14 3.73 16.89 10.47 23.26 6.74 6.36 14.88 10.02 24.42 10.98-2.61 8.05-5.99 16.48-10.14 25.29zM119.22 31.84c0-7.72 2.76-14.89 8.28-21.52 5.53-6.63 12.29-10.32 20.29-11.08.22 1.09.33 2.07.33 2.94 0 7.72-2.88 15.01-8.64 21.87-5.76 6.85-12.63 10.63-20.61 11.34.11-1.2.35-2.38.35-3.55z" />
      </svg>
    );
  }

  // NVIDIA
  if (slug === "nvidia") {
    return (
      <svg className="h-8 w-8 fill-[#76b900]" viewBox="0 0 24 24">
        <path d="M6.39 8.2c-.3 0-.6.1-.8.4-.2.2-.4.5-.4.8 0 .3.1.6.4.8.2.2.5.4.8.4.3 0 .6-.1.8-.4.2-.2.4-.5.4-.8 0-.3-.1-.6-.4-.8-.2-.3-.5-.4-.8-.4zm10.7 7.2c-1.3 1.1-2.9 1.7-4.7 1.7-1.4 0-2.7-.4-3.8-1.1-.3-.2-.7-.2-.9 0-.3.2-.3.6-.1.9 1.4 1 3 1.5 4.8 1.5 2.2 0 4.1-.7 5.7-2 .3-.2.3-.6.1-.9-.3-.2-.7-.3-1.1-.1zm-1.8-2.5c-.8.6-1.8.9-2.9.9-.9 0-1.7-.2-2.4-.7-.3-.2-.7-.2-.9 0-.3.2-.3.6-.1.9 1 .6 2.2.9 3.4.9 1.5 0 2.8-.4 3.9-1.2.3-.2.3-.6.1-.9-.3-.3-.7-.3-1.1-.1zm6.9-4.8c-.8-2.6-2.5-4.8-4.7-6.2-1.9-1.2-4.2-1.9-6.5-1.9-2.3 0-4.6.7-6.5 1.9C2.4 3.9.7 6.1 0 8.7c-.1.4.1.8.5.9.4.1.8-.1.9-.5.7-2.3 2.2-4.2 4.2-5.4C7.3 2.5 9.4 1.8 11.5 1.8s4.2.7 5.9 1.9c2 1.2 3.5 3.1 4.2 5.4.1.4.5.6.9.5.4-.1.6-.5.5-.9z" />
      </svg>
    );
  }

  // Sony
  if (slug === "sony") {
    return (
      <span className="font-serif font-black text-xl tracking-[0.25em] text-white">
        SONY
      </span>
    );
  }

  // Samsung
  if (slug === "samsung") {
    return (
      <span className="font-heading font-black text-xs sm:text-sm tracking-[0.18em] text-white uppercase border border-white/30 px-2 py-0.5 rounded-full">
        SAMSUNG
      </span>
    );
  }

  // ASUS
  if (slug === "asus") {
    return (
      <span className="font-tech font-extrabold text-base tracking-[0.2em] text-cyan-400">
        ASUS
      </span>
    );
  }

  // Dell
  if (slug === "dell") {
    return (
      <span className="font-heading font-black text-lg tracking-[0.2em] text-blue-400">
        DELL
      </span>
    );
  }

  // Bose
  if (slug === "bose") {
    return (
      <span className="font-serif italic font-extrabold text-lg tracking-[0.2em] text-white">
        BOSE
      </span>
    );
  }

  // Generic Logo or Image Fallback
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="h-full w-full object-contain p-1 rounded-lg"
      />
    );
  }

  return (
    <span className="font-heading font-bold text-sm text-white tracking-wider">
      {name}
    </span>
  );
}

const DEFAULT_BRANDS = [
  { _id: "b1", name: "Apple", slug: "apple", tag: "Official Store" },
  { _id: "b2", name: "NVIDIA", slug: "nvidia", tag: "Founders Edition" },
  { _id: "b3", name: "Sony", slug: "sony", tag: "Hi-Res Audio" },
  { _id: "b4", name: "Samsung", slug: "samsung", tag: "Galaxy Hub" },
  { _id: "b5", name: "ASUS ROG", slug: "asus", tag: "Gaming Rigs" },
  { _id: "b6", name: "Dell", slug: "dell", tag: "Precision Pro" },
  { _id: "b7", name: "Bose", slug: "bose", tag: "Acoustic Gear" },
];

export default function BrandMarqueeRail() {
  const { data: serverBrands = [] } = useBrandsQuery();

  // Combine server brands with our curated brand partners
  const combinedBrands = serverBrands.length > 0 ? serverBrands : DEFAULT_BRANDS;

  // Quadruple array to create a seamless infinite continuous loop
  const marqueeItems = [
    ...combinedBrands,
    ...combinedBrands,
    ...combinedBrands,
    ...combinedBrands,
  ];

  return (
    <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-6 sm:py-10 overflow-hidden text-center">
      
      {/* 1. Radiant Silver Light Beam Header Divider */}
      <div className="relative w-full max-w-4xl mx-auto h-[2px] mb-6 sm:mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent blur-[2px] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_25px_5px_rgba(255,255,255,0.75)]" />
      </div>

      {/* 2. Keynote Title & Subtitle */}
      <div className="max-w-3xl mx-auto space-y-2 mb-6 sm:mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-200 shadow-sm backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          <span>OFFICIAL OEM BRAND PARTNERS</span>
        </div>

        <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
          Shop by Official Brands
        </h2>

        <p className="font-body text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Explore genuine manufacturer stores with official OEM warranty, original sealed accessories, and express air dispatch.
        </p>
      </div>

      {/* 3. Automatic Left-to-Right Continuous Marquee Container */}
      <div className="relative w-full overflow-hidden py-3">
        {/* Soft edge blur vignettes on left and right */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#050608] via-[#050608]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#050608] via-[#050608]/80 to-transparent z-20 pointer-events-none" />

        {/* The Animated Right-to-Left Track (Pauses on Hover) */}
        <div className="animate-marquee-rtl gap-4 sm:gap-6 items-center">
          {marqueeItems.map((brand, idx) => {
            const logoUrl =
              typeof brand.logo === "object" ? brand.logo?.url : brand.logo;

            return (
              <Link
                key={`${brand.slug}-${idx}`}
                to={`/products?brand=${brand.slug}`}
                className="group relative shrink-0 w-52 sm:w-60 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#181e2b] via-[#111520] to-[#0a0d14] border-2 border-slate-700/60 hover:border-slate-300 shadow-[0_6px_25px_rgba(0,0,0,0.8),_0_0_12px_rgba(255,255,255,0.04)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.95),_0_0_25px_rgba(59,130,246,0.35)] hover:-translate-y-1.5 transition-all duration-300 text-center flex flex-col items-center justify-between h-44 cursor-pointer select-none overflow-hidden"
              >
                {/* Specular Silver Top Edge Accent Sheen */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-300/50 to-transparent pointer-events-none" />

                {/* 1. Company Logo Container (Dark Greyish Titanium Inset Tile) */}
                <div className="h-16 w-full rounded-xl bg-black/60 border border-white/10 flex items-center justify-center p-2 shadow-inner group-hover:scale-103 group-hover:border-white/30 group-hover:bg-black/80 transition-all">
                  <BrandLogoRenderer
                    slug={brand.slug}
                    name={brand.name}
                    logoUrl={logoUrl}
                  />
                </div>

                {/* 2. Brand Name (Crisp Brilliant Pure White Typography) */}
                <div className="w-full text-center">
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors truncate drop-shadow-md">
                    {brand.name}
                  </h3>
                </div>

                {/* 3. Interactive Electric Blue Explore Button (As per reference) */}
                <div className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_22px_rgba(37,99,235,0.65)] hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Explore Products</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
