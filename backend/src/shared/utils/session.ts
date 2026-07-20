import { cacheService } from '../cache/cache.service';
import { CACHE_KEYS } from '../cache/cache.key';
import { CACHE_TTL } from '../cache/cache.ttl';
import { SessionData } from '../types/session';

export async function saveSession(userId: string, session: SessionData): Promise<void> {
  await cacheService.set(CACHE_KEYS.session(userId), session, CACHE_TTL.SESSION);
}

export async function getSession(userId: string): Promise<SessionData | null> {
  return cacheService.get<SessionData>(CACHE_KEYS.session(userId));
}

export async function deleteSession(userId: string): Promise<void> {
  await cacheService.delete(CACHE_KEYS.session(userId));
}
