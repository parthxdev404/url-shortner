export const RATE_LIMIT = {
  windowInSeconds: 600,
  maxRequests: process.env.NODE_ENV === 'test' ? 100000 : 100,
  keyPrefix: 'global',
} as const;
