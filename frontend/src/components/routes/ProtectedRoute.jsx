import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";


export default function ProtectedRoute({ children, requiredRole, redirectTo = "/" }) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Not logged in -> redirect to landing page
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role verification (e.g. customer trying to access admin dashboard)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/products"} replace />;
  }

  return children;
}
