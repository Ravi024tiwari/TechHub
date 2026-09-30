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
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-sm bg-[#080a0e] border-r border-white/10 h-full flex flex-col z-10 p-5 sm:p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Header: Brand & Close */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <Link
            to={isAuthenticated ? (user?.role === "admin" ? "/admin" : "/products") : "/"}
            onClick={onClose}
            className="flex items-center gap-2.5 group select-none relative focus:outline-hidden"
          >
            <div className="relative shrink-0">
              <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#11131a] via-[#0c0e14] to-[#07080c] shadow-xs flex items-center justify-center p-0.5">
                <img
                  src="/techhub-logo.jpg"
                  alt="TechHub Logo"
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center">
                <span className="font-heading font-black text-lg tracking-tight text-white leading-none">
                  TECH
                  <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_1px_8px_rgba(249,115,22,0.35)]">
                    HUB
                  </span>
                </span>
              </div>
              <span className="text-[9px] font-mono font-semibold uppercase tracking-[0.2em] text-slate-400 mt-0.5">
                Phones & Electronics
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Account Tile */}
        <div className="py-4 border-b border-white/[0.08]">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border-2 border-slate-400/30">
              <div className="relative">
                <Avatar className="size-10 border border-slate-300">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
                  <AvatarFallback className="text-sm font-bold">{initials}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#080a0e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-400 truncate font-mono">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div>
                <p className="text-xs font-semibold text-white">Welcome to TechHub</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sign in to track orders and save flagship hardware.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="w-full py-2 text-center text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={onClose}
                  className="w-full py-2 text-center text-xs font-bold rounded-xl bg-white text-black hover:bg-slate-200 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Primary Links */}
        <div className="py-3 space-y-1 border-b border-white/[0.08]">
          <Link
            to={isAuthenticated ? (user?.role === "admin" ? "/admin" : "/products") : "/"}
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors text-xs font-medium"
          >
            <div className="flex items-center gap-3">
              <Home className="h-4 w-4 text-slate-400" />
              <span>{isAuthenticated ? (user?.role === "admin" ? "Admin Control Center" : "Shop All Hardware") : "Storefront Home"}</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          </Link>

          {/* Public Storefront Links */}
          <Link
            to="/products"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors text-xs font-medium"
          >
            <div className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-sky-400" />
              <span>All Hardware Catalog</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          </Link>

          <Link
            to="/products?deal=hot"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 hover:text-amber-200 transition-colors text-xs font-semibold"
          >
            <div className="flex items-center gap-3">
              <Flame className="h-4 w-4 fill-amber-300" />
              <span>Flagship Tech Deals</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 uppercase">
              Save 25%
            </span>
          </Link>

          <Link
            to="/coupons"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors text-xs font-semibold"
          >
            <div className="flex items-center gap-3">
              <Ticket className="h-4 w-4" />
              <span>Promotions & Vouchers</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 uppercase font-bold text-emerald-300">
              New
            </span>
          </Link>

          {/* Authenticated Customer Navigation */}
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:text-white transition-colors text-xs font-semibold"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-4 w-4 text-sky-400" />
                  <span>Customer Dashboard</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/25 uppercase font-bold text-sky-300">
                  VIP
                </span>
              </Link>

              <Link
                to="/orders"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors text-xs font-medium"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-slate-400" />
                  <span>My Orders & Shipments</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              </Link>

              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors text-xs font-medium"
              >
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-slate-400" />
                  <span>Saved Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/compare"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors text-xs font-medium"
              >
                <div className="flex items-center gap-3">
                  <ArrowLeftRight className="h-4 w-4 text-orange-400 stroke-[2.2]" />
                  <span>Compare Specs</span>
                </div>
                {compareCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500 text-white font-bold">
                    {compareCount}
                  </span>
                )}
              </Link>
            </>
          )}

          <Link
            to="/cart"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors text-xs font-medium"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-4 w-4 text-slate-400" />
              <span>Shopping Cart</span>
            </div>
            {cartCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white text-black font-extrabold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Quick Theme Switcher inside Mobile Drawer */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
            <span className="text-slate-300 font-medium">Appearance & Theme</span>
            <ThemeToggle compact={true} />
          </div>
        </div>

        {/* Categories Section */}
        <div className="py-4 space-y-2 flex-1">
          <p className="text-[10px] font-tech uppercase tracking-widest text-slate-500 px-2">
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
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] text-xs font-medium text-slate-300 hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white/[0.06] text-slate-400 group-hover:text-white">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {cat.badge && (
                      <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-300">
                        {cat.badge}
                      </span>
                    )}
                    <ChevronRight className="h-3 w-3 text-slate-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Security & Warranty Assurance */}
        <div className="py-3 px-3 rounded-xl bg-white/[0.02] border border-white/[0.06] my-2 flex items-center gap-2.5 text-[11px] text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Authorized Retailer • Official Brand Warranty</span>
        </div>

        {/* Footer Logout (if authenticated) */}
        {isAuthenticated && (
          <div className="pt-3 border-t border-white/[0.08]">
            <button
              onClick={() => {
                logoutMutation.mutate();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-semibold transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
