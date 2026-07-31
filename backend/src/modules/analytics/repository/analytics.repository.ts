import { Types } from 'mongoose';
import { AnalyticsDocument, AnalyticsModel, AnalyticsSchema } from '../model/analytics.model';

export type UrlAnalyticsOverview = {
  totalClicks: number;
  uniqueVisitors: number;
  lastClicked: Date | null;
  topBrowser: string;
  topOS: string;
};

export type TimelinePoint = {
  date: string;
  clicks: number;
};

export type DistributionItem = {
  name: string;
  count: number;
};
export class AnalyticsRepository {
  async create(
    data: Pick<
      AnalyticsSchema,
      | 'urlId'
      | 'ipAddress'
      | 'userAgent'
      | 'referrer'
      | 'browser'
      | 'os'
      | 'device'
      | 'country'
      | 'city'
    >,
  ): Promise<AnalyticsDocument> {
    return AnalyticsModel.create(data);
  }

  async findByUrlId(urlId: Types.ObjectId): Promise<AnalyticsDocument[]> {
    return AnalyticsModel.find({ urlId }).sort({
      clickedAt: -1,
    });
  }
  async getOverview(urlId: string): Promise<UrlAnalyticsOverview> {
    const objectId = new Types.ObjectId(urlId);

    const [totalClicks, uniqueVisitors, lastClick, browser, os] = await Promise.all([
      AnalyticsModel.countDocuments({
        urlId: objectId,
      }),

      AnalyticsModel.distinct('ipAddress', {
        urlId: objectId,
      }),

      AnalyticsModel.findOne({
        urlId: objectId,
      })
        .sort({
          clickedAt: -1,
        })
        .select('clickedAt'),

      AnalyticsModel.aggregate([
        {
          $match: {
            urlId: objectId,
          },
        },
        {
          $group: {
            _id: '$browser',
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 1,
        },
      ]),

      AnalyticsModel.aggregate([
        {
          $match: {
            urlId: objectId,
          },
        },
        {
          $group: {
            _id: '$os',
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 1,
        },
      ]),
    ]);

    return {
      totalClicks,

      uniqueVisitors: uniqueVisitors.length,

      lastClicked: lastClick?.clickedAt ?? null,

      topBrowser: browser[0]?._id ?? 'Unknown',

      topOS: os[0]?._id ?? 'Unknown',
    };
  }

  async findRecentByUrlId(urlId: Types.ObjectId, limit = 20): Promise<AnalyticsDocument[]> {
    return AnalyticsModel.find({ urlId })
      .sort({
        clickedAt: -1,
      })
      .limit(limit);
  }

  async countByUrlId(urlId: Types.ObjectId): Promise<number> {
    return AnalyticsModel.countDocuments({
      urlId,
    });
  }

  async getTimeline(urlId: Types.ObjectId): Promise<TimelinePoint[]> {
    return AnalyticsModel.aggregate<TimelinePoint>([
      {
        $match: {
          urlId,
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$clickedAt',
            },
          },

          clicks: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },

      {
        $project: {
          _id: 0,
          date: '$_id',
          clicks: 1,
        },
      },
    ]);
  }

  async getDistribution(
    urlId: Types.ObjectId,
    field: 'browser' | 'os' | 'device' | 'referrer' | 'country',
  ): Promise<DistributionItem[]> {
    return AnalyticsModel.aggregate<DistributionItem>([
      {
        $match: {
          urlId,
        },
      },
      {
        $group: {
          _id: `$${field}`,
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $project: {
          _id: 0,
          name: {
            $ifNull: ['$_id', 'Unknown'],
          },
          count: 1,
        },
      },
    ]);
  }
}

export const analyticsRepository = new AnalyticsRepository();
