import { z } from 'zod/v3';

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),

    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
