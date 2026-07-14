import { Types } from 'mongoose';
import {
  AnalyticsDocument,
  AnalyticsModel,
  AnalyticsSchema,
} from '../model/analytics.model';

export class AnalyticsRepository {
  async create(
    data: Pick<
      AnalyticsSchema,
      'urlId' | 'ipAddress' | 'userAgent' | 'referrer' | 'browser' | 'os' | 'device' | 'country' | 'city' 
    >,
  ): Promise<AnalyticsDocument> {
    return AnalyticsModel.create(data);
  }

  async findByUrlId(
    urlId: Types.ObjectId,
  ): Promise<AnalyticsDocument[]> {
    return AnalyticsModel.find({ urlId }).sort({
      clickedAt: -1,
    });
  }

  async findRecentByUrlId(
    urlId: Types.ObjectId,
    limit = 20,
  ): Promise<AnalyticsDocument[]> {
    return AnalyticsModel.find({ urlId })
      .sort({
        clickedAt: -1,
      })
      .limit(limit);
  }

  async countByUrlId(
    urlId: Types.ObjectId,
  ): Promise<number> {
    return AnalyticsModel.countDocuments({
      urlId,
    });
  }
}

export const analyticsRepository =
  new AnalyticsRepository();