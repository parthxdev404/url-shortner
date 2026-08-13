import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import LoginImg from "../../assets/Computer login-bro.png";
import type { FormErrors } from "../../types/auth.types";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { useAuth } from "../../context/AuthContext";

export const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleGoogleLogin = async (token: string) => {
    try {
      setIsGoogleLoading(true);

      await googleLogin(token);

      navigate("/", {
        replace: true,
      });
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const message =
        axiosError.response?.data?.message ??
        (error instanceof Error
          ? error.message
          : "Google login failed. Please try again.");

      setErrors({
        password: message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsLoading(true);

      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate("/", {
        replace: true,
      });
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const message =
        axiosError.response?.data?.message ??
        (error instanceof Error
          ? error.message
          : "Unable to log in. Please try again.");

      setErrors({
        password: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const authLoading = isLoading || isGoogleLoading;

  return (
    <div className="min-h-screen bg-white px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Login Form */}
          <div className="order-2 lg:order-1">
            <form onSubmit={submitHandler} className="mx-auto w-full max-w-xl">
              {/* Header */}
              <div>
                <span className="text-sm font-semibold text-black/50">
                  Welcome back
                </span>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-5xl">
                  Log in to LinkForge.
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-black/50 sm:text-base">
                  Access your links, analytics, and everything you manage with
                  LinkForge.
                </p>
              </div>

              {/* Google */}
              <div className="mt-8">
                <GoogleAuthButton
                  onSuccess={handleGoogleLogin}
                  disabled={authLoading}
                />
              </div>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-black/10" />

                <span className="text-xs font-medium text-black/35">OR</span>

                <div className="h-px flex-1 bg-black/10" />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-black/70"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={authLoading}
                  className={`h-13 w-full rounded-xl border bg-black/[0.02] px-4 text-sm text-black outline-none transition placeholder:text-black/35 focus:bg-white sm:text-base ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-black/10 focus:border-black"
                  }`}
                />

                {errors.email && (
                  <p className="mt-2 text-xs font-medium text-red-600 sm:text-sm">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-black/70"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-black/50 transition hover:text-black hover:underline sm:text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>

                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={authLoading}
                  className={`h-13 w-full rounded-xl border bg-black/[0.02] px-4 text-sm text-black outline-none transition placeholder:text-black/35 focus:bg-white sm:text-base ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-black/10 focus:border-black"
                  }`}
                />

                {errors.password && (
                  <p className="mt-2 text-xs font-medium text-red-600 sm:text-sm">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={authLoading}
                className="mt-7 flex h-13 w-full cursor-pointer items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/80 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>

              {/* Register */}
              <p className="mt-6 text-center text-sm text-black/50">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-black hover:underline"
                >
                  Create one
                </Link>
              </p>
            </form>
          </div>

          {/* Illustration */}
          <div className="order-1 hidden items-center justify-center lg:order-2 lg:flex">
            <div className="flex w-full items-center justify-center">
              <img
                src={LoginImg}
                alt="Login to LinkForge"
                className="h-auto w-full max-w-md object-contain xl:max-w-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
