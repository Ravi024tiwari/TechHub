import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
  RefreshCw,
  Search,
  LogOut,
  ShieldCheck,
  Layers,
  Package,
  ChevronDown,
  LayoutDashboard,
  UserCheck,
  Camera,
  X,
  ShoppingCart,
  Users,
  Boxes,
  ArrowRight,
  CornerDownLeft
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { logoutUserApi } from "../../api/authApi";
import ThemeToggle from "../common/ThemeToggle";
import AdminProfilePhotoModal from "./AdminProfilePhotoModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";

const SEARCH_PLACEHOLDERS = [
  "Search products, SKUs, inventory...",
  "Search orders, customer names, IDs...",
  "Search categories, brands, specs...",
  "Search customers by name or email...",
];

export default function AdminHeader({
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  onRefresh,
  isRefreshing,
}) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Detect OS for shortcut badge (⌘K vs Ctrl K)
  const isMac =
    typeof window !== "undefined" &&
    navigator.userAgent.toUpperCase().includes("MAC");
  const shortcutLabel = isMac ? "⌘K" : "Ctrl K";

  // Dynamic rotating placeholder when idle
  useEffect(() => {
    if (searchQuery || isSearchFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [searchQuery, isSearchFocused]);

  // Global keyboard shortcut (Ctrl+K or ⌘K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true);
          setTimeout(() => mobileSearchInputRef.current?.focus(), 60);
        } else {
          desktopSearchInputRef.current?.focus();
          desktopSearchInputRef.current?.select();
        }
      }
      if (e.key === "Escape") {
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
        desktopSearchInputRef.current?.blur();
        mobileSearchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarUrl =
    typeof user?.avatar === "object" ? user?.avatar?.url : user?.avatar;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";

  const handleLogout = () => {
    logoutUserApi().catch(() => {});
    logout();
    navigate("/", { replace: true });
  };

  const handleOpenMobileSearch = () => {
    setIsMobileSearchOpen(true);
    setTimeout(() => {
      mobileSearchInputRef.current?.focus();
    }, 60);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const val = searchQuery.trim();
    if (!val) return;
    setIsMobileSearchOpen(false);
    setIsSearchFocused(false);
    desktopSearchInputRef.current?.blur();
    mobileSearchInputRef.current?.blur();

    if (val.startsWith("#") || val.toLowerCase().startsWith("ord")) {
      navigate(`/admin/orders?search=${encodeURIComponent(val)}`);
    } else {
      navigate(`/admin/products?search=${encodeURIComponent(val)}`);
    }
  };

  const handleQuickJump = (path) => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setSearchQuery("");
    navigate(path);
  };

  // Shared button style: visible in both light & dark
  const iconBtnCls =
    "p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/[0.07] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors cursor-pointer";

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 bg-white/95 dark:bg-[#08090a]/85 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 transition-colors relative">
      {/* Mobile Full-Width Interactive Search Layer */}
      {isMobileSearchOpen && (
        <div className="md:hidden absolute inset-0 z-50 flex flex-col justify-center px-3 bg-white/98 dark:bg-[#0b0e14]/98 backdrop-blur-2xl border-b border-slate-200 dark:border-white/15 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-sky-600 dark:text-sky-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsMobileSearchOpen(false);
                }}
                placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 font-sans transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 cursor-pointer"
                  title="Clear text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {searchQuery ? (
              <button
                type="submit"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all cursor-pointer shrink-0"
              >
                Search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              >
                Cancel
              </button>
            )}
          </form>

          {/* Quick Action Navigation Chips for Mobile */}
          <div className="flex items-center gap-1.5 pt-2 pb-1 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-slate-400 shrink-0 mr-1">Quick:</span>
            {[
              { label: "Products", path: "/admin/products", icon: Package },
              { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
              { label: "Taxonomy", path: "/admin/taxonomy", icon: Layers },
              { label: "Customers", path: "/admin/customers", icon: Users },
            ].map((chip) => {
              const ChipIcon = chip.icon;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleQuickJump(chip.path)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 shrink-0 cursor-pointer"
                >
                  <ChipIcon className="w-2.5 h-2.5 text-sky-500" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Left section: Sidebar Toggles & Production-Grade Interactive Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-2xl">
        {/* Mobile Hamburger toggle */}
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className={`lg:hidden ${iconBtnCls}`}
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar collapse toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className={`hidden lg:flex ${iconBtnCls}`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle sidebar width"
        >
          {isCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Small Screen: Lens Icon Button with interactive ripple */}
        <button
          type="button"
          onClick={handleOpenMobileSearch}
          className={`md:hidden ${iconBtnCls} flex items-center gap-1.5`}
          title="Search admin portal (tap to open)"
          aria-label="Open search input"
        >
          <Search className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </button>

        {/* Desktop & Tablet Production-Grade Global Search Bar */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-lg relative group">
          {/* Subtle Ambient Focus Glow */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-sky-500/25 via-indigo-500/20 to-sky-400/25 opacity-0 group-focus-within:opacity-100 blur-xs transition-opacity duration-300 pointer-events-none -z-0" />

          <form
            onSubmit={handleSearchSubmit}
            className="relative z-10 w-full flex items-center"
          >
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-20">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-sky-600 dark:group-focus-within:text-sky-400 group-focus-within:scale-110 transition-all" />
            </div>

            <input
              ref={desktopSearchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
              className="w-full pl-10 pr-24 py-2 rounded-xl bg-slate-100/90 dark:bg-white/[0.04] hover:bg-slate-200/60 dark:hover:bg-white/[0.07] focus:bg-white dark:focus:bg-[#0c0f17] border border-slate-300/80 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25 focus:border-sky-500 dark:focus:border-sky-400 text-xs font-sans font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 transition-all shadow-2xs"
            />

            {/* Right Action Icons inside Input */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
              {searchQuery ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      desktopSearchInputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-xs transition-colors cursor-pointer"
                    title="Press Enter to search"
                  >
                    <span>↵</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => desktopSearchInputRef.current?.focus()}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-white/20 border border-slate-300 dark:border-white/10 shadow-2xs transition-colors cursor-pointer"
                  title="Keyboard shortcut"
                >
                  {shortcutLabel}
                </button>
              )}
            </div>
          </form>

          {/* Interactive Quick-Jump Palette (Visible on search focus) */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
              {searchQuery.trim() ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 px-2 py-1">
                    Press <span className="font-bold text-sky-500">Enter ↵</span> to search across:
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-slate-800 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Package className="w-3.5 h-3.5 text-sky-500" />
                      <span>Search products for &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchFocused(false);
                      navigate(`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-400 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ShoppingCart className="w-3.5 h-3.5 text-purple-500" />
                      <span>Search orders for &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-2 py-1">
                    <span>QUICK JUMP COMMANDS</span>
                    <span className="text-slate-400">Esc to close</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: "Products Catalog", path: "/admin/products", icon: Package, desc: "Stock & SKUs" },
                      { label: "Orders Stream", path: "/admin/orders", icon: ShoppingCart, desc: "Customer orders" },
                      { label: "Categories & Brands", path: "/admin/taxonomy", icon: Layers, desc: "Taxonomy tree" },
                      { label: "Customer Accounts", path: "/admin/customers", icon: Users, desc: "Users & VIPs" },
                      { label: "Stock Inventory", path: "/admin/inventory", icon: Boxes, desc: "Warehouse stock" },
                      { label: "Executive Dashboard", path: "/admin", icon: LayoutDashboard, desc: "Analytics & KPIs" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => handleQuickJump(item.path)}
                          className="flex items-center gap-2 p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer group/jump"
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover/jump:text-sky-600 dark:group-hover/jump:text-sky-400 group-hover/jump:border-sky-300 dark:group-hover/jump:border-sky-500/30 transition-colors shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover/jump:text-sky-600 dark:group-hover/jump:text-sky-400 truncate">
                              {item.label}
                            </div>
                            <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 truncate">
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Live Store & Profile (Notification bell removed) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Refresh button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`${iconBtnCls} disabled:opacity-50`}
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-orange-500" : ""}`} />
          </button>
        )}

        {/* Live Storefront Link */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors"
          title="Open customer storefront in a new tab"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden md:inline">Live Store</span>
        </Link>

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* User Profile Dropdown */}
        <div className="pl-1 sm:pl-2 border-l border-slate-200 dark:border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all outline-none cursor-pointer"
                aria-label="Open profile navigation menu"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xs border border-white/25 shadow-[0_0_12px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name || "Admin"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-white leading-none truncate max-w-[110px]">
                    {user?.name || "Admin"}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    Super Admin
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-transform duration-200 group-data-[state=open]:rotate-180 ml-0.5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-2">
              {/* Profile Card Header */}
              <DropdownMenuLabel className="p-2 normal-case font-normal">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="relative group/avatar cursor-pointer shrink-0"
                    title="Click to update profile photo"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/20">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={user?.name || "Admin"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-heading font-bold text-slate-900 dark:text-white truncate">
                        {user?.name || "Administrator"}
                      </p>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {user?.email || "admin@techhaven.dev"}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      Role: {user?.role || "admin"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Update Profile Photo Action */}
              <DropdownMenuItem
                onClick={() => setIsPhotoModalOpen(true)}
                className="cursor-pointer font-medium"
              >
                <Camera className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span className="text-slate-800 dark:text-slate-200">
                  Update Profile Photo
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Navigation Quick Links */}
              <DropdownMenuItem
                onClick={() => navigate("/admin")}
                className="cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Executive Dashboard</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate("/admin/taxonomy")}
                className="cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Categories &amp; Brands</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate("/admin/products")}
                className="cursor-pointer"
              >
                <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Product Inventory</span>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 w-full cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Explore Live Storefront</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                className="cursor-pointer font-semibold"
              >
                <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>Sign Out from Admin</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Admin Profile Photo Modal */}
      <AdminProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        user={user}
      />
    </header>
  );
}
