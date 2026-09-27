import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Copy,
  Check,
  ShieldCheck,
  HelpCircle,
  Headphones,
  Truck,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

export default function OrderDeliveryAddressCard({ order }) {
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const address = order?.shippingAddress || {};

  const fullAddressString = `${address.fullName || ""}\n${address.street || ""}${
    address.landmark ? `, Near ${address.landmark}` : ""
  }\n${address.city || ""}, ${address.state || ""} - ${address.pincode || ""}\nPhone: ${
    address.phone || ""
  }`;

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(fullAddressString);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleCopyPhone = (ph) => {
    if (!ph) return;
    navigator.clipboard?.writeText(ph);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Shipping Address Destination Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all space-y-5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <MapPin className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                Delivery Destination
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Designated physical dispatch drop point
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyAddress}
            title="Copy Full Address"
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-white/20 transition-colors cursor-pointer"
          >
            {copiedAddr ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Address Body */}
        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <span className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
              {address.fullName || "Valued Customer"}
            </span>
            {address.addressType && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/30">
                {address.addressType}
              </span>
            )}
          </div>

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {address.street}
            {address.landmark && (
              <span className="block text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Landmark: {address.landmark}
              </span>
            )}
          </p>

          <p className="font-mono text-slate-700 dark:text-slate-300 text-xs">
            {address.city}, {address.state} -{" "}
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {address.pincode}
            </span>
          </p>

          {/* Contact phone */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              <span>+91 {address.phone}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyPhone(address.phone)}
              title="Copy Phone Number"
              className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {copiedPhone ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TechHub Protection & Assurance Card matching Admin Quality */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
              TechHub Concierge Protection
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Hardware integrity & authentic dispatch guarantee
            </p>
          </div>
        </div>

        <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-sans">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% Genuine, Sealed Manufacturer Hardware</span>
          </li>
          <li className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-orange-500 shrink-0" />
            <span>7-Day Hassle-Free Replacement for Defective Items</span>
          </li>
          <li className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-sky-500 shrink-0" />
            <span>24/7 Priority Customer Concierge Support</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
