import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, ShieldCheck, ShoppingBag, Camera } from "lucide-react";

export default function ProfileHeader({ user, onAvatarClick }) {
  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const avatarUrl =
    typeof user.avatar === "object" ? user.avatar?.url : user.avatar;

  return (
    <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-sm mb-6 sm:mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 sm:gap-6 transition-all">
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        <div className="relative group cursor-pointer shrink-0" onClick={onAvatarClick}>
          <Avatar className="size-16 sm:size-24 border-2 border-slate-200 dark:border-white/20 shadow-lg">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-tr from-sky-500 to-blue-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
              {user.name}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 uppercase shrink-0">
              {user.role === "admin" ? "Master Admin" : "Verified Customer"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5 sm:mt-1 flex items-center gap-1.5 truncate">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{user.email}</span>
          </p>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 sm:mt-2 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Enterprise Encrypted Profile Vault</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/[0.06]">
        <Link
          to="/cart"
          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-800 dark:text-white transition-all text-center flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-white/10"
        >
          <ShoppingBag className="h-4 w-4 text-sky-400 shrink-0" />
          <span>My Bag</span>
        </Link>
        <Link
          to="/products"
          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-500/20 hover:shadow-sky-500/35 hover:scale-105 active:scale-95 transition-all text-center"
        >
          Explore Hardware
        </Link>
      </div>
    </div>
  );
}
