import z from 'zod/v3';

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),
  }),
});
