import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Heart,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  ShoppingBag,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useLogoutMutation } from "@/hooks/useAuth";

/**
 * Enterprise Production-Grade User Dropdown & Customer Portal:
 * - Optimized for mobile screens with a solid non-bleeding background and backdrop scrim.
 * - Vibrant color-coded interactive items (Emerald, Amber, Rose, Sky, Purple).
 * - Complete links to all customer pages: Catalog, Orders, Wishlist, Bag, and Account.
 */
export default function NavUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const cartCount = useCartStore((state) => state.getTotalCount());
  const wishlistCount = useWishlistStore((state) => state.getWishlistCount());
  const logoutMutation = useLogoutMutation();

  // Close when clicking outside or pressing Escape
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

  const handleLogout = () => {
    setIsOpen(false);
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  return (
    <div ref={menuRef} className="relative">
      {/* =========================================================================
          AVATAR TRIGGER BUTTON
          ========================================================================= */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User profile menu"
        className={`flex items-center gap-1.5 sm:gap-2.5 p-0.5 sm:pl-1.5 sm:pr-3 sm:py-1 rounded-full border-2 transition-all cursor-pointer ${
          isOpen
            ? "bg-white/20 border-white shadow-[0_0_20px_rgba(255,255,255,0.25)]"
            : "bg-white/[0.05] hover:bg-white/[0.12] border-slate-300 dark:border-white/20 hover:border-white"
        }`}
      >
        {/* Avatar with Metallic Ring & Active Status Dot */}
        <div className="relative">
          <Avatar className="size-7 sm:size-8 border border-white/25">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-[11px] sm:text-xs font-bold bg-sky-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 size-2 sm:size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0c10]" />
        </div>

        {/* User Info (Desktop) */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[110px] truncate">
            {user.name}
          </span>
          <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                user.role === "admin" ? "bg-purple-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <span>{user.role === "admin" ? "Admin Console" : "Verified"}</span>
          </span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {/* =========================================================================
          MOBILE SCRIM BACKDROP (< 640px)
          Prevents underlying page text from interfering with the menu
          ========================================================================= */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 sm:hidden animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* =========================================================================
          USER MENU DROPDOWN CARD
          ========================================================================= */}
      {isOpen && (
        <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full mt-2.5 sm:w-84 rounded-2xl bg-[#0e121d] dark:bg-[#0a0d16] border-2 border-slate-700/80 dark:border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(56,189,248,0.15)] z-50 p-3 sm:p-3.5 animate-in fade-in zoom-in-95 duration-150 text-left select-none max-h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
          {/* Top User Profile Header Box */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-sky-500/15 via-slate-800/60 to-indigo-500/15 border border-white/10 mb-2.5">
            <div className="flex items-center gap-3">
              <Avatar className="size-11 border-2 border-white/30 shadow-md">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
                <AvatarFallback className="text-sm font-bold bg-sky-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white truncate">
                    {user.name}
                  </h4>
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                  {user.email}
                </p>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9.5px] font-mono font-bold mt-1.5 uppercase ${
                    user.role === "admin"
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                      : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  }`}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>{user.role === "admin" ? "Master Administrator" : "Verified Customer"}</span>
                </div>
              </div>
            </div>

            {/* Quick Interactive Stat Tiles */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
              {/* Active Orders Tile */}
              <Link
                to="/orders"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-center group cursor-pointer"
              >
                <span className="text-[10px] text-amber-300/80 font-medium block">Active Orders</span>
                <span className="text-xs font-bold text-amber-300 font-mono flex items-center justify-center gap-1 group-hover:scale-105 transition-transform mt-0.5">
                  <Package className="h-3 w-3" />
                  <span>Track Status</span>
                </span>
              </Link>

              {/* Wishlist Tile */}
              <Link
                to="/wishlist"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all text-center group cursor-pointer"
              >
                <span className="text-[10px] text-rose-300/80 font-medium block">Saved Wishlist</span>
                <span className="text-xs font-bold text-rose-300 font-mono flex items-center justify-center gap-1 group-hover:scale-105 transition-transform mt-0.5">
                  <Heart className="h-3 w-3 fill-rose-400" />
                  <span>{wishlistCount} Items</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Navigation Links with High-Contrast Color Combinations */}
          <div className="space-y-1 py-1">
            {/* 1. All Products / Catalog */}
            <Link
              to="/products"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/25 text-xs font-medium text-slate-200 hover:text-white transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-semibold text-white">All Hardware Catalog</span>
                  <span className="text-[10px] text-slate-400 block">Laptops, Phones, GPUs & Audio</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold group-hover:translate-x-0.5 transition-transform">
                Explore →
              </span>
            </Link>

            {/* 2. My Orders & Tracking */}
            <Link
              to="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/25 text-xs font-medium text-slate-200 hover:text-white transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-semibold text-white">My Orders & Shipments</span>
                  <span className="text-[10px] text-slate-400 block">Air dispatch tracking & history</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                Tracking
              </span>
            </Link>

            {/* 3. Saved Wishlist */}
            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/25 text-xs font-medium text-slate-200 hover:text-white transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 group-hover:scale-110 transition-transform">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-semibold text-white">Saved Hardware Wishlist</span>
                  <span className="text-[10px] text-slate-400 block">Saved gear & price drop alerts</span>
                </div>
              </div>
              {wishlistCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/25 text-rose-300 font-bold border border-rose-500/30">
                  {wishlistCount}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">Empty</span>
              )}
            </Link>

            {/* 4. Hardware Bag & Checkout */}
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-500/10 border border-transparent hover:border-sky-500/25 text-xs font-medium text-slate-200 hover:text-white transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-semibold text-white">Shopping Bag & Checkout</span>
                  <span className="text-[10px] text-slate-400 block">Review items & secured payment</span>
                </div>
              </div>
              {cartCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/25 text-sky-300 font-bold border border-sky-500/30">
                  {cartCount} in Bag
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">0 Items</span>
              )}
            </Link>

            {/* 5. Profile & Account Settings */}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/25 text-xs font-medium text-slate-200 hover:text-white transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-semibold text-white">Profile & Account</span>
                  <span className="text-[10px] text-slate-400 block">Personal details, addresses & security</span>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono group-hover:translate-x-0.5 transition-transform">
                Manage →
              </span>
            </Link>

            {/* 6. Admin Portal (Only for role: admin) */}
            {user.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-medium text-purple-200 hover:text-white transition-all group cursor-pointer my-1.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-500/25 text-purple-300 border border-purple-500/40 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-white">Admin Control Center</span>
                    <span className="text-[10px] text-purple-300/80 block">
                      Inventory, orders & product editor
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 uppercase font-bold border border-purple-500/40">
                  Console
                </span>
              </Link>
            )}
          </div>

          {/* Logout Action */}
          <div className="pt-2 mt-1 border-t border-white/10">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-rose-500/20 group-hover:scale-110 transition-transform">
                  <LogOut className="h-3.5 w-3.5 text-rose-400" />
                </div>
                <span>Sign Out of Account</span>
              </div>
              <span className="text-[10px] text-rose-400/80 font-mono">
                Log out →
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
