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
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useLogoutMutation } from "@/hooks/useAuth";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function MobileDrawer({ isOpen, onClose }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cartCount = useCartStore((state) => state.getTotalCount());
  const wishlistCount = useWishlistStore((state) => state.getWishlistCount());
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
            to="/"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-white/30 via-slate-200/20 to-slate-400/10 border-2 border-slate-300/40 flex items-center justify-center shadow-sm">
              <Cpu className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-heading font-extrabold text-base tracking-tight text-white leading-none">
                TECHHUB
              </span>
              <span className="text-[8px] font-tech uppercase tracking-widest text-slate-400 mt-0.5">
                Precision Electronics
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
            to="/"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors text-xs font-medium"
          >
            <div className="flex items-center gap-3">
              <Home className="h-4 w-4 text-slate-400" />
              <span>Storefront Home</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          </Link>

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
                  to={`/category/${cat.slug}`}
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
