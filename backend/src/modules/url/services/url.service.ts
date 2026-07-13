import { urlRepository } from '../repositories/url.repository';
import { generateShortCode } from '../../../shared/utils/generateShortCode';
import { UrlDocument } from '../model/url.model';
import { ConflictError } from '../../../shared/errors';

export class UrlService {
  private readonly MAX_RETRIES = 5;

  async createShortUrl(originalUrl: string): Promise<UrlDocument> {
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      const shortCode = generateShortCode();

      const exists = await urlRepository.existsByShortCode(shortCode);

      if (exists) {
        continue;
      }

      return await urlRepository.create({
        originalUrl,
        shortCode,
      });
    }

    throw new ConflictError('Unable to generate a unique short code.');
  }

  async getOriginalUrl(
    shortCode: string,
  ): Promise<UrlDocument | null> {
    return urlRepository.findByShortCode(shortCode);
  }

  async getById(
    id: string,
  ): Promise<UrlDocument | null> {
    return urlRepository.findById(id);
  }

  async incrementClicks(id: string): Promise<void> {
    await urlRepository.incrementClicks(id);
  }

  async deactivateUrl(id: string): Promise<void> {
    await urlRepository.deactivateById(id);
  }

  async deleteUrl(id: string): Promise<void> {
    await urlRepository.deleteById(id);
  }
}

export const urlService = new UrlService();