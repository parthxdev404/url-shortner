import { urlRepository } from '../repositories/url.repository';
import { generateShortCode } from '../../../shared/utils/generateShortCode';
import { UrlDocument } from '../model/url.model';
import { ConflictError, NotFoundError } from '../../../shared/errors';

export class UrlService {
  private readonly MAX_RETRIES = 5;

  async createShortUrl(
  originalUrl: string,
  customAlias?: string,
): Promise<UrlDocument> {

  if (customAlias) {
    const exists = await urlRepository.existsByShortCode(customAlias);

    if (exists) {
      throw new ConflictError("Custom alias already exists.");
    }

    return urlRepository.create({
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
      originalUrl,
      shortCode,
    });
  }

  throw new ConflictError("Unable to generate a unique short code.");
}

  async getOriginalUrl(shortCode: string): Promise<UrlDocument | null> {
    return urlRepository.findByShortCode(shortCode);
  }

  async getById(id: string): Promise<UrlDocument | null> {
    return urlRepository.findById(id);
  }

  async resolveRedirect(shortCode: string): Promise<UrlDocument> {
    const url = await urlRepository.findByShortCode(shortCode);

    if (!url) {
      throw new NotFoundError('Short URL not found');
    }

    if (!url.isActive) {
      throw new ConflictError('Short URL has been deactivated');
    }

    if (url.expiresAt && url.expiresAt.getTime() <= Date.now()) {
      throw new ConflictError('Short URL has expired');
    }

    return url;
  }

  async incrementClicks(id: string): Promise<void> {
    const updated = await urlRepository.incrementClicks(id);

    if (!updated) {
      throw new NotFoundError('Url not Found');
    }
  }

  async deactivateUrl(id: string): Promise<void> {
    const updated = await urlRepository.deactivateById(id);

    if (!updated) {
      throw new NotFoundError('Url not Found');
    }
  }

  async deleteUrl(id: string): Promise<void> {
    const deleted = await urlRepository.deleteById(id);

    if (!deleted) {
      throw new NotFoundError('Url not Found');
    }
  }
}

export const urlService = new UrlService();
