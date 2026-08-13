import api from "./api";

/* =========================================================
   TYPES
========================================================= */

export type AnalyticsOverview = {
  totalClicks: number;
  uniqueVisitors: number;
  lastClicked: string | null;
  topBrowser: string;
  topOS: string;
};

export type TimelineItem = {
  date: string;
  clicks: number;
};

export type StatItem = {
  name: string;
  count: number;
};

export type AnalyticsResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

/* =========================================================
   ANALYTICS SERVICE
========================================================= */

class AnalyticsService {
  async getOverview(
    urlId: string,
  ): Promise<AnalyticsResponse<AnalyticsOverview>> {
    const response = await api.get<AnalyticsResponse<AnalyticsOverview>>(
      `/analytics/${urlId}`,
    );

    return response.data;
  }

  async getTimeline(urlId: string): Promise<AnalyticsResponse<TimelineItem[]>> {
    const response = await api.get<AnalyticsResponse<TimelineItem[]>>(
      `/analytics/${urlId}/timeline`,
    );

    return response.data;
  }

  async getBrowserStats(urlId: string): Promise<AnalyticsResponse<StatItem[]>> {
    const response = await api.get<AnalyticsResponse<StatItem[]>>(
      `/analytics/${urlId}/browser`,
    );

    return response.data;
  }

  async getOSStats(urlId: string): Promise<AnalyticsResponse<StatItem[]>> {
    const response = await api.get<AnalyticsResponse<StatItem[]>>(
      `/analytics/${urlId}/os`,
    );

    return response.data;
  }

  async getDeviceStats(urlId: string): Promise<AnalyticsResponse<StatItem[]>> {
    const response = await api.get<AnalyticsResponse<StatItem[]>>(
      `/analytics/${urlId}/device`,
    );

    return response.data;
  }

  async getReferrerStats(
    urlId: string,
  ): Promise<AnalyticsResponse<StatItem[]>> {
    const response = await api.get<AnalyticsResponse<StatItem[]>>(
      `/analytics/${urlId}/referrer`,
    );

    return response.data;
  }

  async getCountryStats(urlId: string): Promise<AnalyticsResponse<StatItem[]>> {
    const response = await api.get<AnalyticsResponse<StatItem[]>>(
      `/analytics/${urlId}/country`,
    );

    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
