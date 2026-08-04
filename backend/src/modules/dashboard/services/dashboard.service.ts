import { dashboardRepository } from '../repository/dashboard.repository';
import { cacheService } from '../../../shared/cache/cache.service';
import { CACHE_KEYS } from '../../../shared/cache/cache.key';
import { CACHE_TTL } from '../../../shared/cache/cache.ttl';

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
    const cacheKey = CACHE_KEYS.dashboard(userId);

    const cached = await cacheService.get<DashboardStats>(cacheKey);

    if (cached) {
      return cached;
    }

    const stats = await dashboardRepository.getDashboardStats(userId);

    await cacheService.set(cacheKey, stats, CACHE_TTL.DASHBOARD);

    return stats;
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
