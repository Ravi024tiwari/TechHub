import React from "react";
import { Truck, ShieldCheck, RefreshCw, Cpu } from "lucide-react";

export default function TrustBadges() {
  const pillars = [
    {
      icon: Truck,
      title: "Free Express Delivery",
      description: "Insured Air Cargo Across India",
      accent: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: ShieldCheck,
      title: "2-Year Brand Warranty",
      description: "Direct OEM Manufacturer Coverage",
      accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: RefreshCw,
      title: "7-Day Replacement",
      description: "Direct Instant Replacement Policy",
      accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: Cpu,
      title: "100% Genuine Hardware",
      description: "Authorized Enterprise Partner",
      accent: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    },
  ];

  return (
    <section aria-label="Official Retailer Guarantees" className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-2 sm:py-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0c0e15] border border-slate-200/90 dark:border-white/[0.08] hover:border-orange-500/40 dark:hover:border-orange-500/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-left group"
            >
              <div
                className={`h-9 w-9 sm:h-11 sm:w-11 shrink-0 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${item.accent}`}
              >
                <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 w-full">
                <p className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
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
