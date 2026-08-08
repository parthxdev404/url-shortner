import { Route, Routes } from "react-router-dom";
import { Login } from "../pages/auth/Login";
import { SignUp } from "../pages/auth/SignUp";
import { HomeRouter } from "../pages/HomeRouter";
import { VerifyEmail } from "../pages/auth/VerifyEmail";
import { ForgotPassword } from "../pages/auth/ForgotPassword";
import { ResetPassword } from "../pages/auth/ResetPassword";

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRouter />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
};
