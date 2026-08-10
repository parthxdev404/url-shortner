import React, { createContext, useContext, useEffect, useState } from "react";

import {
  authService,
  type ForgotPasswordPayload,
  type LoginPayload,
  type RegisterPayload,
  type ResetPasswordPayload,
  type User,
  type VerifyEmailPayload,
  type ResendVerificationOtpPayload,
} from "../services/authService";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  register: (payload: RegisterPayload) => Promise<void>;

  login: (payload: LoginPayload) => Promise<void>;

  verifyEmail: (payload: VerifyEmailPayload) => Promise<void>;

  resendVerificationOtp: (
    payload: ResendVerificationOtpPayload,
  ) => Promise<void>;

  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;

  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;

  refreshAuth: () => Promise<void>;

  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "linkforge_access_token";
const REFRESH_TOKEN_KEY = "linkforge_refresh_token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const register = async (payload: RegisterPayload): Promise<void> => {
    await authService.register(payload);
  };

  const login = async (payload: LoginPayload): Promise<void> => {
    const response = await authService.login(payload);

    const { accessToken, refreshToken, user } = response.data;

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    setUser(user);
  };

  const verifyEmail = async (payload: VerifyEmailPayload): Promise<void> => {
    await authService.verifyEmail(payload);
  };

  const resendVerificationOtp = async (
    payload: ResendVerificationOtpPayload,
  ): Promise<void> => {
    await authService.resendVerificationOtp(payload);
  };

  const forgotPassword = async (
    payload: ForgotPasswordPayload,
  ): Promise<void> => {
    await authService.forgotPassword(payload);
  };

  const resetPassword = async (
    payload: ResetPasswordPayload,
  ): Promise<void> => {
    await authService.resetPassword(payload);
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      // No tokens means the user is logged out.
      if (!accessToken && !refreshToken) {
        setUser(null);
        return;
      }

      // First try the existing access token.
      if (accessToken) {
        try {
          const response = await authService.me();

          setUser(response.data);

          return;
        } catch {
          // Access token may have expired.
          // Continue to refresh-token flow.
        }
      }

      if (!refreshToken) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);

        setUser(null);

        return;
      }

      const response = await authService.refreshToken({
        refreshToken,
      });

      const newAccessToken = response.data.accessToken;

      const newRefreshToken = response.data.refreshToken;

      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

      const meResponse = await authService.me();

      setUser(meResponse.data);
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);

      setUser(null);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (user) {
        await authService.logout();
      }
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);

      setUser(null);
    }
  };

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        await refreshAuth();
      } finally {
        setIsLoading(false);
      }
    };

    void restoreAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,

        register,
        login,
        verifyEmail,
        resendVerificationOtp,
        forgotPassword,
        resetPassword,

        refreshAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
