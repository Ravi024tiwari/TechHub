import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminBottomNav from "./AdminBottomNav";

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // /admin/products features a dedicated internal dual-pane stream (Fixed Filter Sidebar + Products Scroll)
  const isProductsPage = location.pathname === "/admin/products";

  return (
    <div className="h-screen overflow-hidden bg-slate-100 dark:bg-[#08090a] text-slate-900 dark:text-white flex transition-colors duration-300 select-none lg:select-auto">
      {/* Sidebar (Desktop Fixed & Mobile Drawer with isolated wheel events) */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area: Fixed to viewport height so window never scrolls */}
      <div
        className={`flex-1 flex flex-col h-screen min-h-0 min-w-0 transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {/* Admin Header (Pinned at top, shrink-0) */}
        <AdminHeader
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Dynamic Nested Page Content with independent scroll viewport */}
        <main
          id="admin-main-viewport"
          className={`flex-1 w-full px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-4 pb-24 lg:pb-6 transition-all duration-300 flex flex-col min-h-0 ${
            isProductsPage
              ? "h-[calc(100vh-4rem)] overflow-hidden"
              : "h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain custom-scrollbar touch-pan-y"
          }`}
        >
          <Outlet context={{ isCollapsed, setIsCollapsed }} />
        </main>

        {/* Mobile & Tablet App-style Bottom Navigation Dock */}
        <AdminBottomNav setIsMobileOpen={setIsMobileOpen} />
      </div>
    </div>
  );
}
