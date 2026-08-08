import z from 'zod/v3';

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),

    otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit code.'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .max(64, 'Password must not exceed 64 characters.'),
  }),
});
