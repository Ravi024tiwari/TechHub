import React from "react";
import { Link } from "react-router-dom";
import {
  X,
  User,
  ShoppingBag,
  Heart,
  Package,
  Layers,
  Home,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Cpu,
  Flame,
  HelpCircle,
  Laptop,
  Smartphone,
  Headphones,
  Monitor,
  Gamepad2,
  Watch,
  LayoutDashboard,
  ArrowLeftRight,
  Ticket,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCompareStore } from "@/store/useCompareStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useLogoutMutation } from "@/hooks/useAuth";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ThemeToggle from "../common/ThemeToggle";

export default function MobileDrawer({ isOpen, onClose }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cartCount = useCartStore((state) => state.getTotalCount());
  const wishlistCount = useWishlistStore((state) => state.getWishlistCount());
  const compareCount = useCompareStore((state) => state.getCompareCount());
  const logoutMutation = useLogoutMutation();

  if (!isOpen) return null;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const avatarUrl =
    typeof user?.avatar === "object" ? user.avatar?.url : user?.avatar;

  const categories = [
    { name: "Laptops & MacBooks", slug: "laptops", icon: Laptop, badge: "M3 Max" },
    { name: "Smartphones & Tablets", slug: "smartphones", icon: Smartphone, badge: "iPhone 16" },
    { name: "Audio & Studio Gear", slug: "audio", icon: Headphones, badge: "Sony XM5" },
    { name: "Monitors & OLEDs", slug: "monitors", icon: Monitor, badge: "4K 240Hz" },
    { name: "Gaming & RTX GPUs", slug: "gaming", icon: Gamepad2, badge: "RTX 4090" },
    { name: "Smart Wearables", slug: "wearables", icon: Watch, badge: "Ultra 2" },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop with smooth blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Container with Dual-Mode Color Grading */}
      <div className="relative w-full max-w-sm bg-white/98 dark:bg-[#080a0e]/98 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 h-full flex flex-col z-10 p-5 sm:p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-300 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10">
        
        {/* =========================================================
            HEADER: Brand Identity & Close Trigger
            ========================================================= */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          <Link
            to={isAuthenticated ? (user?.role === "admin" ? "/admin" : "/products") : "/"}
            onClick={onClose}
            className="flex items-center gap-2.5 group select-none relative focus:outline-hidden"
          >
            <div className="relative shrink-0">
              <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-slate-300/80 dark:border-white/15 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#11131a] dark:via-[#0c0e14] dark:to-[#07080c] shadow-xs flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
                <img
                  src="/techhub-logo.jpg"
                  alt="TechHub Logo"
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center">
                <span className="font-heading font-black text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  TECH
                  <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 dark:from-orange-400 dark:via-amber-400 dark:to-orange-300 bg-clip-text text-transparent drop-shadow-[0_1px_8px_rgba(249,115,22,0.35)]">
                    HUB
                  </span>
                </span>
              </div>
              <span className="text-[9px] font-mono font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mt-0.5">
                Phones & Electronics
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =========================================================
            USER ACCOUNT / WELCOME TILE
            ========================================================= */}
        <div className="py-4 border-b border-slate-200 dark:border-white/[0.08]">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/90 dark:from-white/[0.05] dark:to-white/[0.02] border border-slate-200/90 dark:border-white/15 shadow-xs">
              <div className="relative shrink-0">
                <Avatar className="size-11 border-2 border-slate-300 dark:border-white/20 shadow-xs">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
                  <AvatarFallback className="text-sm font-heading font-bold bg-sky-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#080a0e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-bold text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                  {user.email}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {user.role === "admin" ? "Master Admin" : "Verified Customer"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100/80 dark:from-[#11141d] dark:via-[#0e1017] dark:to-[#090b10] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
              <div>
                <p className="text-xs font-heading font-bold text-slate-900 dark:text-white">
                  Welcome to TechHub
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Sign in to track orders, save items & claim exclusive offers.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="w-full py-2.5 text-center text-xs font-heading font-bold rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs hover:border-slate-400 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/15 transition-all active:scale-95 cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={onClose}
                  className="w-full py-2.5 text-center text-xs font-heading font-extrabold rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-950 shadow-md hover:scale-102 active:scale-95 transition-all cursor-pointer"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================
            PRIMARY NAVIGATION LINKS
            ========================================================= */}
        <div className="py-3.5 space-y-1.5 border-b border-slate-200 dark:border-white/[0.08]">
          {/* Storefront Home */}
          <Link
            to={isAuthenticated ? (user?.role === "admin" ? "/admin" : "/products") : "/"}
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all text-xs font-semibold group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                <Home className="h-4 w-4" />
              </div>
              <span>{isAuthenticated ? (user?.role === "admin" ? "Admin Control Center" : "Shop All Hardware") : "Storefront Home"}</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* All Hardware Catalog */}
          <Link
            to="/products"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all text-xs font-semibold group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                <Layers className="h-4 w-4" />
              </div>
              <span>All Hardware Catalog</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Flagship Tech Deals (Interactive Gold Rim Accent) */}
          <Link
            to="/products?deal=hot"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-400/15 dark:via-orange-400/15 dark:to-amber-400/10 border border-amber-500/30 dark:border-amber-400/30 text-amber-900 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-200 hover:border-amber-500/50 dark:hover:border-amber-400/50 transition-all text-xs font-heading font-bold shadow-2xs group cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Flame className="h-4 w-4 fill-amber-500 dark:fill-amber-400" />
              </div>
              <span>Flagship Tech Deals</span>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold uppercase tracking-wider border border-amber-500/30">
              Save 25%
            </span>
          </Link>

          {/* Authenticated Customer Navigation Items */}
          {isAuthenticated && (
            <>
              {/* Exclusive Offers & Coupons (Emerald Accent) */}
              <Link
                to="/offers"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 dark:from-emerald-500/15 dark:via-teal-500/15 dark:to-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-200 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 transition-all text-xs font-heading font-bold shadow-2xs group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Ticket className="h-4 w-4" />
                  </div>
                  <span>Exclusive Offers & Vouchers</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 uppercase font-bold tracking-wider border border-emerald-500/30">
                  Offers
                </span>
              </Link>

              {/* VIP Customer Dashboard */}
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/15 dark:bg-sky-500/15 dark:hover:bg-sky-500/20 border border-sky-500/30 text-sky-900 dark:text-sky-300 hover:text-sky-950 dark:hover:text-white transition-all text-xs font-heading font-bold group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  <span>Customer Dashboard</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-sky-500/20 dark:bg-sky-500/30 text-sky-900 dark:text-sky-300 uppercase font-bold tracking-wider border border-sky-500/30">
                  VIP
                </span>
              </Link>

              {/* Orders & Shipments */}
              <Link
                to="/orders"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all text-xs font-semibold group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                    <Package className="h-4 w-4" />
                  </div>
                  <span>My Orders & Shipments</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Saved Wishlist */}
              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all text-xs font-semibold group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 dark:bg-rose-500/15 text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform">
                    <Heart className="h-4 w-4" />
                  </div>
                  <span>Saved Wishlist</span>
                </div>
                {wishlistCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold shadow-xs">
                    {wishlistCount}
                  </span>
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
                )}
              </Link>

              {/* Compare Specs Matrix */}
              <Link
                to="/compare"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all text-xs font-semibold group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 dark:bg-orange-500/15 text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform">
                    <ArrowLeftRight className="h-4 w-4 stroke-[2.2]" />
                  </div>
                  <span>Compare Specs Matrix</span>
                </div>
                {compareCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500 text-white font-bold shadow-xs">
                    {compareCount}
                  </span>
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
                )}
              </Link>
            </>
          )}

          {/* Shopping Cart */}
          <Link
            to="/cart"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all text-xs font-semibold group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span>Shopping Cart</span>
            </div>
            {cartCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold shadow-xs">
                {cartCount}
              </span>
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
            )}
          </Link>

          {/* Quick Theme Switcher Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] text-xs transition-colors">
            <span className="text-slate-700 dark:text-slate-300 font-medium">Appearance & Theme</span>
            <ThemeToggle compact={true} />
          </div>
        </div>

        {/* =========================================================
            CATEGORIES SECTION (Tactile Interactive List)
            ========================================================= */}
        <div className="py-4 space-y-2 flex-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold px-2">
            Explore Categories
          </p>
          <div className="space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.05] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all group cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {cat.badge && (
                      <span className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                        {cat.badge}
                      </span>
                    )}
                    <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600 group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            SECURITY & WARRANTY FOOTER BADGE
            ========================================================= */}
        <div className="py-2.5 px-3 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] my-2 flex items-center gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">Authorized Retailer • Official Brand Warranty</span>
        </div>

        {/* Footer Logout (if authenticated) */}
        {isAuthenticated && (
          <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                logoutMutation.mutate();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 hover:border-rose-500/30 text-xs font-heading font-bold transition-all cursor-pointer active:scale-98"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
