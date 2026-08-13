import { Navigate } from "react-router-dom";
import type React from "react";

import { useAuth } from "../../context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't redirect until auth state is restored.
  if (isLoading) {
    return null;
  }

  // Not logged in → login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
