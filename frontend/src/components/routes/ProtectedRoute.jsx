import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";


export default function ProtectedRoute({ children, requiredRole, redirectTo = "/" }) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Not logged in -> redirect to landing or login
  if (!isAuthenticated || !user) {
    let target = redirectTo;
    if (redirectTo === "/login" && location.pathname && location.pathname !== "/") {
      target = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    }
    return <Navigate to={target} replace state={{ from: location }} />;
  }

  // Role verification (e.g. customer trying to access admin dashboard)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/products"} replace />;
  }

  return children;
}
