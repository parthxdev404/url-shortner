import request from 'supertest';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import app from '../helpers/app';
import { registerUser } from '../helpers/user';

import { emailQueue } from '../../shared/queue/queues/email.queue';

describe('POST /api/v1/auth/forgot-password', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should send a password reset email for an existing user', async () => {
    const { payload } = await registerUser();

    const addSpy = vi.spyOn(emailQueue, 'add').mockResolvedValue({} as never);

    const response = await request(app).post('/api/v1/auth/forgot-password').send({
      email: payload.email,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(addSpy).toHaveBeenCalledTimes(1);

    const [jobName, jobData] = addSpy.mock.calls[0] ?? [];

    expect(jobName).toBe('send-reset-password-email');

    expect(jobData).toBeDefined();
    expect(jobData.to).toBe(payload.email);
    expect(jobData.name).toBe(payload.name);
    expect(jobData.otp).toBeDefined();
    expect(jobData.otp).toMatch(/^\d{6}$/);
  });

  it('should store a hashed password reset OTP', async () => {
    const { payload } = await registerUser();

    const addSpy = vi.spyOn(emailQueue, 'add').mockResolvedValue({} as never);

    await request(app).post('/api/v1/auth/forgot-password').send({
      email: payload.email,
    });

    expect(addSpy).toHaveBeenCalledTimes(1);

    const jobData = addSpy.mock.calls[0]?.[1];

    expect(jobData).toBeDefined();
    expect(jobData.otp).toMatch(/^\d{6}$/);

    const user = await import('../../modules/users/model/user.model.js').then(({ UserModel }) =>
      UserModel.findOne({ email: payload.email }).select(
        '+passwordResetOtp +passwordResetOtpExpiresAt',
      ),
    );

    expect(user).not.toBeNull();

    expect(user?.passwordResetOtp).toBeDefined();
    expect(user?.passwordResetOtpExpiresAt).toBeDefined();

    expect(user!.passwordResetOtpExpiresAt!.getTime()).toBeGreaterThan(Date.now());
  });

  it('should succeed for an unknown email', async () => {
    const response = await request(app).post('/api/v1/auth/forgot-password').send({
      email: 'unknown@example.com',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should not enqueue an email for an unknown email', async () => {
    const addSpy = vi.spyOn(emailQueue, 'add').mockResolvedValue({} as never);

    const response = await request(app).post('/api/v1/auth/forgot-password').send({
      email: 'unknown@example.com',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(addSpy).not.toHaveBeenCalled();
  });

  it('should reject an invalid email', async () => {
    const response = await request(app).post('/api/v1/auth/forgot-password').send({
      email: 'abc',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should reject a missing email', async () => {
    const response = await request(app).post('/api/v1/auth/forgot-password').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
