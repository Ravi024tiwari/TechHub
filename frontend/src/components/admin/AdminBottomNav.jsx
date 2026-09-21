import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Menu,
} from "lucide-react";

export default function AdminBottomNav({ setIsMobileOpen }) {
  const location = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      to: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Products",
      to: "/admin/products",
      icon: Package,
    },
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
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090a]/90 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 transition-all shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 select-none relative group ${
                isActive
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {/* Active Glow Indicator */}
              {isActive && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
              )}

              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? "scale-110 text-white" : "group-hover:scale-105"
                }`}
              />
              <span
                className={`text-[10px] font-mono tracking-tight mt-1 leading-none ${
                  isActive ? "font-bold text-white" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* More / Menu Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-slate-400 hover:text-white transition-all select-none group"
          aria-label="Open full admin menu"
        >
          <Menu className="w-5 h-5 transition-transform group-hover:scale-105" />
          <span className="text-[10px] font-mono tracking-tight mt-1 leading-none font-medium">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
