import { UrlModel, UrlSchema, UrlDocument } from '../model/url.model';
import { SortOrder } from 'mongoose';
import { UpdateUrlBody } from '../validation/update-urls.schema';

type GetUserUrlsOption = {
  userId: string;
  page: number;
  limit: number;
  sortBy: 'clicks' | 'expiresAt' | 'createdAt';
  order: 'asc' | 'desc';
  search?: string | undefined;
  status?: 'active' | 'expired' | 'inactive' | undefined;
};

export class UrlRepository {
  async create(
    data: Pick<UrlSchema, 'originalUrl' | 'shortCode' | 'userId'>,
  ): Promise<UrlDocument> {
    return UrlModel.create(data);
  }

  async findByShortCode(shortCode: string): Promise<UrlDocument | null> {
    return UrlModel.findOne({ shortCode, isDeleted: false });
  }

  async existsByShortCode(shortCode: string): Promise<{ _id: unknown } | null> {
    return UrlModel.exists({ shortCode, isDeleted: false });
  }

  async findById(id: string): Promise<UrlDocument | null> {
    return UrlModel.findOne({ _id: id, isDeleted: false });
  }

  async incrementClicks(id: string): Promise<UrlDocument | null> {
    return UrlModel.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      {
        $inc: {
          clicks: 1,
        },
      },
      {
        new: true,
      },
    );
  }

  async findByUser(options: GetUserUrlsOption): Promise<{
    urls: UrlDocument[];
    total: number;
  }> {
    const { userId, page, limit, search, status, sortBy, order } = options;

    const conditions: Record<string, unknown>[] = [
      {
        userId,
      },
    ];

    if (search) {
      conditions.push({
        $or: [
          {
            originalUrl: {
              $regex: search,
              $options: 'i',
            },
          },
          {
            shortCode: {
              $regex: search,
              $options: 'i',
            },
          },
        ],
      });
    }

    switch (status) {
      case 'active':
        conditions.push({
          isActive: true,
        });

        conditions.push({
          $or: [
            {
              expiresAt: null,
            },
            {
              expiresAt: {
                $gt: new Date(),
              },
            },
          ],
        });
        break;

      case 'inactive':
        conditions.push({
          isActive: false,
        });
        break;

      case 'expired':
        conditions.push({
          expiresAt: {
            $lte: new Date(),
          },
        });
        break;
    }

    const [firstCondition] = conditions;

    const filter: Record<string, unknown> =
      conditions.length === 1 && firstCondition
        ? firstCondition
        : {
            $and: conditions,
          };

    const skip = (page - 1) * limit;

    const sort: Record<string, SortOrder> = {
      [sortBy]: order === 'asc' ? 1 : -1,
      _id: 1,
    };

    const [urls, total] = await Promise.all([
      UrlModel.find(filter).sort(sort).skip(skip).limit(limit),
      UrlModel.countDocuments(filter),
    ]);

    return {
      urls,
      total,
    };
  }

  async updateById(id: string, userId: string, data: UpdateUrlBody): Promise<UrlDocument | null> {
    return UrlModel.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      data,
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async deactivateById(id: string): Promise<UrlDocument | null> {
    return UrlModel.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      {
        isActive: false,
      },
      {
        new: true,
      },
    );
  }

  async softDeleteById(id: string, userId: string): Promise<UrlDocument | null> {
    return UrlModel.findOneAndUpdate(
      {
        _id: id,
        userId,
        isDeleted: false,
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        new: true,
      },
    );
  }

  async restoreById(id: string, userId: string): Promise<UrlDocument | null> {
    return UrlModel.findOneAndUpdate(
      {
        _id: id,
        userId,
        isDeleted: true,
      },
      {
        isDeleted: false,
        deletedAt: null,
      },
      {
        new: true,
      },
    );
  }

  async bulkSoftDelete(userId: string, ids: string[]): Promise<number> {
    const result = await UrlModel.updateMany(
      {
        _id: { $in: ids },
        userId,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
    );

    return result.modifiedCount;
  }

  async findManyByIds(userId: string, ids: string[]): Promise<UrlDocument[]> {
    return UrlModel.find({
      _id: { $in: ids },
      userId,
      isDeleted: false,
    });
  }

  async bulkRestore(userId: string, ids: string[]): Promise<number> {
    const result = await UrlModel.updateMany(
      {
        _id: { $in: ids },
        userId,
        isDeleted: true,
      },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
        },
      },
    );

    return result.modifiedCount;
  }

  async findManyDeletedByIds(userId: string, ids: string[]): Promise<UrlDocument[]> {
    return UrlModel.find({
      _id: { $in: ids },
      userId,
      isDeleted: true,
    });
  }

  async bulkDeactivate(userId: string, ids: string[]): Promise<number> {
    const result = await UrlModel.updateMany(
      {
        _id: { $in: ids },
        userId,
        isDeleted: false,
      },
      {
        $set: {
          isActive: false,
        },
      },
    );

    return result.modifiedCount;
  }
}

export const urlRepository = new UrlRepository();
