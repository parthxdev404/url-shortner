import api from "./api";

export type DashboardStats = {
  totalUrls: number;
  activeUrls: number;
  inactiveUrls: number;
  expiredUrls: number;
  deletedUrls: number;
  totalClicks: number;
};

export type DashboardUrl = {
  originalUrl: string;
  shortCode: string;
  clicks: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export type DashboardData = {
  stats: DashboardStats;
  recentUrls: DashboardUrl[];
  topUrls: DashboardUrl[];
};

type DashboardApiResponse = {
  success: boolean;
  data?: DashboardData;
  message?: string;
};

export const dashboardService = {
  getDashboard: async (): Promise<DashboardApiResponse> => {
    const response = await api.get<DashboardApiResponse>("/dashboard");

    return response.data;
  },
};
