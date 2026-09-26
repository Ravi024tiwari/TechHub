import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Eye,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react";

export default function AdminCustomerCard({
  customer,
  onViewDetails,
  onToggleBlock,
  isToggling = false,
}) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [imgError, setImgError] = useState(false);

  const copyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(customer.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const avatarUrl =
    typeof customer.avatar === "string"
      ? customer.avatar
      : customer.avatar?.url || "";
  const firstLetter = customer.name?.trim()?.charAt(0)?.toUpperCase() || "C";

  return (
    <div className="relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-500 dark:hover:border-white/60 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group">
      {/* Ambient background glow isolated inside overflow-hidden wrapper */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
        <div className="absolute -top-14 -right-14 w-44 h-44 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
      </div>

      {/* Top Header Row: Avatar, Name, Email, Status Badge */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-white/15">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar or First Letter Badge */}
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={customer.name}
              onError={() => setImgError(true)}
              className="w-11 h-11 rounded-2xl object-cover border border-slate-300 dark:border-white/20 shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-orange-500/10 text-orange-600 dark:text-orange-400 font-heading font-black text-lg flex items-center justify-center border border-orange-500/30 shrink-0 shadow-xs select-none">
              {firstLetter}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                {customer.name}
              </h3>
              <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/15 shrink-0">
                Customer
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans flex items-center gap-1.5 mt-0.5 truncate">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <span>
                Joined {new Date(customer.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>

        {/* Account Status Pill */}
        <div className="self-start sm:self-auto shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-sans font-semibold border ${
              customer.isBlocked
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 ring-1 ring-rose-500/20"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                customer.isBlocked ? "bg-rose-500" : "bg-emerald-500"
              } animate-pulse`}
            />
            {customer.isBlocked ? "Suspended" : "Active Account"}
          </span>
        </div>
      </div>

      {/* Middle Row: Contact Channels (Email, Phone) */}
      <div className="relative z-10 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
        {/* Email with copy */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-slate-500">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex items-center gap-1.5">
            <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
              {customer.email}
            </span>
            <button
              type="button"
              onClick={copyEmail}
              className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              title="Copy Customer Email"
            >
              {copiedEmail ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-slate-500">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">
            {customer.phone || "No phone registered"}
          </span>
        </div>
      </div>

      {/* Bottom Row: Actions (Inspect 360-Dossier & Suspend/Reactivate) */}
      <div className="relative z-10 pt-3 border-t border-slate-200 dark:border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 hidden sm:inline">
          Customer ID: <strong className="font-mono">{customer._id}</strong>
        </span>

        {/* Action Buttons: 2 Equal Columns on Mobile */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 w-full sm:w-auto">
          {/* Toggle Block/Unblock */}
          <button
            type="button"
            disabled={isToggling}
            onClick={() =>
              onToggleBlock(customer._id, !customer.isBlocked)
            }
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-sans font-semibold border transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 ${
              customer.isBlocked
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                : "bg-slate-100 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300"
            }`}
          >
            {isToggling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : customer.isBlocked ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span className="truncate">
              {customer.isBlocked ? "Reactivate" : "Suspend"}
            </span>
          </button>

          {/* View Details Modal Trigger */}
          <button
            type="button"
            onClick={() => onViewDetails(customer)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-orange-400 dark:text-orange-500" />
            <span>Profile Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
