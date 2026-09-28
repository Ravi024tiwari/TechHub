import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

/**
 * GuestRoute (Reverse Protected Route / Public-Only Route):
 * - If user is NOT logged in: renders children (e.g. Landing Page, Login, Signup).
 * - If user IS logged in & role === 'admin': auto-redirects to '/admin' (Admin Dashboard).
 * - If user IS logged in & role === 'customer' (or any non-admin): auto-redirects to '/products' (Shopping Catalog).
 */
export default function GuestRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated && user) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/products" replace />;
  }

  return children;
}
