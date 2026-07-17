import { Request, Response, NextFunction } from 'express';
import { RateLimitOptions } from './rate-limit.types';
import { redis } from '../../infastructure/redis/redis';
import { StatusCodes } from 'http-status-codes';

export function rateLimiter(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? 'unknown';
    const key = `${options.keyPrefix ?? 'rate'}:${ip}`;
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
    res.setHeader('X-RateLimit-Limit', Math.max(options.maxRequests - count, 0));
    res.setHeader('X-RateLimit-Reset', ttl);

    if (count > options.maxRequests) {
      return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
        success: false,
        message: 'TOO Many Requests . Please try again later',
      });
    }

    next();
  };
}
