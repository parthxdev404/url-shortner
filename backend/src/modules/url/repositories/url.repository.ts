import { UrlModel, UrlSchema, UrlDocument } from '../model/url.model';

export class UrlRepository {
  async create(
    data: Pick<UrlSchema, 'originalUrl' | 'shortCode'>,
  ): Promise<UrlDocument> {
    return UrlModel.create(data);
  }

  async findByShortCode(
    shortCode: string,
  ): Promise<UrlDocument | null> {
    return UrlModel.findOne({ shortCode });
  }

  async existsByShortCode(
    shortCode: string,
  ): Promise<{ _id: unknown } | null> {
    return UrlModel.exists({ shortCode });
  }

  async findById(
    id: string,
  ): Promise<UrlDocument | null> {
    return UrlModel.findById(id);
  }

  async incrementClicks(
    id: string,
  ): Promise<UrlDocument | null> {
    return UrlModel.findByIdAndUpdate(
      id,
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

  async deactivateById(
    id: string,
  ): Promise<UrlDocument | null> {
    return UrlModel.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
      },
    );
  }

  async deleteById(
    id: string,
  ): Promise<UrlDocument | null> {
    return UrlModel.findByIdAndDelete(id);
  }
}

export const urlRepository = new UrlRepository();