import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
  RefreshCw,
  Bell,
  Search,
  LogOut,
  ShieldCheck,
  Layers,
  Package,
  ChevronDown,
  LayoutDashboard,
  UserCheck
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";

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

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 bg-[#08090a]/80 backdrop-blur-xl border-b border-white/10">
      {/* Left section: Sidebar Toggles & Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        {/* Mobile Hamburger toggle */}
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar collapse toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle sidebar width"
        >
          {isCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Global Admin Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            className="w-full pl-9 pr-12 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/10 text-slate-400 border border-white/10">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section: Actions, Notifications & Profile with Shadcn Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Refresh button if page supports onRefresh */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-white" : ""}`} />
          </button>
        )}

        {/* Notifications Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#08090a]" />
        </button>

        {/* Live Storefront Link */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] hover:text-white border border-white/10 transition-colors"
          title="Open customer storefront in a new tab"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Live Store</span>
        </Link>

        {/* User Profile Section with Shadcn Dropdown Menu */}
        <div className="pl-1 sm:pl-2 border-l border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all outline-none cursor-pointer"
                aria-label="Open profile navigation menu"
              >
                {/* Avatar Badge with Metallic Sheen */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 via-slate-600 to-slate-400 flex items-center justify-center text-white font-bold text-xs border border-white/25 shadow-[0_0_12px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>

                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-none truncate max-w-[110px]">
                    {user?.name || "Admin"}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Super Admin
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 group-data-[state=open]:rotate-180 ml-0.5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-2 bg-[#0d1017]/95 border-white/15">
              {/* Profile Card Header */}
              <DropdownMenuLabel className="p-2 normal-case font-normal">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/20 shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-heading font-bold text-white truncate">
                        {user?.name || "Administrator"}
                      </p>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      {user?.email || "admin@techhaven.dev"}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Role: {user?.role || "admin"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Navigation Quick Links */}
              <DropdownMenuItem
                onClick={() => navigate("/admin")}
                className="cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Executive Dashboard</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate("/admin/taxonomy")}
                className="cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Categories & Brands</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate("/admin/products")}
                className="cursor-pointer"
              >
                <Package className="w-4 h-4 text-slate-400" />
                <span>Product Inventory</span>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 w-full cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>Explore Live Storefront</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout Option */}
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                className="cursor-pointer font-semibold"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out from Admin</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
