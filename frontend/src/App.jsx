import React, { Suspense, lazy,useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Common Utilities
import ScrollToTop from "./components/common/ScrollToTop";
import PageLoader from "./components/common/PageLoader";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import GuestRoute from "./components/routes/GuestRoute";

// Lazy-loaded route components for production performance & code splitting
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Deals = lazy(() => import("./pages/Deals"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Compare = lazy(() => import("./pages/Compare"));
const Orders = lazy(() => import("./pages/Orders"));
const CustomerOrderDetail = lazy(() => import("./pages/CustomerOrderDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const CustomerCoupons = lazy(() => import("./pages/CustomerCoupons"));
const NotFound = lazy(() => import("./components/common/NotFound"));
import CompareFloatingBar from "./components/compare/CompareFloatingBar";

import { useThemeStore } from "./store/useThemeStore";
import { useAuthStore } from "./store/useAuthStore";

// Admin Control Center (Lazy-loaded)
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminTaxonomy = lazy(() => import("./pages/admin/AdminTaxonomy"));
const AdminReturns = lazy(() => import("./pages/admin/AdminReturns"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  React.useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Production Cross-Tab Sync: If session is cleared in another tab, log out and redirect immediately
    useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "shop_auth") {
        try {
          const authData = e.newValue ? JSON.parse(e.newValue) : null;
          if (!authData || !authData.state?.isAuthenticated) {
            useAuthStore.getState().logout();
          }
        } catch {
          useAuthStore.getState().logout();
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      {/* Automatically scrolls to top on route change */}
      <ScrollToTop />

      {/* Production Suspense Boundary with Cybernetic Hardware Loader */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Storefront Routes - Landing page is Guest-Only (Redirects authenticated customers to /products, admins to /admin) */}
          <Route
            path="/"
            element={
              <GuestRoute>
                <Home />
              </GuestRoute>
            }
          />
          <Route path="/products" element={<Products />} />
          <Route path="/deals" element={<Deals />} />
          {/* Protected Customer Routes - Offers & Coupons (Redirects to /login?redirect=/offers if unauthenticated) */}
          <Route
            path="/coupons"
            element={
              <ProtectedRoute redirectTo="/login?redirect=/offers">
                <CustomerCoupons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <ProtectedRoute redirectTo="/login?redirect=/offers">
                <CustomerCoupons />
              </ProtectedRoute>
            }
          />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute redirectTo="/login">
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route path="/compare" element={<Compare />} />

          {/* Protected Customer Routes (Redirects to landing page '/' if logged out) */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute redirectTo="/">
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute redirectTo="/">
                <CustomerOrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order/:orderId"
            element={
              <ProtectedRoute redirectTo="/">
                <CustomerOrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute redirectTo="/">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute redirectTo="/">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute redirectTo="/">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute redirectTo="/">
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="/category/:categorySlug" element={<Products />} />
          <Route path="/product/:idOrSlug" element={<ProductDetails />} />

          {/* Authentication Routes (Guest-Only: Redirects to /products or /admin if already logged in) */}
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

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
            <Route path="orders/:orderId" element={<AdminOrderDetail />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="returns" element={<AdminReturns />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>

          {/* 404 Hardware Not Found Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Global Floating Product Comparison Dock */}
      <CompareFloatingBar />
    </BrowserRouter>
  );
}
