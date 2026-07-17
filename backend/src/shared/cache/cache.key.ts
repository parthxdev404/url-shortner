export const CACHE_KEYS = {
  url: (shortCode: string) => `url:${shortCode}`,
  analytics: (urlId: string) => `analytics:${urlId}`,
  rateLimit: (prefix: string, ip: string) => `${prefix}:${ip}`,
  user: (id: string) => `user:${id}`,
  session: (id: string) => `session:${id}`,
} as const;
