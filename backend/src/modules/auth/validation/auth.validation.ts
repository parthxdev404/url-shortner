import z from 'zod/v3';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),

    email: z.string().trim().email().toLowerCase(),

    password: z.string().min(8).max(64),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase(),

    password: z.string().min(8).max(64),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
});
