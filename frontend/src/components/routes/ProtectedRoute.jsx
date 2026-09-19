import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Production-Grade Protected Route Wrapper:
 * - Checks user authentication from localStorage / auth context
 * - Preserves requested URL in query param `?redirect=` for post-login redirection
 * - Checks optional `requiredRole` (e.g. "admin") and redirects unauthorized users
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();

  // In production, user data is checked from localStorage or central auth store
  let user = null;
  try {
    const storedUser = localStorage.getItem("techhaven_user");
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    user = null;
  }

  // Not logged in -> redirect to login with return path
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Role verification (e.g. customer trying to access admin dashboard)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
