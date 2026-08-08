import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      // Temporary OTP until backend is connected
      const otp = generateOtp();

      sessionStorage.setItem("linkforge_reset_otp", otp);

      sessionStorage.setItem("linkforge_reset_email", email);

      // Development only
      console.log("Password reset OTP:", otp);

      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 500));

      navigate("/reset-password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center">
        <div className="grid w-full grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Left Content */}
          <div className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/40">
              LinkForge
            </p>

            <h1 className="mt-5 max-w-xl text-6xl font-bold leading-[1.02] tracking-tight text-black xl:text-7xl">
              Forgot your password?
              <span className="block text-black/35">We can fix that.</span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-relaxed text-black/50">
              Enter the email address associated with your LinkForge account and
              we'll help you get back in.
            </p>

            <div className="mt-10 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-black" />

              <span className="text-sm font-medium text-black/50">
                Secure account recovery.
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="w-full">
            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
              {/* Header */}
              <div className="text-center lg:text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/40">
                  Account recovery
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl">
                  Reset your password.
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-black/50 sm:text-base">
                  Enter your email and we'll send you a verification code.
                </p>
              </div>

              {/* Email */}
              <div className="mt-8">
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="h-13 w-full rounded-xl border border-black/10 bg-black/[0.02] px-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white sm:text-base"
                />

                {error && (
                  <p className="mt-2 text-xs font-medium text-red-600 sm:text-sm">
                    {error}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-7 flex h-13 w-full cursor-pointer items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/80 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-black/20 sm:text-base"
              >
                {loading ? "Sending code..." : "Send Verification Code"}
              </button>

              {/* Back to Login */}
              <p className="mt-6 text-center text-sm text-black/50">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-black hover:underline"
                >
                  Back to Login
                </Link>
              </p>

              {/* Footer */}
              <p className="mt-8 text-center text-xs leading-relaxed text-black/30">
                If an account exists with this email, you'll receive a
                verification code.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
