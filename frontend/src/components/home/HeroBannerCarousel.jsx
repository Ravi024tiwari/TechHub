import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  Flame,
  Award,
} from "lucide-react";

const BANNERS = [
  {
    id: 1,
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
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1800&q=85",
    accent: "from-blue-600/35 via-cyan-500/15 to-transparent",
    glowColor: "rgba(59, 130, 246, 0.2)",
    tabLabel: "MacBook M3 Max",
    specs: ["Apple M3 Max", "36GB Unified RAM", "1TB Superfast SSD", "Liquid Retina XDR"],
  },
  {
    id: 2,
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
    image:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1800&q=85",
    accent: "from-emerald-600/35 via-teal-500/15 to-transparent",
    glowColor: "rgba(16, 185, 129, 0.2)",
    tabLabel: "RTX 4090 Monster",
    specs: ["24GB GDDR6X", "DLSS 3.5 AI", "384-Bit Memory Bus", "Ada Lovelace"],
  },
  {
    id: 3,
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
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1800&q=85",
    accent: "from-purple-600/35 via-indigo-500/15 to-transparent",
    glowColor: "rgba(168, 85, 247, 0.2)",
    tabLabel: "Sony XM5 Hi-Res",
    specs: ["Dual NC Processor", "LDAC Hi-Res Audio", "30H Battery Life", "Multipoint Connect"],
  },
  {
    id: 4,
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
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1800&q=85",
    accent: "from-amber-600/35 via-orange-500/15 to-transparent",
    glowColor: "rgba(245, 158, 11, 0.2)",
    tabLabel: "Odyssey OLED G9",
    specs: ["49” 32:9 Dual QHD", "240Hz • 0.03ms", "Quantum Dot OLED", "DisplayHDR True Black"],
  },
  {
    id: 5,
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
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1800&q=85",
    accent: "from-rose-600/35 via-red-500/15 to-transparent",
    glowColor: "rgba(244, 63, 94, 0.2)",
    tabLabel: "iPhone 16 Pro Max",
    specs: ["A18 Pro 3nm Chip", "Grade 5 Titanium", "48MP Fusion Camera", "Super Retina XDR"],
  },
];

const AUTO_SLIDE_DURATION = 5500; // 5.5 seconds per slide

export default function HeroBannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  // Touch Swipe coordinates
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

  // Mobile Swipe Handlers
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
      // Swiped Left -> Next Slide
      handleNext();
    } else if (diff < -50) {
      // Swiped Right -> Previous Slide
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
      className="relative w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-2 sm:py-3 transition-all"
    >
      {/* Outer Banner Frame with Brushed Silver 2px Border */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl border-2 border-slate-400/35 hover:border-slate-300/60 overflow-hidden bg-[#07090e] shadow-[0_12px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(255,255,255,0.06)] min-h-[460px] sm:min-h-[500px] lg:min-h-[560px] flex items-center transition-all duration-300 group">
        
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

              {/* Background Product Image with Cinematic Layered Vignette */}
              <div className="absolute inset-0 z-0">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className={`w-full h-full object-cover object-center sm:object-right transition-transform duration-1000 ease-out ${
                    isActive ? "scale-100 opacity-35 sm:opacity-55" : "scale-105 opacity-0"
                  }`}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {/* Horizontal Gradient Vignette (Keeps text ultra crisp on left) */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#06080d] via-[#06080d]/85 sm:via-[#06080d]/70 to-transparent" />
                {/* Vertical Gradient Vignette (Blends into bottom tabs seamlessly) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-transparent to-black/20" />
              </div>

              {/* Banner Left Content Column */}
              <div className="relative z-10 w-full max-w-3xl p-5 sm:p-8 md:p-12 lg:p-16 text-left space-y-3.5 sm:space-y-4">
                {/* Top Keynote Badge & Savings Pill */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/20 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-200 backdrop-blur-md shadow-sm">
                    <Sparkles className="h-3 w-3 text-cyan-300 animate-pulse" />
                    <span>{banner.badge}</span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-mono font-bold">
                    <Flame className="h-3 w-3 fill-emerald-300" />
                    <span>{banner.discountBadge}</span>
                  </div>
                </div>

                {/* Banner Heading */}
                <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-md">
                  {banner.title}
                </h1>

                {/* Tagline / Specs Overview */}
                <p className="font-body text-xs sm:text-sm md:text-base text-slate-300 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed">
                  {banner.tagline}
                </p>

                {/* Hardware Spec Chips (Desktop / Tablet) */}
                <div className="hidden sm:flex flex-wrap gap-2 pt-1">
                  {banner.specs.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-300 font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Price Display */}
                <div className="flex flex-wrap items-baseline gap-2.5 pt-1">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
                    {banner.priceHighlight}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 line-through font-mono">
                    {banner.regularPrice}
                  </span>
                  <span className="text-[11px] text-slate-400 font-tech hidden md:inline-block">
                    • {banner.secondaryPerk}
                  </span>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3">
                  <Link
                    to={banner.link}
                    className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-slate-200 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{banner.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to={banner.link}
                    className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-white font-semibold text-xs sm:text-sm transition-all"
                  >
                    <span>{banner.secondaryCta}</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* =========================================================
            CHEVRON NAVIGATION CONTROLS (Left & Right)
            ========================================================= */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-4 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 hover:scale-105 shadow-xl cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-4 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 hover:scale-105 shadow-xl cursor-pointer"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* =========================================================
            BOTTOM AMAZON-STYLE INTERACTIVE TABS & PROGRESS BAR
            ========================================================= */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20 px-4 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Interactive Tab Strip (Desktop & Tablet) */}
            <div className="hidden md:flex flex-1 items-center gap-2 lg:gap-3 bg-[#080b12]/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 max-w-4xl mx-auto shadow-xl">
              {BANNERS.map((banner, index) => {
                const isActive = index === currentSlide;
                return (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => handleSelectSlide(index)}
                    className={`flex-1 relative py-2 px-3 rounded-xl text-xs font-semibold transition-all text-left overflow-hidden cursor-pointer ${
                      isActive
                        ? "text-white bg-white/[0.08] shadow-inner"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="block truncate font-mono text-[11px]">
                      {banner.tabLabel}
                    </span>

                    {/* Active Timer Progress Bar */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 overflow-hidden rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 via-white to-slate-200 transition-all ease-linear"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile / Tablet Compact Dot Indicators */}
            <div className="flex md:hidden items-center justify-center gap-2 mx-auto bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {BANNERS.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-7 bg-white"
                      : "w-2 bg-white/30 hover:bg-white/60"
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
              className="hidden lg:flex items-center justify-center size-8 rounded-full bg-black/40 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white backdrop-blur-md transition-all shrink-0 cursor-pointer"
            >
              {isPaused ? <Play className="size-3.5 fill-current" /> : <Pause className="size-3.5 fill-current" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
