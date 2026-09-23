import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Percent,
  Sparkles,
  Eye,
  ZoomIn
} from "lucide-react";

export default function ProductGallery({
  images = [],
  title = "Product Image",
  discountPercent = 0,
  selectedColorName = "",
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Reset selected image when images array changes (e.g. color variant switch)
  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, images.length]);

  const activeImage =
    images[selectedIndex] ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80";

  // Mouse hover pan effect math
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 select-none">
      {/* =========================================================================
          MAIN STAGE: High-Res Interactive Viewport with Smooth Hover Pan Zoom
          ========================================================================= */}
      <div
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsLightboxOpen(true)}
        className="group relative h-[360px] xs:h-[400px] sm:h-[440px] lg:h-[460px] xl:h-[480px] w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0e14] border-2 border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.8)] cursor-zoom-in transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-radial from-sky-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Product Image with Smooth Dampened Hover Zoom Pan */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src={activeImage}
            alt={title}
            style={{
              transformOrigin: isZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : "50% 50%",
              transform: isZoomed ? "scale(1.26)" : "scale(1)",
              transition: isZoomed
                ? "transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1), transform-origin 150ms cubic-bezier(0.2, 0.8, 0.2, 1)"
                : "transform 500ms cubic-bezier(0.25, 1, 0.5, 1), transform-origin 500ms cubic-bezier(0.25, 1, 0.5, 1)",
            }}
            className="max-h-[88%] max-w-[90%] object-contain select-none pointer-events-none drop-shadow-md will-change-transform"
            loading="eager"
          />
        </div>

        {/* Top-Left: Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-rose-500 text-white shadow-md shadow-rose-500/25 backdrop-blur-md">
            <Percent className="w-3 h-3 stroke-[2.5]" />
            <span>{discountPercent}% OFF</span>
          </div>
        )}

        {/* Top-Right: Fullscreen Expand CTA Button (High-Contrast Guaranteed) */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-white dark:bg-black/80 dark:hover:bg-black dark:text-white border border-white/20 backdrop-blur-md shadow-lg transition-all active:scale-90 cursor-pointer"
            title="Expand fullscreen view"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Center-Bottom Floating Subtle Zoom Hint (Fades out when hovered or zoomed) */}
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/75 dark:bg-black/75 backdrop-blur-md text-[11px] font-mono font-medium text-slate-200 border border-white/10 pointer-events-none transition-opacity duration-300 ${
            isZoomed ? "opacity-0" : "opacity-80 group-hover:opacity-0"
          }`}
        >
          <ZoomIn className="w-3 h-3 text-sky-400" />
          <span>Hover to inspect · Click to expand</span>
        </div>

        {/* Bottom-Left: Color Finish Badge Tag */}
        {selectedColorName && (
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 px-2.5 sm:px-3 py-1 rounded-xl bg-slate-900/85 dark:bg-black/80 border border-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-mono font-semibold text-white shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>Finish: {selectedColorName}</span>
          </div>
        )}

        {/* Bottom-Right: Photo Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 px-2.5 py-1 rounded-xl bg-slate-900/85 dark:bg-black/80 border border-white/15 backdrop-blur-md text-[10px] sm:text-xs font-mono font-bold text-white shadow-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {/* Previous / Next Overlay Arrows (High Contrast Disc Buttons) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white dark:bg-black/85 dark:hover:bg-black dark:text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl active:scale-90 cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white dark:bg-black/85 dark:hover:bg-black dark:text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl active:scale-90 cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
            </button>
          </>
        )}
      </div>

      {/* =========================================================================
          THUMBNAIL STRIP: Multi-Angle Hardware Selector
          ========================================================================= */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1.5 custom-scrollbar touch-pan-x -mx-1 px-1">
          {images.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0c0e14] p-1.5 sm:p-2 overflow-hidden transition-all duration-200 cursor-pointer border-2 ${
                  isSelected
                    ? "border-sky-500 ring-2 ring-sky-500/25 dark:border-sky-400 shadow-md scale-102"
                    : "border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100 hover:border-slate-400 dark:hover:border-white/30"
                }`}
                title={`View angle ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
                {isSelected && (
                  <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-sky-500" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          FULLSCREEN LIGHTBOX MODAL
          ========================================================================= */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all z-50"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation counter */}
          <div className="absolute top-5 left-5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-mono font-bold text-white z-50">
            {selectedIndex + 1} / {images.length} · {title}
          </div>

          {/* Centered Large Image */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={title}
              className="max-h-[80vh] max-w-full object-contain drop-shadow-2xl"
            />
          </div>

          {/* Left Arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
