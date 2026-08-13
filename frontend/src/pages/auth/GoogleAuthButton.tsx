import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

type GoogleAuthButtonProps = {
  onSuccess: (token: string) => void;
  disabled?: boolean;
};

export const GoogleAuthButton = ({
  onSuccess,
  disabled = false,
}: GoogleAuthButtonProps) => {
  return (
    <div
      className={`relative h-13 w-full ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 text-sm font-medium text-black transition hover:bg-black/[0.03] sm:text-base">
        <FcGoogle size={21} />

        <span>Continue with Google</span>
      </div>

      <div className="absolute inset-0 overflow-hidden rounded-full opacity-0">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (!credentialResponse.credential) {
              return;
            }

            onSuccess(credentialResponse.credential);
          }}
          onError={() => {
            console.error("Google authentication failed.");
          }}
          useOneTap={false}
          width="100%"
        />
      </div>
    </div>
  );
};
