import { Route, Routes } from "react-router-dom";

import { Login } from "../pages/auth/Login";
import { SignUp } from "../pages/auth/SignUp";
import { HomeRouter } from "../pages/HomeRouter";
import { VerifyEmail } from "../pages/auth/VerifyEmail";
import { ForgotPassword } from "../pages/auth/ForgotPassword";
import { ResetPassword } from "../pages/auth/ResetPassword";

import { ProtectedRoute } from "../pages/auth/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

export const Router = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-sm font-medium text-black/50">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomeRouter />
          </ProtectedRoute>
        }
      />

      <Route path="/register" element={<SignUp />} />

      <Route path="/login" element={<Login />} />

      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
};
