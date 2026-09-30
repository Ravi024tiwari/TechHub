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
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const isHorizontalSwipe = useRef(null);

  // Auto slide transition (fires once per slide duration, ZERO unnecessary re-renders)
  useEffect(() => {
    if (isPaused || isDragging) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, AUTO_SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [currentSlide, isPaused, isDragging]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
  };

  const handleSelectSlide = (index) => {
    setCurrentSlide(index);
  };

  // Fluid touch swipe & drag handling with real-time translation and snap
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Detect gesture axis on early touch movement (prevent blocking vertical page scrolling)
    if (isHorizontalSwipe.current === null && (Math.abs(diffX) > 7 || Math.abs(diffY) > 7)) {
      isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
    }

    if (isHorizontalSwipe.current) {
      touchDeltaX.current = diffX;
      // Damped overscroll at carousel edges
      let offset = diffX;
      if (
        (currentSlide === 0 && diffX > 0) ||
        (currentSlide === BANNERS.length - 1 && diffX < 0)
      ) {
        offset = diffX * 0.3;
      }
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current && Math.abs(touchDeltaX.current) > 35) {
      if (touchDeltaX.current < -35) {
        // Swiped left -> advance to next slide
        handleNext();
      } else if (touchDeltaX.current > 35) {
        // Swiped right -> return to previous slide
        handlePrev();
      }
    }
    setDragOffset(0);
    setIsDragging(false);
    setIsPaused(false);
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchDeltaX.current = 0;
    isHorizontalSwipe.current = null;
  };

  return (
    <section
      aria-label="Flagship Deals and Keynote Hardware"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full px-2.5 xs:px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-2 sm:py-3 select-none"
    >
      {/* Outer Banner Frame with Crisp Grey Border in Light Mode & Slate in Dark Mode */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl border-2 border-slate-300 dark:border-slate-800 bg-white dark:bg-[#07090e] shadow-[0_12px_44px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.95)] overflow-hidden min-h-[550px] xs:min-h-[530px] sm:min-h-[510px] md:min-h-[520px] lg:min-h-[560px] flex items-center transition-all duration-300 group">
        
        {/* =========================================================
            HORIZONTAL SLIDING TRACK: Fluid left-to-right swipe & slide
            ========================================================= */}
        <div
          className="w-full flex h-full will-change-transform"
          style={{
            transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 500ms cubic-bezier(0.2, 1, 0.3, 1)",
            touchAction: "pan-y",
          }}
        >
          {BANNERS.map((banner, index) => {
            return (
              <div
                key={banner.id}
                className="w-full shrink-0 min-w-full relative flex flex-col md:flex-row md:items-center min-h-[550px] xs:min-h-[530px] sm:min-h-[510px] md:min-h-[520px] lg:min-h-[560px] p-3 xs:p-4 sm:p-5 md:p-8 lg:p-10 gap-3 sm:gap-4 md:gap-8"
              >
                {/* =========================================================
                    PRODUCT HARDWARE SHOWCASE: Framed Studio Stage with Dynamic Glow & Zoom
                    ========================================================= */}
                <div className="order-1 md:order-2 relative w-full md:w-[50%] lg:w-[52%] h-56 xs:h-64 sm:h-72 md:h-[380px] lg:h-[440px] shrink-0">
                  <div className="relative w-full h-full rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-white/10 overflow-hidden bg-gradient-to-b from-[#141824] via-[#0c0e15] to-[#06080c] shadow-md dark:shadow-2xl flex items-center justify-center group/showcase">
                    
                    {/* Dynamic Hardware Color Accent Glow */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-40 group-hover/showcase:opacity-65 transition-opacity duration-700 blur-2xl"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${banner.glowColor}, transparent 65%)`,
                      }}
                    />
                    <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/70 pointer-events-none" />

                    {/* Floating Showcase Badges (Top Left & Top Right with safe insets) */}
                    <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 text-white/95 border border-white/20 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold tracking-wider backdrop-blur-md shadow-xs truncate max-w-[62%]">
                        <Sparkles className="h-3 w-3 text-amber-400 shrink-0 animate-pulse" />
                        <span className="truncate">{banner.badge}</span>
                      </div>

                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold shadow-xs shrink-0 backdrop-blur-md">
                        <Flame className="h-3 w-3 fill-emerald-400 text-emerald-400 shrink-0" />
                        <span>{banner.discountBadge}</span>
                      </div>
                    </div>

                    {/* Interactive Studio Badge (Bottom Right) */}
                    <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-[9px] font-mono text-white/70 flex items-center gap-1 pointer-events-none">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="hidden xs:inline">Interactive Studio</span>
                      <span className="xs:hidden">Studio 4K</span>
                    </div>

                    {/* Clean, High-Definition Product Image with Interactive Hover Zoom */}
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-contain p-2 xs:p-4 sm:p-6 transition-transform duration-700 ease-out group-hover/showcase:scale-105 select-none pointer-events-none"
                      loading={index === 0 ? "eager" : "lazy"}
                      draggable={false}
                    />
                  </div>
                </div>

                {/* =========================================================
                    KEYNOTE TYPOGRAPHY & ACTIONS: High Contrast Light & Dark
                    ========================================================= */}
                <div className="order-2 md:order-1 relative z-10 w-full md:w-[50%] lg:w-[48%] flex flex-col justify-center text-left space-y-2 xs:space-y-2.5 sm:space-y-4 pb-12 md:pb-14">
                  
                  {/* Banner Heading - Deep Black in Light Mode, Crisp White in Dark Mode */}
                  <h2 className="font-heading text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.15]">
                    {banner.title}
                  </h2>

                  {/* Tagline / Specs Overview */}
                  <p className="font-body text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 font-normal line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    {banner.tagline}
                  </p>

                  {/* Hardware Spec Chips */}
                  <div className="hidden xs:flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
                    {banner.specs.map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/90 font-semibold dark:bg-white/10 dark:text-white dark:border-white/15 text-[10px] sm:text-xs font-mono shadow-2xs"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Price Display */}
                  <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
                    <span className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 dark:text-white font-mono tracking-tight">
                      {banner.priceHighlight}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 line-through font-mono">
                      {banner.regularPrice}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-white/80 font-medium font-tech hidden md:inline-block">
                      • {banner.secondaryPerk}
                    </span>
                  </div>

                  {/* Action CTA Buttons */}
                  <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                    <Link
                      to={banner.link}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 xs:px-5 xs:py-3 sm:px-6 sm:py-3.5 rounded-xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      <span>{banner.ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>

                    <Link
                      to={banner.link}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 xs:px-4 xs:py-3 sm:px-5 sm:py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/25 dark:text-white font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
                    >
                      <span>{banner.secondaryCta}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================
            CHEVRON CONTROLS: Adaptive Light/Dark Glass Buttons
            ========================================================= */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="flex absolute top-32 xs:top-36 sm:top-40 md:top-1/2 -translate-y-1/2 left-2 xs:left-3 sm:left-4 lg:left-6 z-30 size-8 xs:size-9 sm:size-10 lg:size-12 rounded-full bg-white/95 hover:bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 shadow-md hover:shadow-lg dark:bg-black/70 dark:hover:bg-black/90 dark:border-white/25 dark:text-white items-center justify-center backdrop-blur-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
        >
          <ChevronLeft className="size-4 sm:size-5 lg:size-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="flex absolute top-32 xs:top-36 sm:top-40 md:top-1/2 -translate-y-1/2 right-2 xs:right-3 sm:right-4 lg:right-6 z-30 size-8 xs:size-9 sm:size-10 lg:size-12 rounded-full bg-white/95 hover:bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 shadow-md hover:shadow-lg dark:bg-black/70 dark:hover:bg-black/90 dark:border-white/25 dark:text-white items-center justify-center backdrop-blur-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
        >
          <ChevronRight className="size-4 sm:size-5 lg:size-6" />
        </button>

        {/* =========================================================
            BOTTOM INTERACTIVE TABS & PROGRESS BAR
            ========================================================= */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 left-0 right-0 z-20 px-3 sm:px-8 pointer-events-none">
          <div className="flex items-center justify-between gap-4">
            
            {/* Interactive Tab Strip (Desktop & Tablet) */}
            <div className="hidden md:flex flex-1 items-center gap-2 lg:gap-3 bg-white/95 border-2 border-slate-200/90 shadow-xl dark:bg-[#080b12]/90 dark:border-white/20 backdrop-blur-xl p-1.5 rounded-2xl max-w-4xl mx-auto pointer-events-auto">
              {BANNERS.map((banner, index) => {
                const isActive = index === currentSlide;
                return (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => handleSelectSlide(index)}
                    className={`flex-1 relative py-2 px-3 rounded-xl text-xs transition-all text-left overflow-hidden cursor-pointer ${
                      isActive
                        ? "text-slate-950 bg-slate-100 font-extrabold shadow-inner border border-slate-300/80 dark:text-white dark:bg-white/20 dark:border-white/10"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-medium dark:text-white/85 dark:hover:text-white dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="block truncate font-mono text-[11px] drop-shadow-xs">
                      {banner.tabLabel}
                    </span>

                    {/* Active Timer Progress Bar - Hardware Accelerated Pure GPU CSS */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-white/25 overflow-hidden rounded-full">
                        <div
                          key={`prog-${currentSlide}-${isPaused}`}
                          className="h-full w-full bg-slate-900 dark:bg-white rounded-full will-change-transform"
                          style={{
                            transformOrigin: "left",
                            animation: `heroProgress ${AUTO_SLIDE_DURATION}ms linear forwards`,
                            animationPlayState: isPaused ? "paused" : "running",
                          }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Compact Dot Indicators with active pill and slide count */}
            <div className="flex md:hidden items-center justify-center gap-1.5 mx-auto bg-white/95 border-2 border-slate-200 text-slate-800 shadow-md dark:bg-black/85 dark:border-white/20 dark:text-white backdrop-blur-md px-3.5 py-1.5 rounded-full pointer-events-auto">
              {BANNERS.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-6 bg-slate-950 dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.3)] dark:shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                      : "w-2 bg-slate-300 hover:bg-slate-400 dark:bg-white/40 dark:hover:bg-white/80"
                  }`}
                />
              ))}
              <span className="text-[10px] font-mono font-semibold text-slate-600 dark:text-white/70 ml-1 pl-1.5 border-l border-slate-300 dark:border-white/20">
                {currentSlide + 1}/{BANNERS.length}
              </span>
            </div>

            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Play Auto Carousel" : "Pause Auto Carousel"}
              aria-label={isPaused ? "Play Carousel" : "Pause Carousel"}
              className="hidden lg:flex items-center justify-center size-8 rounded-full bg-white/95 hover:bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 dark:bg-black/60 dark:hover:bg-black/90 dark:border-white/30 dark:text-white backdrop-blur-md transition-all shrink-0 cursor-pointer shadow-md pointer-events-auto"
            >
              {isPaused ? <Play className="size-3.5 fill-current text-slate-900 dark:text-white" /> : <Pause className="size-3.5 fill-current text-slate-900 dark:text-white" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
