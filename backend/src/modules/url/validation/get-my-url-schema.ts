import { z } from 'zod/v3';

export const getMyUrlsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),

    limit: z.coerce.number().min(1).max(100).default(10),

    search: z.string().trim().optional(),

    sortBy: z.enum(['createdAt', 'clicks', 'expiresAt']).default('createdAt'),

    order: z.enum(['asc', 'desc']).default('desc'),

    status: z.enum(['active', 'expired', 'inactive']).optional(),
  }),
});

export type GetMyUrlsQuery = z.infer<typeof getMyUrlsSchema>['query'];
