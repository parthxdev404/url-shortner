export const CACHE_KEYS = {
  url: (shortCode: string) => `url:${shortCode}`,
  analytics: (urlId: string) => `analytics:${urlId}`,
  dashboard: (userId: string) => `dashboard:${userId}`,
  rateLimit: (prefix: string, ip: string) => `rate-limit:${prefix}:${ip}`,
  user: (id: string) => `user:${id}`,
  session: (id: string) => `session:${id}`,
} as const;
