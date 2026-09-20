import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

/**
 * Production-Grade Protected Route Wrapper:
 * - Checks reactive user authentication directly from Zustand store
 * - Rehydrates instantly (0ms) from localStorage on refresh
 * - Preserves requested URL in query param `?redirect=` for post-login redirection
 * - Checks optional `requiredRole` (e.g. "admin") and redirects unauthorized users
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Not logged in -> redirect to login with return path
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Role verification (e.g. customer trying to access admin dashboard)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
