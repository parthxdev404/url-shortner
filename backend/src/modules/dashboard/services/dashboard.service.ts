import { dashboardRepository } from '../repository/dashboard.repository';

export type DashboardStats = {
  totalUrls: number;
  activeUrls: number;
  inactiveUrls: number;
  expiredUrls: number;
  deletedUrls: number;
  totalClicks: number;
};

export class DashboardService {
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    return dashboardRepository.getDashboardStats(userId);
  }
  async getRecentUrls(userId: string) {
    return dashboardRepository.getRecentUrls(userId);
  }

  async getTopUrls(userId: string) {
    return dashboardRepository.getTopUrls(userId);
  }

  async getDashboard(userId: string) {
    const [stats, recentUrls, topUrls] = await Promise.all([
      this.getDashboardStats(userId),
      this.getRecentUrls(userId),
      this.getTopUrls(userId),
    ]);

    return {
      stats,
      recentUrls,
      topUrls,
    };
  }
}

export const dashboardService = new DashboardService();
