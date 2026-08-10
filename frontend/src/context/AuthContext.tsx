import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService, type User } from "../services/authService";
import { tokenStorage } from "../utils/token";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (payload: { email: string; password: string }) => Promise<void>;

  register: (payload: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;

  verifyEmail: (payload: { email: string; otp: string }) => Promise<void>;

  resendVerificationOtp: (email: string) => Promise<void>;

  forgotPassword: (email: string) => Promise<void>;

  resetPassword: (payload: {
    email: string;
    otp: string;
    password: string;
  }) => Promise<void>;

  refreshAuthToken: () => Promise<boolean>;

  logout: () => Promise<void>;

  fetchCurrentUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const accessToken = tokenStorage.getAccessToken();

      if (!accessToken) {
        setUser(null);
        return;
      }

      const response = await authService.me();

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await fetchCurrentUser();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    const response = await authService.login(payload);

    if (!response.success || !response.data) {
      throw new Error(response.message || "Unable to log in.");
    }

    const { accessToken, refreshToken, user: loggedInUser } = response.data;

    tokenStorage.setTokens(accessToken, refreshToken);

    setUser(loggedInUser);
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await authService.register(payload);

    if (!response.success) {
      throw new Error(response.message || "Unable to register.");
    }
  };

  const verifyEmail = async (payload: { email: string; otp: string }) => {
    const response = await authService.verifyEmail(payload);

    if (!response.success) {
      throw new Error(response.message || "Unable to verify email.");
    }
  };

  const resendVerificationOtp = async (email: string) => {
    const response = await authService.resendVerificationOtp({
      email,
    });

    if (!response.success) {
      throw new Error(
        response.message || "Unable to resend verification code.",
      );
    }
  };

  const forgotPassword = async (email: string) => {
    const response = await authService.forgotPassword({
      email,
    });

    if (!response.success) {
      throw new Error(
        response.message || "Unable to send password reset code.",
      );
    }
  };

  const resetPassword = async (payload: {
    email: string;
    otp: string;
    password: string;
  }) => {
    const response = await authService.resetPassword(payload);

    if (!response.success) {
      throw new Error(response.message || "Unable to reset password.");
    }
  };

  const refreshAuthToken = async (): Promise<boolean> => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      const response = await authService.refreshToken({
        refreshToken,
      });

      if (!response.success || !response.data) {
        tokenStorage.clearTokens();
        setUser(null);

        return false;
      }

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      tokenStorage.setTokens(accessToken, newRefreshToken);

      return true;
    } catch {
      tokenStorage.clearTokens();
      setUser(null);

      return false;
    }
  };

  const logout = async () => {
    try {
      if (tokenStorage.getAccessToken()) {
        await authService.logout();
      }
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,

    login,
    register,
    verifyEmail,
    resendVerificationOtp,
    forgotPassword,
    resetPassword,
    refreshAuthToken,
    logout,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};
