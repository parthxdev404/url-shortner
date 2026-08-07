import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import type { FormErrors, RegisterData } from "../../types/auth.types";

export const SignUp = () => {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    let newErrors: FormErrors = {};
    if (!formData.name || !formData.email || !formData.password) {
      alert("All Fields are Required");
      return;
    }
    if (formData.password.length < 8) {
      newErrors.password = "Password Must Be 8 Characters Long";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-5 py-16 sm:px-8 lg:px-12">
      <div className="grid w-full max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
        {/* Left Content */}
        <div className="hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/40">
            Welcome to LinkForge
          </p>

          <h1 className="mt-5 max-w-xl text-6xl font-bold leading-[1.02] tracking-tight text-black xl:text-7xl">
            Your links.
            <span className="block text-black/35">Your control.</span>
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-relaxed text-black/50">
            Create powerful short links, manage everything from one place, and
            understand exactly how your links are performing.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-black" />
            <span className="text-sm font-medium text-black/50">
              Free forever. No credit card required.
            </span>
          </div>
        </div>

        {/* Signup Form */}
        <div className="w-full">
          <form onSubmit={submitHandler} className="mx-auto w-full max-w-md">
            {/* Mobile Logo / Heading */}
            <div className="text-center lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/40">
                Create your account
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl">
                Get started with LinkForge.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-black/50 sm:text-base">
                Create your account and start shortening links instantly.
              </p>
            </div>

            {/* Google */}
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

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-black/70"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="h-13 w-full rounded-xl border border-black/10 bg-black/[0.02] px-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white sm:text-base"
              />
            </div>

            {/* Email */}
            <div className="mt-5">
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
                className="h-13 w-full rounded-xl border border-black/10 bg-black/[0.02] px-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white sm:text-base"
              />
            </div>

            {/* Password */}
            <div className="mt-5">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-black/70"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="h-13 w-full rounded-xl border border-black/10 bg-black/[0.02] px-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white sm:text-base"
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
              Create Account
            </button>

            {/* Login */}
            <p className="mt-6 text-center text-sm text-black/50">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-black hover:underline"
              >
                Login
              </Link>
            </p>

            <p className="mt-5 text-center text-xs leading-relaxed text-black/30">
              By creating an account, you agree to our terms and conditions.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
