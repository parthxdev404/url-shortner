import React, { useState } from "react";
import SignUpImg from "../../assets/Signup.png";
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
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center font-[Poppins] bg-white px-4 sm:px-6 lg:px-12 py-8 gap-8 lg:gap-12">
      <div className="flex justify-center items-center w-full lg:w-[55%]">
        <img
          src={SignUpImg}
          alt="Sign Up"
          className="w-4/5 sm:w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl xl:max-w-2xl h-auto object-contain"
        />
      </div>

      <div className="w-full lg:w-[45%] flex justify-center">
        <form
          onSubmit={submitHandler}
          className="w-full max-w-2xl border-4 shadow-lg p-5 sm:p-6 md:p-8 flex flex-col gap-5 bg-white"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
            CREATE YOUR ACCOUNT
          </h1>

          <button
            type="button"
            className="w-full cursor-pointer bg-black text-white py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium hover:bg-neutral-800 transition flex items-center justify-center gap-3"
          >
            <FcGoogle size={22} />
            <span>Sign Up with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="h-px flex-1 bg-gray-300"></div>
          </div>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Your Name"
            className="w-full border-b-2 p-3 sm:p-4 text-sm sm:text-base lg:text-lg outline-none focus:border-black transition"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Your Email"
            className="w-full border-b-2 p-3 sm:p-4 text-sm sm:text-base lg:text-lg outline-none focus:border-black transition"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter Your Password"
            className="w-full border-b-2 p-3 sm:p-4 text-sm sm:text-base lg:text-lg outline-none focus:border-black transition"
          />
          <span className="text-red-600">{errors.password}</span>
          <button
            type="submit"
            className="w-full cursor-pointer bg-black text-white py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-neutral-800 transition"
          >
            JOIN NOW
          </button>

          <p className="text-center text-sm sm:text-base text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
