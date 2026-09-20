import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Common Utilities
import ScrollToTop from "./components/common/ScrollToTop";
import PageLoader from "./components/common/PageLoader";

// Lazy-loaded route components for production performance & code splitting
const Home = lazy(() => import("./pages/Home"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Deals = lazy(() => import("./pages/Deals"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./components/common/NotFound"));

export default function App() {
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

          {/* 404 Hardware Not Found Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
