import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";

const OTP_LENGTH = 6;

export const VerifyEmail = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));

  const [loading, setLoading] = useState(false);

  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    setVerificationStatus("idle");

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

    const nextIndex = Math.min(pastedValue.length, OTP_LENGTH - 1);

    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== OTP_LENGTH) {
      return;
    }

    const correctOtp = sessionStorage.getItem("linkforge_otp");

    setLoading(true);
    setVerificationStatus("idle");

    // Temporary delay until real API is connected
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!correctOtp) {
      setVerificationStatus("error");
      setLoading(false);
      return;
    }

    if (enteredOtp === correctOtp) {
      setVerificationStatus("success");

      // OTP is no longer needed
      sessionStorage.removeItem("linkforge_otp");

      // Give the user a moment to see success state
      setTimeout(() => {
        navigate("/login");
      }, 700);
    } else {
      setVerificationStatus("error");
    }

    setLoading(false);
  };

  /*
   * -----------------------------------------
   * Resend OTP
   * -----------------------------------------
   */
  const handleResend = () => {
    // Temporary implementation.
    // Real API will generate/send a new OTP.
    console.log("Resend OTP");

    setOtp(Array(OTP_LENGTH).fill(""));
    setVerificationStatus("idle");

    inputRefs.current[0]?.focus();
  };

  const isComplete = otp.every(Boolean);

  /*
   * -----------------------------------------
   * OTP input styles
   * -----------------------------------------
   */
  const getInputClassName = () => {
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
              One more step.
              <span className="block text-black/35">Verify your email.</span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-relaxed text-black/50">
              We sent a 6-digit verification code to your email. Confirm your
              email address to continue using LinkForge.
            </p>

            <div className="mt-10 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-black" />

              <span className="text-sm font-medium text-black/50">
                Your account is almost ready.
              </span>
            </div>
          </div>
          <div className="w-full">
            <div className="mx-auto w-full max-w-md">
              {/* Header */}
              <div className="text-center lg:text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/40">
                  Email verification
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl">
                  Verify your email.
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-black/50 sm:text-base">
                  Enter the 6-digit verification code sent to your email
                  address.
                </p>
              </div>
              <div className="mt-9 flex justify-center gap-2.5 sm:gap-3.5 lg:justify-start">
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
                    aria-label={`OTP digit ${index + 1}`}
                    disabled={loading}
                    className={`
                      h-12 w-10
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
                      ${getInputClassName()}
                      disabled:cursor-not-allowed
                      disabled:opacity-70
                    `}
                  />
                ))}
              </div>

              {verificationStatus === "success" && (
                <p className="mt-4 text-center text-sm font-medium text-green-600 lg:text-left">
                  Email verified successfully!
                </p>
              )}

              {verificationStatus === "error" && (
                <p className="mt-4 text-center text-sm font-medium text-red-600 lg:text-left">
                  Invalid or expired verification code.
                </p>
              )}

              <button
                type="button"
                disabled={!isComplete || loading}
                onClick={handleSubmit}
                className={`
                  mt-8
                  flex
                  h-13
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  px-6
                  text-sm
                  font-semibold
                  transition-all
                  duration-200
                  sm:text-base
                  ${
                    verificationStatus === "success"
                      ? "bg-green-600 text-white"
                      : "bg-black text-white hover:bg-black/80"
                  }
                  disabled:cursor-not-allowed
                  disabled:bg-black/20
                `}
              >
                {loading
                  ? "Verifying..."
                  : verificationStatus === "success"
                    ? "Verified!"
                    : "Verify Email"}
              </button>

              <div className="mt-7 text-center">
                <p className="text-sm text-black/50">
                  Didn't receive the code?
                </p>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="mt-1 cursor-pointer text-sm font-semibold text-black transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>

              <p className="mt-8 text-center text-xs leading-relaxed text-black/30">
                Check your spam or promotions folder if you don't see the email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
