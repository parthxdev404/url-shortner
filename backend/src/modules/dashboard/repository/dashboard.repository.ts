import { Types } from 'mongoose';
import { UrlModel, UrlDocument } from '../../url/model/url.model';

export class DashboardRepository {
  async getDashboardStats(userId: string): Promise<{
    totalUrls: number;
    activeUrls: number;
    inactiveUrls: number;
    expiredUrls: number;
    deletedUrls: number;
    totalClicks: number;
  }> {
    const now = new Date();

    const [stats] = await UrlModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,

          totalUrls: {
            $sum: {
              $cond: [{ $eq: ['$isDeleted', false] }, 1, 0],
            },
          },

          deletedUrls: {
            $sum: {
              $cond: ['$isDeleted', 1, 0],
            },
          },

          activeUrls: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isDeleted', false] },
                    { $eq: ['$isActive', true] },
                    {
                      $or: [{ $eq: ['$expiresAt', null] }, { $gt: ['$expiresAt', now] }],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },

          inactiveUrls: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ['$isDeleted', false] }, { $eq: ['$isActive', false] }],
                },
                1,
                0,
              ],
            },
          },

          expiredUrls: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isDeleted', false] },
                    { $ne: ['$expiresAt', null] },
                    { $lte: ['$expiresAt', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },

          totalClicks: {
            $sum: {
              $cond: [{ $eq: ['$isDeleted', false] }, '$clicks', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    return (
      stats ?? {
        totalUrls: 0,
        activeUrls: 0,
        inactiveUrls: 0,
        expiredUrls: 0,
        deletedUrls: 0,
        totalClicks: 0,
      }
    );
  }

  async getRecentUrls(userId: string): Promise<UrlDocument[]> {
    return UrlModel.find({
      userId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        ['originalUrl', 'shortCode', 'clicks', 'isActive', 'expiresAt', 'createdAt'].join(' '),
      );
  }

  async getTopUrls(userId: string): Promise<UrlDocument[]> {
    return UrlModel.find({
      userId,
      isDeleted: false,
    })
      .sort({
        clicks: -1,
        createdAt: -1,
      })
      .limit(10)
      .select(
        ['originalUrl', 'shortCode', 'clicks', 'isActive', 'expiresAt', 'createdAt'].join(' '),
      );
  }
}

export const dashboardRepository = new DashboardRepository();
