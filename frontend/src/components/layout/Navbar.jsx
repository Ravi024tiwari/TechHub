import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Heart,
  Menu,
  Package,
  Flame,
  Search,
  LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import MobileDrawer from "./MobileDrawer";
import TopAnnouncementBar from "./TopAnnouncementBar";
import NavSearchAutocomplete from "./NavSearchAutocomplete";
import NavCategoriesMegaMenu from "./NavCategoriesMegaMenu";
import NavMiniCartPopover from "./NavMiniCartPopover";
import NavUserMenu from "./NavUserMenu";
import ThemeToggle from "../common/ThemeToggle";

/**
 * Enterprise Flagship Silver Navbar:
 * - Fixed/Sticky top (z-50) with frosted glassmorphic backdrop: content scrolls smoothly underneath.
 * - Spans full width of the screen (w-full) with edge-to-edge breathing room.
 * - Brushed silver metallic background with ambient radiant silver light beam.
 * - Authenticated user avatar with rich interactive dropdown menu.
 * - Interactive "Categories" Mega Menu with hardware tiles and spotlight deal.
 * - Interactive Mini-Cart Popover with real-time items, subtotal, and checkout CTAs.
 */
export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Zustand State (0ms Instant updates)
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const wishlistCount = useWishlistStore((state) => state.getWishlistCount());

  // Dynamic Scroll Listener: Enhances frosted glass & silver glow when scrolling
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Pinned Sticky Top Navigation Wrapper (Stays on screen as page scrolls underneath) */}
      <div className="sticky top-0 z-50 w-full transition-all duration-300">
        {/* Top Banner Ribbon */}
        <TopAnnouncementBar />

        {/* Main Full-Width Header with Silver Metallic Theme & Sticky Smooth Scroll */}
        <header
          className={`w-full backdrop-blur-2xl border-b-2 transition-all duration-300 ${
            isScrolled
              ? "bg-white/95 dark:bg-[#090c13]/98 border-slate-300 dark:border-slate-300/40 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_45px_rgba(0,0,0,0.95),0_2px_20px_rgba(203,213,225,0.12)]"
              : "bg-white/85 dark:bg-gradient-to-r dark:from-[#0c0f17]/95 dark:via-[#161c28]/95 dark:to-[#0c0f17]/95 border-slate-300 dark:border-slate-400/30 shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_35px_rgba(0,0,0,0.85),0_1px_15px_rgba(203,213,225,0.08)]"
          }`}
        >
          {/* Ambient Silver Specular Beam Line */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300/60 to-transparent pointer-events-none transition-opacity duration-300 ${
              isScrolled ? "opacity-100" : "opacity-50"
            }`}
          />

          {/* Full width container with edge-to-edge breathing room */}
          <div className="w-full px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-6 relative">
          
          {/* =========================================================
              LEFT: Hamburger (Mobile), Brand Logo & Mega Menu
              ========================================================= */}
          <div className="flex items-center gap-2 sm:gap-5 shrink-0">
            {/* Hamburger Trigger (Mobile & Tablet < 1024px) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open mobile navigation"
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Brand Logo with Brushed Silver Frame */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-slate-900 dark:bg-gradient-to-br dark:from-white/30 dark:via-slate-200/20 dark:to-slate-400/10 border-2 border-slate-800 dark:border-slate-300/40 flex items-center justify-center shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-all">
                <Cpu className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-heading font-extrabold text-base sm:text-xl tracking-tight text-slate-950 dark:text-white leading-none group-hover:text-sky-600 dark:group-hover:text-slate-200 transition-colors">
                  TECHHUB
                </span>
                <span className="text-[9px] font-tech uppercase tracking-widest text-slate-500 dark:text-slate-300 hidden xl:block mt-0.5 font-medium">
                  Precision Electronics
                </span>
              </div>
            </Link>

            {/* Desktop Categories Mega Menu */}
            <div className="hidden lg:block ml-1">
              <NavCategoriesMegaMenu />
            </div>

            {/* Deals Direct Link (Wide Screens) */}
            <Link
              to="/products?deal=hot"
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-500 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-400/10 border border-amber-400/30 transition-all"
            >
              <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>Deals</span>
            </Link>
          </div>

          {/* =========================================================
              CENTER: Live Search Autocomplete (Dominant Visual Anchor)
              ========================================================= */}
          <div className="hidden md:flex flex-1 min-w-[200px] max-w-xl xl:max-w-2xl mx-2 sm:mx-4 lg:mx-6 justify-center">
            <NavSearchAutocomplete />
          </div>

          {/* =========================================================
              RIGHT: Dashboard, Orders, Wishlist, Theme, Mini Cart & User
              ========================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
            {/* Customer Dashboard VIP Pill (Large Desktop) */}
            <Link
              to="/dashboard"
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-all shadow-sm"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-sky-500" />
              <span>Dashboard</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-500/25 text-sky-600 dark:text-sky-300 font-bold uppercase">
                VIP
              </span>
            </Link>

            {/* Orders Link (Large Desktop Screens) */}
            <Link
              to="/orders"
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <Package className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>Orders</span>
            </Link>

            {/* Mobile Search Trigger Button (< md) */}
            <button
              type="button"
              onClick={() => setShowMobileSearch((prev) => !prev)}
              aria-label="Toggle search bar"
              className="md:hidden relative p-1.5 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors flex items-center justify-center cursor-pointer"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Wishlist Button with Live Counter Badge */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative p-1.5 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors flex items-center justify-center group"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 group-hover:text-red-500 transition-all" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 min-w-3.5 sm:h-4 sm:min-w-4 px-1 rounded-full bg-red-500 text-[9px] sm:text-[10px] font-bold text-white flex items-center justify-center animate-in zoom-in shadow-md">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Bright / Dark Theme Switcher Button */}
            <ThemeToggle compact={true} />

            {/* Interactive Mini-Cart Popover */}
            <NavMiniCartPopover />

            {/* User Account Section: Interactive Avatar Dropdown or Sign In */}
            {isAuthenticated && user ? (
              <NavUserMenu />
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-heading font-extrabold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 border border-slate-900 dark:border-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-block px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-heading font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-300 dark:border-white/15 transition-all active:scale-95 cursor-pointer"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Mobile Search Bar (< md) */}
        {showMobileSearch && (
          <div className="md:hidden px-3.5 py-2.5 bg-white/98 dark:bg-[#090c13]/98 border-t border-slate-200 dark:border-white/10 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <NavSearchAutocomplete
              isMobile={true}
              onCloseMobile={() => setShowMobileSearch(false)}
            />
          </div>
        )}
      </header>
      </div>

      {/* Slide-over Drawer for Small & Medium Screens (< 1024px) */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
