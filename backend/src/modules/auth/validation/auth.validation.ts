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
  body: z.object({
    email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),

    otp: z.string().regex(/^\d{6}$/, 'Verification code must be 6 digits.'),
  }),
});

export const resendVerificationOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),

    otp: z.string().regex(/^\d{6}$/, 'Reset code must be 6 digits.'),

    password: z.string().min(8).max(64),
  }),
});
