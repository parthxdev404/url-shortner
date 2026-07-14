import { analyticsRepository } from '../repository/analytics.repository';
import { AnalyticsDocument } from '../model/analytics.model';
import { Types } from 'mongoose';

export class AnalyticsService {
  async recordClick(data: {
    urlId: Types.ObjectId;
    ipAddress: string;
    userAgent: string;
    referrer: string | null;
    browser : string;
    os : string;
    device:string;
    country:string;
    city:string;

  }): Promise<AnalyticsDocument> {
    return analyticsRepository.create({
      urlId: data.urlId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer,
      browser : data.browser,
      os : data.os,
      device : data.device,
      country : data.country,
      city : data.city,

    });
  }

  async getAnalytics(urlId: Types.ObjectId) {
    const [totalClicks, recentClicks] = await Promise.all([
      analyticsRepository.countByUrlId(urlId),
      analyticsRepository.findRecentByUrlId(urlId),
    ]);

    return { totalClicks, recentClicks };
  }
}

export const analyticsService = new AnalyticsService()