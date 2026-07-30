import { z } from 'zod/v3';

export const bulkUrlSchema = z.object({
  body: z.object({
    ids: z.array(z.string().trim().min(1)).min(1, 'At least one URL id is required.'),
  }),
});

export type BulkUrlBody = z.infer<typeof bulkUrlSchema>['body'];
