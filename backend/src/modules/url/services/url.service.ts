import { urlRepository } from '../repositories/url.repository';
import { generateShortCode } from '../../../shared/utils/generateShortCode';
import { UrlDocument } from '../model/url.model';
import {
  ConflictError,
  NotFoundError,
} from '../../../shared/errors';
import { cacheService } from '../../../shared/cache/cache.service';
import { CACHE_KEYS } from '../../../shared/cache/cache.key';
import { CACHE_TTL } from '../../../shared/cache/cache.ttl';
import { CachedUrlDocument } from '../types/url-cache';

export class UrlService {
  private readonly MAX_RETRIES = 5;

  async createShortUrl(
    originalUrl: string,
    customAlias?: string,
  ): Promise<UrlDocument> {
    if (customAlias) {
      const exists = await urlRepository.existsByShortCode(customAlias);

      if (exists) {
        throw new ConflictError(
          'Custom alias already exists.',
        );
      }

      return urlRepository.create({
        originalUrl,
        shortCode: customAlias,
      });
    }

    for (
      let attempt = 0;
      attempt < this.MAX_RETRIES;
      attempt++
    ) {
      const shortCode = generateShortCode();

      const exists =
        await urlRepository.existsByShortCode(shortCode);

      if (exists) {
        continue;
      }

      return urlRepository.create({
        originalUrl,
        shortCode,
      });
    }

    throw new ConflictError(
      'Unable to generate a unique short code.',
    );
  }

  async getById(id: string): Promise<UrlDocument | null> {
    return urlRepository.findById(id);
  }

  async resolveRedirect(
    shortCode: string,
  ): Promise<CachedUrlDocument> {

    const cached =
      await cacheService.get<CachedUrlDocument>(
        CACHE_KEYS.url(shortCode),
      );

    if (cached) {
      return cached;
    }


    const url =
      await urlRepository.findByShortCode(shortCode);
      console.log("mongo lookup")

    if (!url) {
      throw new NotFoundError(
        'Short URL not found.',
      );
    }


    if (!url.isActive) {
      throw new ConflictError(
        'This short URL has been deactivated.',
      );
    }

    if (
      url.expiresAt &&
      url.expiresAt < new Date()
    ) {
      throw new ConflictError(
        'This short URL has expired.',
      );
    }

    const cachedUrl: CachedUrlDocument = {
  id: url.id,
  _id: url._id,
  originalUrl: url.originalUrl,
  shortCode: url.shortCode,
  isActive: url.isActive,
  expiresAt: url.expiresAt ?? null,
};

    await cacheService.set(
      CACHE_KEYS.url(shortCode),
      cachedUrl,
      CACHE_TTL.URL,
    );

    console.log("cache stored")

    return cachedUrl;
  }

  async incrementClicks(id: string): Promise<void> {
    const updated =
      await urlRepository.incrementClicks(id);

    if (!updated) {
      throw new NotFoundError(
        'URL not found.',
      );
    }
  }

  async deactivateUrl(id: string): Promise<void> {
    const url =
      await urlRepository.findById(id);

    if (!url) {
      throw new NotFoundError(
        'URL not found.',
      );
    }

    await urlRepository.deactivateById(id);

    await cacheService.delete(
      CACHE_KEYS.url(url.shortCode),
    );
  }

  async deleteUrl(id: string): Promise<void> {
    const url =
      await urlRepository.findById(id);

    if (!url) {
      throw new NotFoundError(
        'URL not found.',
      );
    }

    await urlRepository.deleteById(id);

    await cacheService.delete(
      CACHE_KEYS.url(url.shortCode),
    );
  }
}
export const urlService = new UrlService();