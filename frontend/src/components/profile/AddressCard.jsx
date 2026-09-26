import React from "react";
import {
  MapPin,
  Home,
  Briefcase,
  Building,
  Star,
  Edit2,
  Trash2,
  Check,
  Phone,
  Loader2,
  ShieldCheck,
  Compass,
} from "lucide-react";

/**
 * Enterprise Production-Grade Address Card:
 * - Ultra-responsive layout tuned for both 360px mobile screens and wide desktops.
 * - Non-wrapping badges, adaptive padding, and monospaced postal PIN code badge.
 * - High-contrast visual identities for Default vs Secondary destinations.
 */
export default function AddressCard({
  address,
  isDefault,
  isDeleting,
  onSetDefault,
  onEdit,
  onDelete,
  isSettingDefault,
}) {
  const isWork = address.addressType === "work";
  const isOther = address.addressType === "other";

  const TypeIcon = isWork ? Briefcase : isOther ? Building : Home;

  const typeColorClasses = isWork
    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30"
    : isOther
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
    : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";

  return (
    <div
      className={`group relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isDefault
          ? "bg-gradient-to-b from-emerald-500/[0.08] to-transparent dark:bg-[#0c1418] border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-xl shadow-emerald-500/5 dark:shadow-[0_10px_35px_rgba(16,185,129,0.08)]"
          : "bg-white dark:bg-[#0c0f17] border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm hover:shadow-lg dark:hover:shadow-black/60 hover:-translate-y-0.5"
      }`}
    >
      {/* Background Decorative Ambient Radial Glow */}
      <div
        className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-opacity ${
          isDefault
            ? "bg-emerald-500/15 opacity-100"
            : "bg-sky-500/5 opacity-0 group-hover:opacity-100"
        }`}
      />

      <div>
        {/* Top Badges & Actions Header */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
            {/* Category Tag (Home / Work / Other) */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold font-mono uppercase border shrink-0 ${typeColorClasses}`}
            >
              <TypeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{address.addressType || "home"}</span>
            </span>

            {/* Default Shipping Badge */}
            {isDefault ? (
              <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <Star className="h-3 w-3 fill-emerald-500 text-emerald-500 shrink-0" />
                <span className="hidden sm:inline">Default Dispatch</span>
                <span className="sm:hidden inline">Default</span>
              </span>
            ) : null}
          </div>

          {/* Quick Edit & Delete Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 border border-transparent hover:border-sky-500/20 transition-all cursor-pointer"
              title="Edit Address"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
              title="Delete Address"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Recipient Identity */}
        <div className="mb-3 sm:mb-4">
          <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
            {address.fullName}
          </h4>
          <p className="text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400">
              <Phone className="h-2.5 w-2.5" />
            </span>
            <span>+91 {address.phone}</span>
          </p>
        </div>

        {/* Street & Postal Geo Container */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] space-y-2 mb-3 sm:mb-4 text-xs leading-relaxed">
          <div className="flex items-start gap-2.5">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-[13px]">
                {address.street}
              </p>
              {address.landmark && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <Compass className="h-3 w-3 text-amber-500 shrink-0" />
                  <span>
                    Landmark:{" "}
                    <strong className="font-medium text-slate-700 dark:text-slate-300">
                      {address.landmark}
                    </strong>
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
              {address.city}, {address.state}
            </span>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 shrink-0">
              PIN {address.pincode}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between gap-2">
        {isDefault ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-tech">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-[11px] sm:text-xs">Primary Dispatch Active</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSetDefault}
            disabled={isSettingDefault}
            className="group/btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSettingDefault ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5 text-slate-400 group-hover/btn:text-emerald-500 transition-colors" />
            )}
            <span>Set as Default</span>
          </button>
        )}

        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest shrink-0">
          India (IN)
        </span>
      </div>
    </div>
  );
}
