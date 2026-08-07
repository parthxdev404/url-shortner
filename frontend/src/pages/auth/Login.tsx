import React, { useState } from "react";
import LoginImg from "../../assets/Computer login-bro.png";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import type { FormErrors } from "../../types/auth.types";

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    let newErrors: FormErrors = {};

    if (formData.email.trim() === "") {
      newErrors.email = "Email is required";
    }

    if (formData.password.trim() === "") {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // Login API call goes here
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-5 py-16 sm:px-8 lg:px-12">
      <div className="grid w-full max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20 xl:gap-28">
        {/* Left — Login Form */}
        <div className="order-2 w-full lg:order-1">
          <form onSubmit={submitHandler} className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="text-center lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/40">
                Welcome back
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-5xl">
                Log in to LinkForge.
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-black/50 sm:text-base">
                Access your links, analytics, and everything you manage with
                LinkForge.
              </p>
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="mt-8 flex h-13 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 text-sm font-medium text-black transition hover:bg-black/[0.03] sm:text-base"
            >
              <FcGoogle size={21} />
              <span>Continue with Google</span>
            </button>

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
              className="mt-7 flex h-13 w-full cursor-pointer items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/80 active:scale-[0.99] sm:text-base"
            >
              Log In
            </button>

            {/* Signup */}
            <p className="mt-6 text-center text-sm text-black/50 sm:text-base">
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

        {/* Right — Illustration */}
        <div className="order-1 hidden items-center justify-center lg:order-2 lg:flex">
          <div className="relative flex w-full items-center justify-center">
            <img
              src={LoginImg}
              alt="Login to LinkForge"
              className="h-auto w-full max-w-md object-contain xl:max-w-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
