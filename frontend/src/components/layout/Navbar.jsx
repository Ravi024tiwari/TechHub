import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Search,
  Heart,
  Menu,
  X,
  Package,
  Flame,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import MobileDrawer from "./MobileDrawer";
import TopAnnouncementBar from "./TopAnnouncementBar";
import NavSearchAutocomplete from "./NavSearchAutocomplete";
import NavCategoriesMegaMenu from "./NavCategoriesMegaMenu";
import NavMiniCartPopover from "./NavMiniCartPopover";
import NavUserMenu from "./NavUserMenu";

/**
 * Enterprise Flagship Silver Navbar:
 * - Fixed/Sticky top (z-50) with frosted glassmorphic backdrop: content scrolls smoothly underneath.
 * - Spans full width of the screen (w-full) with edge-to-edge breathing room.
 * - Brushed silver metallic background with ambient radiant silver light beam.
 * - Authenticated user avatar with rich interactive dropdown menu.
 * - Live debounced search with typeahead autocomplete, trending chips, and keyboard shortcut (Ctrl+K).
 * - Interactive "Categories" Mega Menu with hardware tiles and spotlight deal.
 * - Interactive Mini-Cart Popover with real-time items, subtotal, and checkout CTAs.
 */
export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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
              ? "bg-[#090c13]/98 border-slate-300/40 shadow-[0_12px_45px_rgba(0,0,0,0.95),0_2px_20px_rgba(203,213,225,0.12)]"
              : "bg-gradient-to-r from-[#0c0f17]/95 via-[#161c28]/95 to-[#0c0f17]/95 border-slate-400/30 shadow-[0_4px_35px_rgba(0,0,0,0.85),0_1px_15px_rgba(203,213,225,0.08)]"
          }`}
        >
          {/* Ambient Silver Specular Beam Line */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300/60 to-transparent pointer-events-none transition-opacity duration-300 ${
              isScrolled ? "opacity-100" : "opacity-50"
            }`}
          />

          {/* Full width container with edge-to-edge breathing room */}
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6 relative">
          
          {/* =========================================================
              LEFT: Hamburger (Mobile), Brand Logo & Mega Menu
              ========================================================= */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            {/* Hamburger Trigger (Mobile & Tablet < 1024px) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open mobile navigation"
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Brand Logo with Brushed Silver Frame */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-white/30 via-slate-200/20 to-slate-400/10 border-2 border-slate-300/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover:scale-105 group-hover:border-slate-200 transition-all">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-white leading-none group-hover:text-slate-200 transition-colors">
                  TECHHUB
                </span>
                <span className="text-[9px] font-tech uppercase tracking-widest text-slate-300 hidden sm:block mt-0.5 font-medium">
                  Precision Electronics
                </span>
              </div>
            </Link>

            {/* Desktop Categories Mega Menu */}
            <div className="hidden lg:block ml-2">
              <NavCategoriesMegaMenu />
            </div>

            {/* Deals Direct Link (Desktop) */}
            <Link
              to="/products?deal=hot"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-400/10 border border-amber-400/20 transition-all"
            >
              <Flame className="h-3.5 w-3.5 fill-amber-300" />
              <span>Flagship Deals</span>
            </Link>
          </div>

          {/* =========================================================
              CENTER: Live Autocomplete Search (Desktop & Tablet)
              ========================================================= */}
          <div className="hidden md:flex flex-1 items-center justify-center max-w-xl lg:max-w-2xl mx-2">
            <NavSearchAutocomplete />
          </div>

          {/* =========================================================
              RIGHT: Mobile Search Trigger, Wishlist, Mini Cart & User
              ========================================================= */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
            {/* Mobile Search Toggle Button (< md screens) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              aria-label="Toggle mobile search"
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isMobileSearchOpen ? (
                <X className="h-5 w-5 text-cyan-400" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>

            {/* Orders Link (Large Desktop Screens) */}
            <Link
              to="/orders"
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Package className="h-4 w-4 text-slate-400" />
              <span>Orders</span>
            </Link>

            {/* Wishlist Button with Live Counter Badge */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors flex items-center justify-center group"
            >
              <Heart className="h-5 w-5 group-hover:scale-110 group-hover:text-red-400 transition-all" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-in zoom-in shadow-md">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Interactive Mini-Cart Popover */}
            <NavMiniCartPopover />

            {/* User Account Section: Interactive Avatar Dropdown or Sign In */}
            {isAuthenticated && user ? (
              <NavUserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all hover:scale-105"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-block px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Expandable Search Bar Drawer (< md screens) */}
        {isMobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-400/20 bg-[#0c0f17]/95 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-150">
            <NavSearchAutocomplete
              isMobile={true}
              onCloseMobile={() => setIsMobileSearchOpen(false)}
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
