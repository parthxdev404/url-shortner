import z from 'zod/v3';

export const analyticsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid URL id'),
  }),
});

export const analyticsParamsSchema = z.object({
  params: z.object({
    urlId: z.string().length(24),
  }),
});

export type AnalyticsParams = z.infer<typeof analyticsParamsSchema>['params'];
