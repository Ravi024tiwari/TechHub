import React, { useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Users,
  AlertTriangle,
  ExternalLink,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X,
  Sparkles,
  Layers
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const navSections = [
  {
    title: "MAIN",
    items: [
      {
        label: "Dashboard",
        to: "/admin",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: "PRODUCT CATALOG",
    items: [
      {
        label: "All Products",
        to: "/admin/products",
        icon: Package,
      },
      {
        label: "Categories & Brands",
        to: "/admin/taxonomy",
        icon: Layers,
      },
      {
        label: "Add Product",
        to: "/admin/products/new",
        icon: PlusCircle,
      },
      {
        label: "Low Stock Alerts",
        to: "/admin/inventory",
        icon: AlertTriangle,
        badge: "Live",
      },
    ],
  },
  {
    title: "FULFILLMENT & CRM",
    items: [
      {
        label: "Orders",
        to: "/admin/orders",
        icon: ShoppingBag,
      },
      {
        label: "Customers",
        to: "/admin/customers",
        icon: Users,
      },
    ],
  },
];

export default function AdminSidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const asideRef = useRef(null);
  const navScrollRef = useRef(null);

  // Mobile Drawer: Lock body scrolling when open so touch events don't scroll background page
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isMobileOpen]);

  // Desktop & Tablet: Strict wheel event isolation
  // Prevents mouse wheel scrolling over the sidebar from bubbling or causing the main page to scroll
  useEffect(() => {
    const asideEl = asideRef.current;
    if (!asideEl) return;

    const handleWheel = (e) => {
      const navEl = navScrollRef.current;
      if (!navEl) {
        e.preventDefault();
        return;
      }

      const hasOverflow = navEl.scrollHeight > navEl.clientHeight;
      if (!hasOverflow) {
        // If sidebar navigation fits entirely on screen, stop wheel event completely so page NEVER moves
        e.preventDefault();
        return;
      }

      // If at top and scrolling up, prevent bubbling to page
      if (navEl.scrollTop <= 0 && e.deltaY < 0) {
        e.preventDefault();
        return;
      }

      // If at bottom and scrolling down, prevent bubbling to page
      if (navEl.scrollTop + navEl.clientHeight >= navEl.scrollHeight - 1 && e.deltaY > 0) {
        e.preventDefault();
        return;
      }
    };

    asideEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => asideEl.removeEventListener("wheel", handleWheel);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleNavClick = () => {
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          onTouchMove={(e) => e.preventDefault()}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        ref={asideRef}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-[#08090a] border-r border-slate-200 dark:border-white/10 transition-all duration-300 ease-in-out overscroll-contain
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "w-64 lg:w-72"}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-white/10 shrink-0">
          <NavLink
            to="/admin"
            className="flex items-center gap-3 group focus:outline-none"
            onClick={handleNavClick}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 p-[1px] shadow-lg shadow-black/5 dark:shadow-white/5">
              <div className="w-full h-full rounded-[11px] bg-slate-900 dark:bg-[#0e0f13] flex items-center justify-center">
                <span className="font-heading font-extrabold text-white text-base tracking-wider">T</span>
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-slate-900 dark:text-white text-base tracking-tight">TechHub</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/90 border border-slate-300 dark:border-white/15">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 -mt-0.5">Control Center</span>
              </div>
            )}
          </NavLink>

          {/* Close button for Mobile Drawer */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu with independent scrollbar & touch handling */}
        <div
          ref={navScrollRef}
          className="flex-1 overflow-y-auto overscroll-contain px-3.5 py-5 space-y-6 custom-scrollbar touch-pan-y"
        >
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {!isCollapsed && (
                <div className="px-3 text-[11px] font-mono font-medium tracking-wider text-slate-500 uppercase">
                  {section.title}
                </div>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={handleNavClick}
                      title={isCollapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-md shadow-slate-900/10 dark:shadow-white/10"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? "text-white dark:text-black" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                        }`}
                      />

                      {!isCollapsed && (
                        <>
                          <span className="truncate flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wide rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight
                            className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-600 transition-transform duration-200 opacity-0 group-hover:opacity-100 ${
                              isActive ? "opacity-100 text-white/70 dark:text-black/50" : ""
                            }`}
                          />
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Live Storefront Quick Link */}
        <div className="p-3.5 border-t border-slate-200 dark:border-white/10 shrink-0">
          <NavLink
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title="Open Storefront in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate">View Live Store</span>
                <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 font-mono">↗</span>
              </>
            )}
          </NavLink>
        </div>

        {/* Admin User Footer Profile & Interactive Logout Section */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#0b0c10] border-t border-slate-200 dark:border-white/10 shrink-0 space-y-3">
          {/* User Profile Card */}
          <div className={`flex items-center gap-2.5 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-slate-500 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-white/20 shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-heading font-bold text-slate-900 dark:text-white truncate">
                    {user?.name || "Administrator"}
                  </p>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                </div>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || "admin@techhaven.dev"}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Logout Button (Prominent & Responsive on all devices) */}
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-xs font-mono font-semibold transition-all duration-200 border cursor-pointer ${
              isCollapsed
                ? "justify-center px-0 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 border-rose-200 dark:border-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/40"
                : "bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 border-rose-200 dark:border-rose-500/25 hover:border-rose-300 dark:hover:border-rose-500/40 shadow-sm"
            }`}
            title="Logout from Admin Session"
          >
            <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            {!isCollapsed && (
              <span className="truncate">Sign Out Session</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
