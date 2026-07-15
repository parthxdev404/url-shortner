import { redis } from "../../infastructure/redis/redis";

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async set<T>(
  key: string,
  value: T,
  ttl: number,
): Promise<void> {

  await redis.set(
    key,
    JSON.stringify(value),
    "EX",
    ttl,
  );

}

  async delete(key: string): Promise<void> {
    await redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await redis.exists(key)) === 1;
  }
}

export const cacheService = new CacheService();