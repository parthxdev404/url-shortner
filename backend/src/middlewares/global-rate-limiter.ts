import { rateLimiter } from '../shared/rate-limit';
import { RATE_LIMIT } from '../config/rate.limit';

export const globalRateLimiter = rateLimiter({
  windowInSeconds: RATE_LIMIT.windowInSeconds,
  maxRequests: RATE_LIMIT.maxRequests,
  keyPrefix: RATE_LIMIT.keyPrefix,
});
