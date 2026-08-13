import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { tokenStorage } from "../utils/token";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

api.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
      {
        refreshToken,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data?.data;

    if (!data?.accessToken || !data?.refreshToken) {
      return null;
    }

    tokenStorage.setTokens(data.accessToken, data.refreshToken);

    return data.accessToken;
  } catch {
    tokenStorage.clearTokens();

    return null;
  }
};

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh")) {
      tokenStorage.clearTokens();

      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      tokenStorage.clearTokens();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing && refreshPromise) {
      const newAccessToken = await refreshPromise;

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    }

    isRefreshing = true;

    refreshPromise = refreshAccessToken();

    try {
      const newAccessToken = await refreshPromise;

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  },
);

export default api;
