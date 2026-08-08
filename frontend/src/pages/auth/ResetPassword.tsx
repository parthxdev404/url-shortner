import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

const OTP_LENGTH = 6;

export const ResetPassword = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [error, setError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    setVerificationStatus("idle");
    setError("");

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedValue = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedValue) return;

    const newOtp = Array(OTP_LENGTH).fill("");

    pastedValue.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);
    setVerificationStatus("idle");
    setError("");

    const nextIndex = Math.min(pastedValue.length, OTP_LENGTH - 1);

    inputRefs.current[nextIndex]?.focus();
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit code.");
      return false;
    }

    const correctOtp = sessionStorage.getItem("linkforge_reset_otp");

    setLoading(true);
    setError("");
    setVerificationStatus("idle");

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!correctOtp || enteredOtp !== correctOtp) {
      setVerificationStatus("error");
      setError("Invalid verification code.");
      setLoading(false);

      return false;
    }

    setVerificationStatus("success");
    setLoading(false);

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const isOtpValid = await verifyOtp();

    if (!isOtpValid) return;

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    sessionStorage.removeItem("linkforge_reset_otp");

    sessionStorage.removeItem("linkforge_reset_email");

    console.log("Password reset successfully.");

    navigate("/login");

    setLoading(false);
  };

  const handleResend = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    sessionStorage.setItem("linkforge_reset_otp", newOtp);

    console.log("New reset OTP:", newOtp);

    setOtp(Array(OTP_LENGTH).fill(""));
    setVerificationStatus("idle");
    setError("");

    inputRefs.current[0]?.focus();
  };

  const isComplete = otp.every(Boolean);

  const getOtpInputClassName = () => {
    if (verificationStatus === "success") {
      return `
        border-green-500
        bg-green-50
        text-green-700
        focus:border-green-500
      `;
    }

    if (verificationStatus === "error") {
      return `
        border-red-500
        bg-red-50
        text-red-600
        focus:border-red-500
      `;
    }

    return `
      border-black/10
      bg-black/[0.02]
      text-black
      focus:border-black
      focus:bg-white
    `;
  };

  return (
    <div className="min-h-screen bg-white px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center">
        <div className="grid w-full grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/40">
              LinkForge
            </p>

            <h1 className="mt-5 max-w-xl text-6xl font-bold leading-[1.02] tracking-tight text-black xl:text-7xl">
              Create a new password.
              <span className="block text-black/35">Get back in control.</span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-relaxed text-black/50">
              Verify your account and create a new secure password to regain
              access to your LinkForge account.
            </p>

            <div className="mt-10 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-black" />

              <span className="text-sm font-medium text-black/50">
                Almost there. One last step.
              </span>
            </div>
          </div>

          <div className="w-full">
            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
              {/* Header */}

              <div className="text-center lg:text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/40">
                  Password recovery
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl">
                  Reset your password.
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-black/50 sm:text-base">
                  Enter the verification code and choose a new password for your
                  account.
                </p>
              </div>

              <div className="mt-8">
                <label className="mb-3 block text-sm font-medium text-black/70">
                  Verification code
                </label>

                <div className="flex justify-center gap-2.5 sm:gap-3.5 lg:justify-start">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      disabled={loading}
                      aria-label={`OTP digit ${index + 1}`}
                      className={`
                        h-12
                        w-10
                        rounded-xl
                        border
                        text-center
                        text-lg
                        font-semibold
                        outline-none
                        transition-all
                        duration-200
                        sm:h-14
                        sm:w-12
                        sm:text-xl
                        ${getOtpInputClassName()}
                        disabled:cursor-not-allowed
                        disabled:opacity-70
                      `}
                    />
                  ))}
                </div>

                {verificationStatus === "success" && (
                  <p className="mt-3 text-sm font-medium text-green-600">
                    Verification code confirmed.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-black/70"
                >
                  New password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  placeholder={
                    verificationStatus === "success"
                      ? "Create a new password"
                      : "Verify OTP first"
                  }
                  autoComplete="new-password"
                  disabled={verificationStatus !== "success" || loading}
                  className="
    h-13
    w-full
    rounded-xl
    border
    border-black/10
    bg-black/[0.02]
    px-4
    text-sm
    outline-none
    transition
    placeholder:text-black/35
    focus:border-black
    focus:bg-white
    disabled:cursor-not-allowed
    disabled:bg-black/[0.04]
    disabled:text-black/30
    disabled:opacity-60
    sm:text-base
  "
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-black/70"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder={
                    verificationStatus === "success"
                      ? "Confirm your new password"
                      : "Verify OTP first"
                  }
                  autoComplete="new-password"
                  disabled={verificationStatus !== "success" || loading}
                  className="
    h-13
    w-full
    rounded-xl
    border
    border-black/10
    bg-black/[0.02]
    px-4
    text-sm
    outline-none
    transition
    placeholder:text-black/35
    focus:border-black
    focus:bg-white
    disabled:cursor-not-allowed
    disabled:bg-black/[0.04]
    disabled:text-black/30
    disabled:opacity-60
    sm:text-base
  "
                />
              </div>

              {error && (
                <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={!isComplete || loading}
                className="
                  mt-7
                  flex
                  h-13
                  w-full
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-full
                  bg-black
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-black/80
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:bg-black/20
                  sm:text-base
                "
              >
                {loading ? "Resetting password..." : "Reset Password"}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-black/50">
                  Didn't receive the code?
                </p>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="
                    mt-1
                    cursor-pointer
                    text-sm
                    font-semibold
                    text-black
                    hover:underline
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Resend code
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-black/50">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-black hover:underline"
                >
                  Back to Login
                </Link>
              </p>

              <p className="mt-7 text-center text-xs leading-relaxed text-black/30">
                Your new password should be at least 8 characters long.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
