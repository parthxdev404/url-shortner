import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { redis } from '../../infastructure/redis/redis';
import { RateLimitOptions } from './rate-limit.types';
import { CACHE_KEYS } from '../cache/cache.key';

export function rateLimiter(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ip = req.ip ?? 'unknown';
      const key = CACHE_KEYS.rateLimit(options.keyPrefix ?? 'global', ip);

      const current = await redis.get(key);

      let count: number;

      if (!current) {
        await redis.set(key, '1', 'EX', options.windowInSeconds);
        count = 1;
      } else {
        count = await redis.incr(key);
      }

      if (count === 1) {
        await redis.expire(key, options.windowInSeconds);
      }

      const ttl = await redis.ttl(key);

      res.setHeader('X-RateLimit-Limit', options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(options.maxRequests - count, 0));
      res.setHeader('X-RateLimit-Reset', ttl);

      if (count > options.maxRequests) {
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
          success: false,
          message: 'Too many requests. Please try again later.',
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
