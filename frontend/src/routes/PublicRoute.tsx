import { Navigate } from "react-router-dom";
import type React from "react";

import { useAuth } from "../context/AuthContext";

type PublicRouteProps = {
  children: React.ReactNode;
};

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't make a routing decision while auth is being restored.
  if (isLoading) {
    return null;
  }

  // Already logged in → never show login/register pages.
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};
