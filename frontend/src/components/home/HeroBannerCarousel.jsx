import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  Flame,
} from "lucide-react";

const BANNERS = [
  {
    id: 1,
    badge: "A18 PRO TITANIUM INNOVATION",
    title: "Apple iPhone 16 Pro Max Titanium",
    tagline:
      "Grade 5 Titanium Construction with Ceramic Shield. Pro Camera System with 48MP Fusion, 5x Telephoto & 4K 120fps Dolby Vision HDR.",
    priceHighlight: "From ₹1,44,900",
    regularPrice: "₹1,59,900",
    discountBadge: "Instant ₹15,000 Off",
    secondaryPerk: "Available in Natural, Desert & Black Titanium • Instant Bank Cashback",
    ctaText: "Order iPhone 16 Pro",
    secondaryCta: "Trade-in Options",
    link: "/product/apple-iphone-16-pro-max-1tb-titanium",
    image: "/banners/hero_iphone16pro_titanium.jpg",
    accent: "from-rose-600/30 via-amber-500/15 to-transparent",
    glowColor: "rgba(244, 63, 94, 0.2)",
    tabLabel: "iPhone 16 Pro Max",
    specs: ["A18 Pro 3nm Chip", "Grade 5 Titanium", "48MP Fusion Camera", "Super Retina XDR"],
  },
  {
    id: 2,
    badge: "KEYNOTE FLAGSHIP 2026",
    title: "Apple MacBook Pro 16” M3 Max",
    tagline:
      "Scary Fast 16-Core CPU & 40-Core GPU. Up to 128GB Unified Memory with 22-Hour Battery Life & Liquid Retina XDR display.",
    priceHighlight: "Starting at ₹2,49,900",
    regularPrice: "₹2,89,900",
    discountBadge: "Save ₹40,000",
    secondaryPerk: "0% No-Cost EMI from ₹10,412/mo • 1-Day Insured Air Dispatch",
    ctaText: "Configure & Order M3 Max",
    secondaryCta: "Explore Tech Specs",
    link: "/product/apple-macbook-pro-16-m3-max-36gb-1tb-ssd",
    image: "/banners/hero_macbook_m3max.jpg",
    accent: "from-blue-600/30 via-cyan-500/15 to-transparent",
    glowColor: "rgba(59, 130, 246, 0.2)",
    tabLabel: "MacBook M3 Max",
    specs: ["Apple M3 Max", "36GB Unified RAM", "1TB Superfast SSD", "Liquid Retina XDR"],
  },
  {
    id: 3,
    badge: "ULTIMATE GAMING ARCHITECTURE",
    title: "GeForce RTX 4090 24GB OC",
    tagline:
      "The Ultimate Ada Lovelace GPU. Full Ray Tracing Powered by DLSS 3.5, 16,384 CUDA Cores & Next-Gen 4K 240Hz Pure Performance.",
    priceHighlight: "Special Deal ₹1,74,999",
    regularPrice: "₹1,99,990",
    discountBadge: "Save ₹24,991",
    secondaryPerk: "Official 3-Year Brand Warranty • Factory Overclocked Edition",
    ctaText: "Get RTX 4090 Monster",
    secondaryCta: "Benchmark Rigs",
    link: "/product/nvidia-geforce-rtx-4090-24gb-oc",
    image: "/banners/hero_rtx4090_monster.jpg",
    accent: "from-emerald-600/30 via-teal-500/15 to-transparent",
    glowColor: "rgba(168, 185, 129, 0.2)",
    tabLabel: "RTX 4090 Monster",
    specs: ["24GB GDDR6X", "DLSS 3.5 AI", "384-Bit Memory Bus", "Ada Lovelace"],
  },
  {
    id: 4,
    badge: "AUDIOPHILE ACOUSTIC ENGINEERING",
    title: "Sony WH-1000XM5 Studio Wireless",
    tagline:
      "Industry-Leading Dual Noise Cancellation Processor with 8 Microphones, Auto NC Optimizer, and LDAC Hi-Res Certified Sound.",
    priceHighlight: "Festive Offer ₹26,990",
    regularPrice: "₹34,990",
    discountBadge: "23% OFF",
    secondaryPerk: "Premium Carrying Case Included • 30-Hour Fast Charge Battery",
    ctaText: "Experience Pure Sound",
    secondaryCta: "Compare Studio Gear",
    link: "/product/sony-wh-1000xm5-wireless-anc",
    image: "/banners/hero_sony_headphones.jpg",
    accent: "from-purple-600/30 via-indigo-500/15 to-transparent",
    glowColor: "rgba(168, 85, 247, 0.2)",
    tabLabel: "Sony XM5 Hi-Res",
    specs: ["Dual NC Processor", "LDAC Hi-Res Audio", "30H Battery Life", "Multipoint Connect"],
  },
  {
    id: 5,
    badge: "NEXT-GEN 240Hz CURVED MONITOR",
    title: "Samsung Odyssey OLED G9 49”",
    tagline:
      "0.03ms Ultra-Fast Response Time with 240Hz Refresh Rate. Dual QHD 32:9 Quantum Dot Curved Display with Neo Quantum Processor Pro.",
    priceHighlight: "Festive Deal ₹1,34,999",
    regularPrice: "₹1,69,999",
    discountBadge: "Save ₹35,000",
    secondaryPerk: "Zero-Dead-Pixel Warranty • Free Ergonomic Desk Arm Included",
    ctaText: "Upgrade Battlestation",
    secondaryCta: "View OLED Specs",
    link: "/product/samsung-odyssey-oled-g9-49-curved",
    image: "/banners/hero_samsung_oledg9.jpg",
    accent: "from-amber-600/30 via-orange-500/15 to-transparent",
    glowColor: "rgba(245, 158, 11, 0.2)",
    tabLabel: "Odyssey OLED G9",
    specs: ["49” 32:9 Dual QHD", "240Hz • 0.03ms", "Quantum Dot OLED", "DisplayHDR True Black"],
  },
];

const AUTO_SLIDE_DURATION = 5500; // 5.5 seconds per slide

export default function HeroBannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  // Touch coordinates for mobile swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-progress bar and slide transition
  useEffect(() => {
    if (isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const intervalStep = 50; // update every 50ms
    const totalSteps = AUTO_SLIDE_DURATION / intervalStep;
    let stepCount = 0;

    setProgress(0);

    progressIntervalRef.current = setInterval(() => {
      stepCount += 1;
      const currentPct = Math.min(100, (stepCount / totalSteps) * 100);
      setProgress(currentPct);

      if (stepCount >= totalSteps) {
        clearInterval(progressIntervalRef.current);
        setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
        setProgress(0);
      }
    }, intervalStep);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentSlide, isPaused]);

  const handlePrev = () => {
    setProgress(0);
    setCurrentSlide((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setProgress(0);
    setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
  };

  const handleSelectSlide = (index) => {
    setProgress(0);
    setCurrentSlide(index);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <section
      aria-label="Flagship Deals and Keynote Hardware"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-2 sm:py-3"
    >
      {/* Outer Banner Frame with Adaptive Titanium Bevel */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl border border-slate-300/80 dark:border-slate-800 bg-[#07090e] shadow-[0_12px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_60px_rgba(0,0,0,0.95)] overflow-hidden min-h-[460px] sm:min-h-[500px] lg:min-h-[560px] flex items-center transition-all duration-300 group">
        
        {/* =========================================================
            SLIDES CAROUSEL
            ========================================================= */}
        {BANNERS.map((banner, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Dynamic Hardware Color Accent Glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${banner.accent} pointer-events-none`}
              />

              {/* Background Product Image with Studio Lighting */}
              <div className="absolute inset-0 z-0">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className={`w-full h-full object-cover object-center sm:object-right transition-transform duration-1000 ease-out ${
                    isActive ? "scale-100 opacity-90 sm:opacity-100" : "scale-105 opacity-0"
                  }`}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                
                {/* Precision Left Vignette: Protects typography legibility while keeping the product brilliant on the right */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#06080d] via-[#06080d]/85 sm:via-[#06080d]/65 sm:to-transparent to-[#06080d]/60 pointer-events-none" />
                
                {/* Bottom Vignette for seamless bottom tabs blending */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#06080d] via-[#06080d]/70 to-transparent pointer-events-none" />
              </div>

              {/* Banner Left Content Column - PURE WHITE TYPOGRAPHY */}
              <div className="relative z-10 w-full max-w-2xl sm:max-w-3xl p-4 sm:p-8 md:p-12 lg:p-16 text-left space-y-2.5 sm:space-y-4">
                
                {/* Top Keynote Badge & Savings Pill */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/60 border border-white/30 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-white backdrop-blur-md shadow-xs">
                    <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                    <span className="text-white drop-shadow-sm">{banner.badge}</span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/50 text-white text-[10px] sm:text-xs font-mono font-bold shadow-xs">
                    <Flame className="h-3 w-3 fill-emerald-300 text-emerald-300" />
                    <span className="text-white drop-shadow-sm">{banner.discountBadge}</span>
                  </div>
                </div>

                {/* Banner Heading - Crisp Brilliant Pure White Always */}
                <h1
                  style={{ color: "#ffffff" }}
                  className="font-heading text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold !text-white tracking-tight leading-[1.15] drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)]"
                >
                  {banner.title}
                </h1>

                {/* Tagline / Specs Overview - Pure White High Contrast */}
                <p
                  style={{ color: "#ffffff" }}
                  className="font-body text-xs sm:text-sm md:text-base !text-white font-medium line-clamp-2 sm:line-clamp-3 max-w-xl leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                >
                  {banner.tagline}
                </p>

                {/* Hardware Spec Chips - Compact and Responsive */}
                <div className="hidden xs:flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
                  {banner.specs.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      style={{ color: "#ffffff" }}
                      className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-black/60 border border-white/25 text-[10px] sm:text-[11px] font-mono !text-white font-semibold backdrop-blur-md shadow-xs drop-shadow-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Price Display - Pure White Typography */}
                <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
                  <span
                    style={{ color: "#ffffff" }}
                    className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-extrabold !text-white font-mono tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]"
                  >
                    {banner.priceHighlight}
                  </span>
                  <span className="text-xs sm:text-sm text-white/85 line-through font-mono drop-shadow-sm">
                    {banner.regularPrice}
                  </span>
                  <span className="text-[11px] text-white font-medium font-tech hidden md:inline-block drop-shadow-sm">
                    • {banner.secondaryPerk}
                  </span>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-1.5 sm:pt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <Link
                    to={banner.link}
                    className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-6 sm:py-3.5 rounded-xl bg-white text-slate-950 font-extrabold text-xs sm:text-sm hover:bg-slate-100 shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{banner.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Link>

                  <Link
                    to={banner.link}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/35 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all shadow-xs"
                  >
                    <span>{banner.secondaryCta}</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* =========================================================
            CHEVRON CONTROLS (Desktop & Tablet only - Mobile uses touch swipe)
            ========================================================= */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="hidden md:flex absolute left-3 lg:left-4 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/30 text-white items-center justify-center backdrop-blur-md transition-all active:scale-90 hover:scale-105 shadow-xl cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="hidden md:flex absolute right-3 lg:right-4 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/30 text-white items-center justify-center backdrop-blur-md transition-all active:scale-90 hover:scale-105 shadow-xl cursor-pointer"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* =========================================================
            BOTTOM INTERACTIVE TABS & PROGRESS BAR
            ========================================================= */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20 px-4 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Interactive Tab Strip (Desktop & Tablet) - Pure White Text */}
            <div className="hidden md:flex flex-1 items-center gap-2 lg:gap-3 bg-[#080b12]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 max-w-4xl mx-auto shadow-2xl">
              {BANNERS.map((banner, index) => {
                const isActive = index === currentSlide;
                return (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => handleSelectSlide(index)}
                    className={`flex-1 relative py-2 px-3 rounded-xl text-xs transition-all text-left overflow-hidden cursor-pointer ${
                      isActive
                        ? "text-white bg-white/20 shadow-inner font-extrabold"
                        : "text-white/85 hover:text-white hover:bg-white/10 font-medium"
                    }`}
                  >
                    <span className="block truncate font-mono text-[11px] text-white drop-shadow-xs">
                      {banner.tabLabel}
                    </span>

                    {/* Active Timer Progress Bar */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/25 overflow-hidden rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 via-amber-300 to-white transition-all ease-linear"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Compact Dot Indicators */}
            <div className="flex md:hidden items-center justify-center gap-2 mx-auto bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg">
              {BANNERS.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-7 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>

            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Play Auto Carousel" : "Pause Auto Carousel"}
              aria-label={isPaused ? "Play Carousel" : "Pause Carousel"}
              className="hidden lg:flex items-center justify-center size-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/30 text-white backdrop-blur-md transition-all shrink-0 cursor-pointer shadow-md"
            >
              {isPaused ? <Play className="size-3.5 fill-current text-white" /> : <Pause className="size-3.5 fill-current text-white" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
