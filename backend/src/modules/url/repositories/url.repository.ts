import { Types, SortOrder } from 'mongoose';

import { UrlModel, UrlSchema, UrlDocument } from '../model/url.model';
import { UpdateUrlBody } from '../validation/update-urls.schema';

export type GetUserUrlsOption = {
  userId: string;
  page: number;
  limit: number;
  sortBy: 'clicks' | 'expiresAt' | 'createdAt';
  order: 'asc' | 'desc';
  search?: string;
  status?: 'active' | 'expired' | 'inactive';
};

export class UrlRepository {
  async create(
    data: Pick<UrlSchema, 'originalUrl' | 'shortCode' | 'userId'>,
  ): Promise<UrlDocument> {
    return UrlModel.create(data);
  }

  async findByShortCode(shortCode: string): Promise<UrlDocument | null> {
    return UrlModel.findOne({
      shortCode,
      isDeleted: false,
    });
  }

  async existsByShortCode(shortCode: string): Promise<{ _id: unknown } | null> {
    return UrlModel.exists({
      shortCode,
      isDeleted: false,
    });
  }

  async findById(id: string): Promise<UrlDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return UrlModel.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
    });
  }

  async findOwnedById(id: string, userId: string): Promise<UrlDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return null;
    }

    return UrlModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    });
  }

  async incrementClicks(id: string): Promise<UrlDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return UrlModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
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

    if (!Types.ObjectId.isValid(userId)) {
      return {
        urls: [],
        total: 0,
      };
    }

    const conditions: Record<string, unknown>[] = [
      {
        userId: new Types.ObjectId(userId),
        isDeleted: false,
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

    const filter =
      conditions.length === 1
        ? conditions[0]
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
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return null;
    }

    return UrlModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      },
      data,
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async activate(id: string, userId: string): Promise<UrlDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return null;
    }

    return UrlModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      },
      {
        $set: {
          isActive: true,
        },
      },
      {
        new: true,
      },
    );
  }

  async deactivate(id: string, userId: string): Promise<UrlDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return null;
    }

    return UrlModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      },
      {
        $set: {
          isActive: false,
        },
      },
      {
        new: true,
      },
    );
  }

  async deleteById(id: string, userId: string): Promise<UrlDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return null;
    }

    return UrlModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
  }

  async restoreById(id: string, userId: string): Promise<UrlDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return null;
    }

    return UrlModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        isDeleted: true,
      },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
        },
      },
      {
        new: true,
      },
    );
  }

  async bulkSoftDelete(userId: string, ids: string[]): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      return 0;
    }

    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return 0;
    }

    const result = await UrlModel.updateMany(
      {
        _id: {
          $in: validIds.map((id) => new Types.ObjectId(id)),
        },
        userId: new Types.ObjectId(userId),
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
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }

    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return [];
    }

    return UrlModel.find({
      _id: {
        $in: validIds.map((id) => new Types.ObjectId(id)),
      },
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    });
  }

  async bulkRestore(userId: string, ids: string[]): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      return 0;
    }

    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return 0;
    }

    const result = await UrlModel.updateMany(
      {
        _id: {
          $in: validIds.map((id) => new Types.ObjectId(id)),
        },
        userId: new Types.ObjectId(userId),
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
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }

    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return [];
    }

    return UrlModel.find({
      _id: {
        $in: validIds.map((id) => new Types.ObjectId(id)),
      },
      userId: new Types.ObjectId(userId),
      isDeleted: true,
    });
  }

  async bulkDeactivate(userId: string, ids: string[]): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      return 0;
    }

    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return 0;
    }

    const result = await UrlModel.updateMany(
      {
        _id: {
          $in: validIds.map((id) => new Types.ObjectId(id)),
        },
        userId: new Types.ObjectId(userId),
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
