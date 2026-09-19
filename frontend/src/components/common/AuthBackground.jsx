import React, { useRef, useEffect } from "react";

// Deterministic stardust coordinates to ensure consistency & avoid re-render recalculation
const STARDUST_PARTICLES = [
  { top: "12%", left: "18%", size: 1.5, opacity: 0.45, delay: "0s", duration: "4s" },
  { top: "8%", left: "42%", size: 2, opacity: 0.6, delay: "1.2s", duration: "3.5s" },
  { top: "16%", left: "78%", size: 1.5, opacity: 0.4, delay: "0.8s", duration: "5s" },
  { top: "22%", left: "31%", size: 2, opacity: 0.5, delay: "2.1s", duration: "4.2s" },
  { top: "27%", left: "88%", size: 1, opacity: 0.35, delay: "1.5s", duration: "3.8s" },
  { top: "34%", left: "14%", size: 2, opacity: 0.55, delay: "0.3s", duration: "4.7s" },
  { top: "39%", left: "68%", size: 1.5, opacity: 0.45, delay: "2.7s", duration: "3.2s" },
  { top: "45%", left: "24%", size: 1, opacity: 0.3, delay: "1.9s", duration: "4s" },
  { top: "48%", left: "82%", size: 2, opacity: 0.65, delay: "0.6s", duration: "3.6s" },
  { top: "56%", left: "10%", size: 1.5, opacity: 0.4, delay: "2.4s", duration: "4.5s" },
  { top: "62%", left: "74%", size: 2, opacity: 0.5, delay: "1.1s", duration: "5.2s" },
  { top: "68%", left: "37%", size: 1, opacity: 0.35, delay: "3s", duration: "4.1s" },
  { top: "73%", left: "91%", size: 1.5, opacity: 0.45, delay: "0.9s", duration: "3.7s" },
  { top: "79%", left: "21%", size: 2, opacity: 0.55, delay: "2.2s", duration: "4.9s" },
  { top: "84%", left: "63%", size: 1.5, opacity: 0.4, delay: "1.7s", duration: "3.4s" },
  { top: "89%", left: "85%", size: 1, opacity: 0.3, delay: "0.4s", duration: "4.3s" },
  { top: "93%", left: "47%", size: 2, opacity: 0.6, delay: "2.5s", duration: "3.9s" },
  { top: "15%", left: "62%", size: 1, opacity: 0.35, delay: "1.8s", duration: "4.4s" },
  { top: "52%", left: "53%", size: 1.5, opacity: 0.4, delay: "0.7s", duration: "3.1s" },
  { top: "71%", left: "15%", size: 1.5, opacity: 0.45, delay: "1.4s", duration: "4.6s" },
  { top: "29%", left: "49%", size: 1.5, opacity: 0.5, delay: "2.8s", duration: "3.8s" },
  { top: "82%", left: "33%", size: 1, opacity: 0.3, delay: "0.2s", duration: "4s" },
];

/**
 * AuthBackground Component
 * Provides an interactive, cinematic silver atmosphere inspired by Apple Studio Display keynote aesthetic.
 * Features:
 * - Interactive mouse-following silver spotlight
 * - Multi-tier central silver aura & soft shadow gradients
 * - Large architectural typography watermark ("TECH HAVEN" / "STUDIO DISPLAY")
 * - Subtle sparkling stardust particles
 * - Atmospheric silver horizon & precision grid illumination
 */
export default function AuthBackground({
  watermarkLines = ["TECH", "HAVEN"],
  showWatermark = true,
  children,
  className = ""
}) {
  const bgRef = useRef(null);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!bgRef.current) return;
      const rect = bgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      bgRef.current.style.setProperty("--mouse-x", `${x}px`);
      bgRef.current.style.setProperty("--mouse-y", `${y}px`);
      bgRef.current.style.setProperty("--mouse-opacity", "1");
    };

    const handleMouseLeave = () => {
      if (!bgRef.current) return;
      bgRef.current.style.setProperty("--mouse-opacity", "0.2");
    };

    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={bgRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      style={{
        "--mouse-x": "50%",
        "--mouse-y": "45%",
        "--mouse-opacity": "0.6"
      }}
    >
      {/* 1. Deep Cosmic Obsidian Base */}
      <div className="absolute inset-0 bg-[#07080a]" />

      {/* 2. Precision Tech Grid Pattern (illuminated by ambient and silver light) */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "44px 44px"
        }}
      />

      {/* 3. Subtle Cosmic Stardust / Micro-stars */}
      <div className="absolute inset-0">
        {STARDUST_PARTICLES.map((star, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-white transition-opacity"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `silverTwinkle ${star.duration} ease-in-out infinite`,
              animationDelay: star.delay,
              boxShadow: star.size > 1.2 ? `0 0 4px rgba(255, 255, 255, 0.7)` : "none"
            }}
          />
        ))}
      </div>

      {/* 4. Giant Architectural Typography Watermark (Depth Layer) */}
      {showWatermark && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0">
          <div className="w-full flex flex-col items-center justify-center opacity-60">
            {watermarkLines.map((line, idx) => (
              <span
                key={idx}
                className="font-heading font-black tracking-tighter uppercase select-none text-center"
                style={{
                  fontSize: "clamp(3.5rem, 14vw, 13rem)",
                  lineHeight: 0.84,
                  background:
                    "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(203, 213, 225, 0.035) 50%, rgba(148, 163, 184, 0.005) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.05em",
                  filter: "drop-shadow(0 0 60px rgba(255, 255, 255, 0.02))"
                }}
              >
                {line}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5. Center Core Silver Aura & Gradients (The signature silver spotlight) */}
      {/* 5a. Broad diffuse ambient silver atmosphere */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[750px] pointer-events-none rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(226, 232, 240, 0.09) 0%, rgba(148, 163, 184, 0.035) 45%, rgba(15, 23, 42, 0) 75%)",
          animation: "silverPulse 8s ease-in-out infinite"
        }}
      />

      {/* 5b. Focused Metallic Silver Core Spotlight directly behind the central card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] pointer-events-none rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.18) 0%, rgba(203, 213, 225, 0.09) 40%, rgba(148, 163, 184, 0.015) 70%, transparent 85%)",
          animation: "silverPulse 6s ease-in-out infinite alternate"
        }}
      />

      {/* 5c. Angular Silver Sheen Flare in the center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[280px] pointer-events-none rounded-full blur-xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.22) 0%, rgba(226, 232, 240, 0.12) 35%, transparent 70%)"
        }}
      />

      {/* 6. Dynamic Interactive Mouse-Tracking Silver Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(650px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.12) 0%, rgba(203, 213, 225, 0.05) 30%, rgba(148, 163, 184, 0.015) 55%, transparent 75%)",
          opacity: "var(--mouse-opacity)"
        }}
      />

      {/* 7. Subtle Silver Horizon Reflection Line at the bottom (Dock aesthetic) */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none blur-xl" />

      {/* 8. Top Ambient Soft Downlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[260px] bg-gradient-to-b from-white/[0.06] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Children elements if passed */}
      {children}
    </div>
  );
}
