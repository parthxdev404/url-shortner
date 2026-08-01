import { vi } from 'vitest';

export type ResetPasswordEmailPayload = {
  to: string;
  name: string;
  resetUrl: string;
};

export const enqueResetPasswordEmail =
  vi.fn<(payload: ResetPasswordEmailPayload) => Promise<void>>();

export type VerificationEmailPayload = {
  to: string;
  name: string;
  verificationUrl: string;
};

export const enqueVerificationEmail = vi.fn<(payload: VerificationEmailPayload) => Promise<void>>();
