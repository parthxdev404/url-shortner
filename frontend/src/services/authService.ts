import api from "./api";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type VerifyEmailPayload = {
  email: string;
  otp: string;
};

export type ResendVerificationOtpPayload = {
  email: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  password: string;
};

export type RefreshTokenPayload = {
  refreshToken: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  lastLogin: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const authService = {
  // Register
  async register(payload: RegisterPayload): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>(
      "/auth/register",
      payload,
    );

    return response.data;
  },

  async verifyEmail(
    payload: VerifyEmailPayload,
  ): Promise<ApiResponse<undefined>> {
    const response = await api.post<ApiResponse<undefined>>(
      "/auth/verify-email",
      payload,
    );

    return response.data;
  },

  async resendVerificationOtp(
    payload: ResendVerificationOtpPayload,
  ): Promise<ApiResponse<undefined>> {
    const response = await api.post<ApiResponse<undefined>>(
      "/auth/resend-verification-otp",
      payload,
    );

    return response.data;
  },

  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      payload,
    );

    return response.data;
  },

  async me(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>("/auth/me");

    return response.data;
  },

  async refreshToken(
    payload: RefreshTokenPayload,
  ): Promise<ApiResponse<RefreshTokenResponse>> {
    const response = await api.post<ApiResponse<RefreshTokenResponse>>(
      "/auth/refresh",
      payload,
    );

    return response.data;
  },

  async logout(): Promise<ApiResponse<undefined>> {
    const response = await api.post<ApiResponse<undefined>>("/auth/logout");

    return response.data;
  },

  async forgotPassword(
    payload: ForgotPasswordPayload,
  ): Promise<ApiResponse<undefined>> {
    const response = await api.post<ApiResponse<undefined>>(
      "/auth/forgot-password",
      payload,
    );

    return response.data;
  },

  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<ApiResponse<undefined>> {
    const response = await api.post<ApiResponse<undefined>>(
      "/auth/reset-password",
      payload,
    );

    return response.data;
  },
};
