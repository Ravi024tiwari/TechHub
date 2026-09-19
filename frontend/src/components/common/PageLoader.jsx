import React from "react";
import { Cpu } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-screen w-full bg-[#08090a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute w-72 h-72 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-4">
        {/* Animated pulsating chip icon */}
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)] animate-pulse">
            <Cpu className="h-8 w-8 text-white" />
          </div>
          {/* Subtle orbiting ring */}
          <div className="absolute -inset-2 rounded-3xl border border-white/10 animate-spin [animation-duration:6s] pointer-events-none" />
        </div>

        {/* Loading text */}
        <div className="text-center space-y-1">
          <span className="font-heading font-bold text-sm tracking-wider text-white uppercase block">
            TECHHAVEN
          </span>
          <span className="font-tech text-xs text-slate-400">
            Initializing Hardware Architecture...
          </span>
        </div>
      </div>
    </div>
  );
}
