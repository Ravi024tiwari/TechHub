import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Common Utilities
import ScrollToTop from "./components/common/ScrollToTop";
import PageLoader from "./components/common/PageLoader";
import ProtectedRoute from "./components/routes/ProtectedRoute";

// Lazy-loaded route components for production performance & code splitting
const Home = lazy(() => import("./pages/Home"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Deals = lazy(() => import("./pages/Deals"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./components/common/NotFound"));

import { useThemeStore } from "./store/useThemeStore";

// Admin Control Center (Lazy-loaded)
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminTaxonomy = lazy(() => import("./pages/admin/AdminTaxonomy"));

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  React.useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      {/* Automatically scrolls to top on route change */}
      <ScrollToTop />

      {/* Production Suspense Boundary with Cybernetic Hardware Loader */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Home />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/category/:categorySlug" element={<Home />} />
          <Route path="/product/:idOrSlug" element={<ProductDetails />} />

          {/* Authentication Routes (Aliases for ease of access) */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Control Center */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="taxonomy" element={<AdminTaxonomy />} />
            <Route path="categories" element={<Navigate to="/admin/taxonomy" replace />} />
            <Route path="brands" element={<Navigate to="/admin/taxonomy?tab=brands" replace />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="inventory" element={<AdminInventory />} />
          </Route>

          {/* 404 Hardware Not Found Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
