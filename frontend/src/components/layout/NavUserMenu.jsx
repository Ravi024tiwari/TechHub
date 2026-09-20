import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Heart,
  ShieldCheck,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useLogoutMutation } from "@/hooks/useAuth";

export default function NavUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const user = useAuthStore((state) => state.user);
  const cartCount = useCartStore((state) => state.getTotalCount());
  const wishlistCount = useWishlistStore((state) => state.getWishlistCount());
  const logoutMutation = useLogoutMutation();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!user) return null;

  // Extract initials
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
    <div ref={menuRef} className="relative">
      {/* Interactive Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User profile menu"
        className={`flex items-center gap-2.5 p-1 sm:pl-1.5 sm:pr-3 sm:py-1 rounded-full border-2 transition-all cursor-pointer ${
          isOpen
            ? "bg-white/15 border-slate-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            : "bg-white/[0.04] hover:bg-white/[0.09] border-slate-400/30 hover:border-slate-300"
        }`}
      >
        {/* Avatar with Metallic Ring & Active Pulse Indicator */}
        <div className="relative">
          <Avatar className="size-8 sm:size-9 border border-white/20">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0c10]" />
        </div>

        {/* User Info (Desktop) */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-white leading-tight max-w-[110px] truncate">
            {user.name}
          </span>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                user.role === "admin" ? "bg-purple-400 animate-pulse" : "bg-cyan-400"
              }`}
            />
            <span>{user.role === "admin" ? "Admin Console" : "TechHub Pro"}</span>
          </span>
        </div>

        {/* Chevron Indicator */}
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 rounded-2xl bg-[#090b10]/95 backdrop-blur-2xl border-2 border-slate-400/30 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(203,213,225,0.08)] z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          {/* Top Profile Summary Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent border border-white/10 mb-2">
            <div className="flex items-center gap-3">
              <Avatar className="size-11 border-2 border-slate-300 shadow-md">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
                <AvatarFallback className="text-sm font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {user.name}
                  </h4>
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                  {user.email}
                </p>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold mt-1.5 uppercase ${
                    user.role === "admin"
                      ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                      : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  }`}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>{user.role === "admin" ? "Master Admin" : "Verified Member"}</span>
                </div>
              </div>
            </div>

            {/* Quick Stat Tiles */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/[0.08]">
              <Link
                to="/orders"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all text-center group cursor-pointer"
              >
                <span className="text-[10px] text-slate-400 block">Active Orders</span>
                <span className="text-xs font-bold text-white font-mono group-hover:text-cyan-300">
                  Track Status →
                </span>
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all text-center group cursor-pointer"
              >
                <span className="text-[10px] text-slate-400 block">Wishlist</span>
                <span className="text-xs font-bold text-white font-mono group-hover:text-red-300">
                  {wishlistCount} Saved Items
                </span>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5 py-1">
            {/* 1. Primary Profile & Account Settings Link */}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-xs font-medium text-slate-300 hover:text-white transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-105 transition-all">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-semibold text-white">Profile & Account</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-400 block font-mono">
                    {user.role === "admin"
                      ? "Admin profile & credentials"
                      : "Personal details, address & password"}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono group-hover:text-cyan-300">
                Manage →
              </span>
            </Link>

            {/* 2. Admin Management Link (Only if user.role === 'admin') */}
            {user.role === "admin" && (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/25 text-xs font-medium text-purple-200 hover:text-white transition-colors group cursor-pointer my-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 group-hover:scale-105 transition-all">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-white">Admin Management Portal</span>
                    <span className="text-[10px] text-purple-300/70 block font-mono">
                      Products, inventory & metrics
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 uppercase font-bold">
                  Admin
                </span>
              </Link>
            )}

            {/* 3. Orders Link */}
            <Link
              to="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-xs font-medium text-slate-300 hover:text-white transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 group-hover:text-white group-hover:bg-white/10">
                  <Package className="h-4 w-4" />
                </div>
                <span>My Orders & Shipments</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono group-hover:text-slate-300">
                View All
              </span>
            </Link>

            {/* 4. Wishlist Link */}
            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-xs font-medium text-slate-300 hover:text-white transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 group-hover:text-red-400 group-hover:bg-white/10">
                  <Heart className="h-4 w-4" />
                </div>
                <span>Saved Hardware Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* 5. Warranty Vault Link */}
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-xs font-medium text-slate-300 hover:text-white transition-colors group cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 group-hover:text-emerald-400 group-hover:bg-white/10">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span>Warranty Vault & Protection</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                Active
              </span>
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-2 mt-1 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logoutMutation.mutate();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-red-300 hover:text-red-100 hover:bg-red-500/15 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20">
                  <LogOut className="h-4 w-4 text-red-400" />
                </div>
                <span>Sign Out of Account</span>
              </div>
              <span className="text-[10px] text-red-400/60 group-hover:text-red-300 font-mono">
                Log out
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
