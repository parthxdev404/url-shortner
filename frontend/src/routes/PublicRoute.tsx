import { Navigate } from "react-router-dom";
import type React from "react";

import { useAuth } from "../context/AuthContext";

type PublicRouteProps = {
  children: React.ReactNode;
};

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait until authentication state has been restored.
  if (isLoading) {
    return null;
  }

  // Logged-in users should never see auth pages.
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};
