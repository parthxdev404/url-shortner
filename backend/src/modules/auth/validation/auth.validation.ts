import z from 'zod/v3';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),

    email: z.string().trim().email().toLowerCase(),

    password: z.string().min(8).max(64),
  }),
});
