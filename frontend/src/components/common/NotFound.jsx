import React from "react";
import { Link } from "react-router-dom";
import { Cpu, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#08090a] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="glass-card max-w-lg w-full p-8 sm:p-10 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-tech text-xs">
          <span>ERROR 404 · HARDWARE NOT FOUND</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading font-extrabold text-6xl sm:text-7xl tracking-tight text-white">
            404
          </h1>
          <h2 className="font-heading font-bold text-xl text-slate-200">
            Signal Lost in Transmission
          </h2>
          <p className="font-body text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            The electronic component, page, or device catalog you are attempting to access does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-pill-primary w-full sm:w-auto">
            <Home className="h-4 w-4" />
            <span>Return to Storefront</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-pill-secondary w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
