import { Types } from 'mongoose';
import { urlRepository } from '../../url/repositories/url.repository';
import {
  analyticsRepository,
  UrlAnalyticsOverview,
  TimelinePoint,
} from '../repository/analytics.repository';
import { AnalyticsDocument } from '../model/analytics.model';
import { CACHE_KEYS } from '../../../shared/cache/cache.key';
import { cacheService } from '../../../shared/cache/cache.service';
import { CACHE_TTL } from '../../../shared/cache/cache.ttl';
import { NotFoundError } from '../../../shared/errors';

export class AnalyticsService {
  async recordClick(data: {
    urlId: Types.ObjectId;
    ipAddress: string;
    userAgent: string;
    referrer: string | null;
    browser: string;
    os: string;
    device: string;
    country: string;
    city: string;
  }): Promise<AnalyticsDocument> {
    const analytics = await analyticsRepository.create({
      urlId: data.urlId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer,
      browser: data.browser,
      os: data.os,
      device: data.device,
      country: data.country,
      city: data.city,
    });

    await cacheService.delete(CACHE_KEYS.analytics(data.urlId.toString()));

    return analytics;
  }

  async getAnalytics(urlId: Types.ObjectId) {
    const cacheKey = CACHE_KEYS.analytics(urlId.toString());

    const cached = await cacheService.get<{
      totalClicks: number;
      recentClicks: AnalyticsDocument[];
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const [totalClicks, recentClicks] = await Promise.all([
      analyticsRepository.countByUrlId(urlId),
      analyticsRepository.findRecentByUrlId(urlId),
    ]);

    const analytics = {
      totalClicks,
      recentClicks,
    };

    await cacheService.set(cacheKey, analytics, CACHE_TTL.ANALYTICS);

    return analytics;
  }

  async getOverview(urlId: string): Promise<UrlAnalyticsOverview> {
    const url = await urlRepository.findById(urlId);

    if (!url) {
      throw new NotFoundError('URL not found.');
    }

    return analyticsRepository.getOverview(urlId);
  }
  async getTimeline(urlId: string): Promise<TimelinePoint[]> {
    const url = await urlRepository.findById(urlId);

    if (!url) {
      throw new NotFoundError('URL not found.');
    }

    return analyticsRepository.getTimeline(new Types.ObjectId(urlId));
  }

  async getBrowserStats(urlId: string) {
    const url = await urlRepository.findById(urlId);

    if (!url) {
      throw new NotFoundError('URL not found.');
    }

    return analyticsRepository.getDistribution(new Types.ObjectId(urlId), 'browser');
  }

  async getOSStats(urlId: string) {
    const url = await urlRepository.findById(urlId);

    if (!url) {
      throw new NotFoundError('URL not found.');
    }

    return analyticsRepository.getDistribution(new Types.ObjectId(urlId), 'os');
  }

  async getDeviceStats(urlId: string) {
    const url = await urlRepository.findById(urlId);

    if (!url) {
      throw new NotFoundError('URL not found.');
    }

    return analyticsRepository.getDistribution(new Types.ObjectId(urlId), 'device');
  }

  async getReferrerStats(urlId: string) {
    const url = await urlRepository.findById(urlId);

    if (!url) {
      throw new NotFoundError('URL not found.');
    }

    return analyticsRepository.getDistribution(new Types.ObjectId(urlId), 'referrer');
  }

  async getCountryStats(urlId: string) {
    const url = await urlRepository.findById(urlId);

    if (!url) {
      throw new NotFoundError('URL not found.');
    }

    return analyticsRepository.getDistribution(new Types.ObjectId(urlId), 'country');
  }
}

export const analyticsService = new AnalyticsService();
