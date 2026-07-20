import { cacheService } from '../cache/cache.service';
import { CACHE_KEYS } from '../cache/cache.key';
import { CACHE_TTL } from '../cache/cache.ttl';

export async function saveSession(userId: string, refreshToken: string): Promise<void> {
  await cacheService.set(CACHE_KEYS.session(userId), refreshToken, CACHE_TTL.SESSION);
}

export async function getSession(userId: string): Promise<string | null> {
  return cacheService.get<string>(CACHE_KEYS.session(userId));
}

export async function deleteSession(userId: string): Promise<void> {
  await cacheService.delete(CACHE_KEYS.session(userId));
}
