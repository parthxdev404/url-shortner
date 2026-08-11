import { Route, Routes } from "react-router-dom";

import { Login } from "../pages/auth/Login";
import { SignUp } from "../pages/auth/SignUp";
import { HomeRouter } from "../pages/HomeRouter";
import { VerifyEmail } from "../pages/auth/VerifyEmail";
import { ForgotPassword } from "../pages/auth/ForgotPassword";
import { ResetPassword } from "../pages/auth/ResetPassword";
import { Settings } from "../pages/Settings";
import { Urls } from "../pages/url/UrlPage";
import { PublicRoute } from "./PublicRoute";
import { ProtectedRoute } from "../pages/auth/ProtectedRoute";
import { CreateLink } from "../components/url/CreateLink";

export const Router = () => {
  return (
    <Routes>
      {/* =========================
          PUBLIC AUTH ROUTES
      ========================= */}

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />

      <Route
        path="/verify-email"
        element={
          <PublicRoute>
            <VerifyEmail />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* =========================
          PROTECTED APPLICATION
      ========================= */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomeRouter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateLink />
          </ProtectedRoute>
        }
      />
      <Route path="/urls" element={<Urls />} />
    </Routes>
  );
};
