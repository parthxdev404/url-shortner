import { z } from 'zod/v3';

export const updateUrlParamsSchema = z.object({
  params: z.object({
    id: z.string().length(24),
  }),
});

export const updateUrlBodySchema = z.object({
  body: z.object({
    originalUrl: z.string().url().optional(),

    expiresAt: z.coerce.date().nullable().optional(),

    isActive: z.boolean().optional(),
  }),
});

export type UpdateUrlBody = z.infer<typeof updateUrlBodySchema>['body'];
