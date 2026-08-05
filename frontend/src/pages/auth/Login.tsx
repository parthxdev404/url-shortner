import React, { useState } from "react";
import LoginImg from "../../assets/Computer login-bro.png";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import type { FormErrors, LoginData } from "../../types/auth.types";

export const Login = () => {
  const [formData, setFormData] = useState<LoginData>({
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

    if (formData.email.trim() === "") {
      newErrors.email = "Email Required";
    }
    if (formData.password.trim() === "") {
      newErrors.password = "Password Required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length < 0) return;
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center font-[Poppins] bg-white px-4 sm:px-6 lg:px-12 py-8 gap-8 lg:gap-12">
      <div className="w-full lg:w-[45%] flex justify-center">
        <form
          onSubmit={submitHandler}
          className="w-full max-w-2xl border-4 shadow-lg p-5 sm:p-6 md:p-8 flex flex-col gap-5 bg-white"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
            Welcome Back{" "}
          </h1>

          <button
            type="button"
            className="w-full cursor-pointer bg-black text-white py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium hover:bg-neutral-800 transition flex items-center justify-center gap-3"
          >
            <FcGoogle size={22} />
            <span>Log In with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="h-px flex-1 bg-gray-300"></div>
          </div>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Your Email"
            className="w-full border-b-2 p-3 sm:p-4 text-sm sm:text-base lg:text-lg outline-none focus:border-black transition"
          />
          <span className="text-red-600 px-4">{errors.email}</span>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter Your Password"
            className="w-full border-b-2 p-3 sm:p-4 text-sm sm:text-base lg:text-lg outline-none focus:border-black transition"
          />
          <span className="text-red-600 px-4">{errors.password}</span>

          <Link to="/forgot-password" className="text-end font-medium">
            forgot password
          </Link>
          <button
            type="submit"
            className="w-full cursor-pointer bg-black text-white py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-neutral-800 transition"
          >
            Lessgoooooo
          </button>

          <p className="text-center text-sm sm:text-base text-gray-600">
            Haven't Created An Account Yet ?{" "}
            <Link to="/register" className="font-semibold hover:underline">
              SignUp
            </Link>
          </p>
        </form>
      </div>
      <div className="flex justify-center items-center w-full lg:w-[55%]">
        <img
          src={LoginImg}
          alt="Sign Up"
          className="w-4/5 sm:w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl xl:max-w-2xl h-auto object-contain"
        />
      </div>
    </div>
  );
};
