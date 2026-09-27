import React from "react";
import { Banknote, CreditCard, Check, ShieldCheck, Zap } from "lucide-react";



export default function CartPaymentSelector({
  paymentMethod,
  setPaymentMethod,
}) {
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            Payment Preference
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Select your preferred settlement method for order processing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Cash on Delivery Card */}
        <div
          onClick={() => setPaymentMethod("COD")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
            paymentMethod === "COD"
              ? "bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20 shadow-xs"
              : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20 mt-0.5">
            <Banknote className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Cash on Delivery (COD)
              </span>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === "COD"
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-slate-300 dark:border-white/20"
                }`}
              >
                {paymentMethod === "COD" && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-sans">
              Pay in cash or digital UPI upon delivery inspection. No advance payment required.
            </p>
          </div>
        </div>

        {/* Instant Online Payment Card */}
        <div
          onClick={() => setPaymentMethod("ONLINE")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
            paymentMethod === "ONLINE"
              ? "bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20 shadow-xs"
              : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 border border-orange-500/20 mt-0.5">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Instant Online Payment
              </span>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === "ONLINE"
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-slate-300 dark:border-white/20"
                }`}
              >
                {paymentMethod === "ONLINE" && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-sans">
              UPI, Credit/Debit Cards, NetBanking with 256-Bit SSL protection & Instant confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
