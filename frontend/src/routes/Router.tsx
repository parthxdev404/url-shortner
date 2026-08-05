import { Route, Routes } from "react-router-dom";
import { Login } from "../pages/auth/Login";
import { SignUp } from "../pages/auth/SignUp";
import { Landing } from "../pages/landing/Landing";

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};
