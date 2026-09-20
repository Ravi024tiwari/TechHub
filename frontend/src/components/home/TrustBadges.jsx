import React from "react";
import { Truck, ShieldCheck, RefreshCw, Cpu } from "lucide-react";

export default function TrustBadges() {
  const pillars = [
    {
      icon: Truck,
      title: "Free Express Delivery",
      description: "Fast insured dispatch across India",
    },
    {
      icon: ShieldCheck,
      title: "2-Year Official Warranty",
      description: "Direct OEM manufacturer coverage",
    },
    {
      icon: RefreshCw,
      title: "7-Day Replacement",
      description: "Hassle-free return & replacement",
    },
    {
      icon: Cpu,
      title: "100% Genuine Hardware",
      description: "Direct authorized enterprise retailer",
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-3 sm:py-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/15 transition-all flex items-center gap-3 text-left"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
