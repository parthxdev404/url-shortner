export const CACHE_KEYS = {
  url: (shortCode: string) => `url:${shortCode}`,
  analytics: (urlId: string) => `analytics:${urlId}`,

  user: (id: string) => `user:${id}`,
  session: (id: string) => `session:${id}`,
} as const;
