import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import app from '../helpers/app';
import { registerUser } from '../helpers/user';

vi.mock('../../shared/queue/jobs/send-verification-email.jobs', () => ({
  enqueueVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

import { enqueueVerificationEmail } from '../../shared/queue/jobs/send-verification-email.jobs';

describe('POST /api/v1/auth/login', () => {
  it('should login successfully for a verified user', async () => {
    const { payload } = await registerUser();

    const emailJob = vi.mocked(enqueueVerificationEmail).mock.calls[0]?.[0];

    expect(emailJob).toBeDefined();
    expect(emailJob?.to).toBe(payload.email);
    expect(emailJob?.name).toBe(payload.name);
    expect(emailJob?.otp).toMatch(/^\d{6}$/);

    await request(app).post('/api/v1/auth/verify-email').send({
      email: payload.email,
      otp: emailJob!.otp,
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: payload.email,
      password: payload.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe('Logged in successfully.');

    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();

    expect(response.body.data.user.email).toBe(payload.email);
    expect(response.body.data.user.name).toBe(payload.name);

    expect(response.body.data.user).not.toHaveProperty('passwordHash');
    expect(response.body.data.user).not.toHaveProperty('verificationOtp');
    expect(response.body.data.user).not.toHaveProperty('verificationOtpExpiresAt');
    expect(response.body.data.user).not.toHaveProperty('passwordResetOtp');
    expect(response.body.data.user).not.toHaveProperty('passwordResetOtpExpiresAt');
  });

  it('should reject login for an unverified user', async () => {
    const { payload } = await registerUser();

    const response = await request(app).post('/api/v1/auth/login').send({
      email: payload.email,
      password: payload.password,
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe('Please verify your email before logging in.');
  });

  it('should reject wrong password', async () => {
    const { payload } = await registerUser();

    const emailJob = vi.mocked(enqueueVerificationEmail).mock.calls[0]?.[0];

    expect(emailJob?.otp).toMatch(/^\d{6}$/);

    await request(app).post('/api/v1/auth/verify-email').send({
      email: payload.email,
      otp: emailJob!.otp,
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: payload.email,
      password: 'WrongPassword123',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe('Invalid email or password.');
  });

  it('should reject unknown email', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'unknown@example.com',
      password: 'Password@123',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe('Invalid email or password.');
  });

  it('should reject invalid email', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'invalid-email',
      password: 'Password@123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should reject missing password', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should reject missing email', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      password: 'Password@123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
