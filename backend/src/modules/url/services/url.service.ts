import { GetUserUrlsOption, urlRepository } from '../repositories/url.repository';

import { generateShortCode } from '../../../shared/utils/generateShortCode';

import { UrlDocument } from '../model/url.model';

import { Types } from 'mongoose';

import { ConflictError, NotFoundError } from '../../../shared/errors';

import { cacheService } from '../../../shared/cache/cache.service';

import { CACHE_KEYS } from '../../../shared/cache/cache.key';

import { CACHE_TTL } from '../../../shared/cache/cache.ttl';

import { CachedUrlDocument } from '../types/url-cache';

import { GetMyUrlsQuery } from '../validation/get-my-url-schema';

import { UpdateUrlBody } from '../validation/update-urls.schema';

type GetMyUrlsResponse = {
  items: UrlDocument[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: 'clicks' | 'expiresAt' | 'createdAt';
  order: 'asc' | 'desc';
};

export class UrlService {
  private readonly MAX_RETRIES = 5;

  async createShortUrl(
    userId: string,
    originalUrl: string,
    customAlias?: string,
  ): Promise<UrlDocument> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundError('User not found.');
    }

    if (customAlias) {
      const exists = await urlRepository.existsByShortCode(customAlias);

      if (exists) {
        throw new ConflictError('Custom alias already exists.');
      }

      return urlRepository.create({
        userId: new Types.ObjectId(userId),
        originalUrl,
        shortCode: customAlias,
      });
    }

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      const shortCode = generateShortCode();

      const exists = await urlRepository.existsByShortCode(shortCode);

      if (exists) {
        continue;
      }

      return urlRepository.create({
        userId: new Types.ObjectId(userId),
        originalUrl,
        shortCode,
      });
    }

    throw new ConflictError('Unable to generate a unique short code.');
  }

  async getById(id: string): Promise<UrlDocument | null> {
    return urlRepository.findById(id);
  }

  async resolveRedirect(shortCode: string): Promise<CachedUrlDocument> {
    const cached = await cacheService.get<CachedUrlDocument>(CACHE_KEYS.url(shortCode));

    if (cached) {
      return cached;
    }

    const url = await urlRepository.findByShortCode(shortCode);

    if (!url) {
      throw new NotFoundError('Short URL not found.');
    }

    if (!url.isActive) {
      throw new ConflictError('This short URL has been deactivated.');
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      throw new ConflictError('This short URL has expired.');
    }

    const cachedUrl: CachedUrlDocument = {
      id: url.id,
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      isActive: url.isActive,
      expiresAt: url.expiresAt ?? null,
    };

    await cacheService.set(CACHE_KEYS.url(shortCode), cachedUrl, CACHE_TTL.URL);

    return cachedUrl;
  }

  async incrementClicks(id: string): Promise<void> {
    const updated = await urlRepository.incrementClicks(id);

    if (!updated) {
      throw new NotFoundError('URL not found.');
    }
  }

  async activateUrl(id: string, userId: string): Promise<UrlDocument> {
    const url = await urlRepository.findOwnedById(id, userId);

    if (!url) {
      throw new NotFoundError('URL not found.');
    }

    if (url.isActive) {
      return url;
    }

    const updated = await urlRepository.activate(id, userId);

    if (!updated) {
      throw new NotFoundError('URL not found.');
    }

    await cacheService.delete(CACHE_KEYS.url(updated.shortCode));

    return updated;
  }

  async deactivateUrl(id: string, userId: string): Promise<void> {
    const url = await urlRepository.findOwnedById(id, userId);

    if (!url) {
      throw new NotFoundError('URL not found.');
    }

    if (!url.isActive) {
      return;
    }

    const updated = await urlRepository.deactivate(id, userId);

    if (!updated) {
      throw new NotFoundError('URL not found.');
    }

    await cacheService.delete(CACHE_KEYS.url(updated.shortCode));
  }

  async deleteUrl(id: string, userId: string): Promise<void> {
    const deletedUrl = await urlRepository.softDeleteById(id, userId);

    if (!deletedUrl) {
      throw new NotFoundError('URL not found.');
    }

    await cacheService.delete(CACHE_KEYS.url(deletedUrl.shortCode));
  }

  async getMyUrls(userId: string, query: GetMyUrlsQuery): Promise<GetMyUrlsResponse> {
    const options: GetUserUrlsOption = {
      userId,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      order: query.order,
    };

    if (query.search !== undefined) {
      options.search = query.search;
    }

    if (query.status !== undefined) {
      options.status = query.status;
    }

    const result = await urlRepository.findByUser(options);

    return {
      items: result.urls,
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit),
      sortBy: query.sortBy,
      order: query.order,
    };
  }

  async updateUrl(id: string, userId: string, data: UpdateUrlBody): Promise<UrlDocument> {
    const url = await urlRepository.findOwnedById(id, userId);

    if (!url) {
      throw new NotFoundError('URL not found.');
    }

    const updatedUrl = await urlRepository.updateById(id, userId, data);

    if (!updatedUrl) {
      throw new NotFoundError('URL not found.');
    }

    await cacheService.delete(CACHE_KEYS.url(updatedUrl.shortCode));

    return updatedUrl;
  }

  async bulkDelete(userId: string, ids: string[]): Promise<void> {
    const urls = await urlRepository.findManyByIds(userId, ids);

    if (urls.length === 0) {
      throw new NotFoundError('No URLs found.');
    }

    await urlRepository.bulkSoftDelete(userId, ids);

    await Promise.all(urls.map((url) => cacheService.delete(CACHE_KEYS.url(url.shortCode))));
  }

  async bulkRestore(userId: string, ids: string[]): Promise<void> {
    const urls = await urlRepository.findManyDeletedByIds(userId, ids);

    if (urls.length === 0) {
      throw new NotFoundError('No URLs found.');
    }

    await urlRepository.bulkRestore(userId, ids);
  }

  async bulkDeactivate(userId: string, ids: string[]): Promise<void> {
    const urls = await urlRepository.findManyByIds(userId, ids);

    if (urls.length === 0) {
      throw new NotFoundError('No URLs found.');
    }

    await urlRepository.bulkDeactivate(userId, ids);

    await Promise.all(urls.map((url) => cacheService.delete(CACHE_KEYS.url(url.shortCode))));
  }
}

export const urlService = new UrlService();
