import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../helpers/app';
import { registerUser } from '../helpers/user';
import { UserModel } from '../../modules/users/model/user.model';
import { emailQueue } from '../../shared/queue/queues/email.queue';

async function generateResetOtp(email: string): Promise<string> {
  const addSpy = vi.spyOn(emailQueue, 'add').mockResolvedValue({} as never);

  const response = await request(app).post('/api/v1/auth/forgot-password').send({
    email,
  });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);

  expect(addSpy).toHaveBeenCalledTimes(1);

  const [, jobData] = addSpy.mock.calls[0]!;

  expect(jobData).toBeDefined();
  expect(jobData.to).toBe(email);
  expect(jobData.name).toBeDefined();
  expect(jobData.otp).toBeDefined();
  expect(jobData.otp).toMatch(/^\d{6}$/);

  const otp = jobData.otp;

  addSpy.mockRestore();

  return otp;
}

describe('POST /api/v1/auth/reset-password', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should reset password successfully', async () => {
    const { payload } = await registerUser();

    const otp = await generateResetOtp(payload.email);

    const resetResponse = await request(app).post('/api/v1/auth/reset-password').send({
      email: payload.email,
      otp,
      password: 'NewPassword@123',
    });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.success).toBe(true);
    expect(resetResponse.body.message).toBe('Password reset successfully.');

    const user = await UserModel.findOne({
      email: payload.email,
    }).select('+passwordResetOtp +passwordResetOtpExpiresAt');

    expect(user).not.toBeNull();

    expect(user?.passwordResetOtp).toBeNull();
    expect(user?.passwordResetOtpExpiresAt).toBeNull();
  });

  it('should reject an invalid reset OTP', async () => {
    const { payload } = await registerUser();

    await generateResetOtp(payload.email);

    const response = await request(app).post('/api/v1/auth/reset-password').send({
      email: payload.email,
      otp: '999999',
      password: 'NewPassword@123',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should reject an expired reset OTP', async () => {
    const { payload } = await registerUser();

    const otp = await generateResetOtp(payload.email);

    await UserModel.findOneAndUpdate(
      { email: payload.email },
      {
        passwordResetOtpExpiresAt: new Date(Date.now() - 60 * 1000),
      },
    );

    const response = await request(app).post('/api/v1/auth/reset-password').send({
      email: payload.email,
      otp,
      password: 'NewPassword@123',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should reject missing email', async () => {
    const response = await request(app).post('/api/v1/auth/reset-password').send({
      otp: '123456',
      password: 'NewPassword@123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should reject missing OTP', async () => {
    const response = await request(app).post('/api/v1/auth/reset-password').send({
      email: 'test@example.com',
      password: 'NewPassword@123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should reject an OTP with an invalid format', async () => {
    const response = await request(app).post('/api/v1/auth/reset-password').send({
      email: 'test@example.com',
      otp: '12345',
      password: 'NewPassword@123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should reject missing password', async () => {
    const response = await request(app).post('/api/v1/auth/reset-password').send({
      email: 'test@example.com',
      otp: '123456',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should reject a weak password', async () => {
    const { payload } = await registerUser();

    const otp = await generateResetOtp(payload.email);

    const response = await request(app).post('/api/v1/auth/reset-password').send({
      email: payload.email,
      otp,
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should not allow the same reset OTP to be reused', async () => {
    const { payload } = await registerUser();

    const otp = await generateResetOtp(payload.email);

    const first = await request(app).post('/api/v1/auth/reset-password').send({
      email: payload.email,
      otp,
      password: 'NewPassword@123',
    });

    expect(first.status).toBe(200);
    expect(first.body.success).toBe(true);

    const second = await request(app).post('/api/v1/auth/reset-password').send({
      email: payload.email,
      otp,
      password: 'AnotherPassword@123',
    });

    expect(second.status).toBe(401);
    expect(second.body.success).toBe(false);
  });

  it('should store a new password hash after reset', async () => {
    const { payload } = await registerUser();

    const userBefore = await UserModel.findOne({
      email: payload.email,
    }).select('+passwordHash');

    expect(userBefore).not.toBeNull();

    const oldPasswordHash = userBefore!.passwordHash;

    const otp = await generateResetOtp(payload.email);

    const response = await request(app).post('/api/v1/auth/reset-password').send({
      email: payload.email,
      otp,
      password: 'NewPassword@123',
    });

    expect(response.status).toBe(200);

    const userAfter = await UserModel.findOne({
      email: payload.email,
    }).select('+passwordHash');

    expect(userAfter).not.toBeNull();
    expect(userAfter!.passwordHash).toBeDefined();
    expect(userAfter!.passwordHash).not.toBe(oldPasswordHash);
  });

  it('should clear the password reset OTP after successful reset', async () => {
    const { payload } = await registerUser();

    const otp = await generateResetOtp(payload.email);

    const response = await request(app).post('/api/v1/auth/reset-password').send({
      email: payload.email,
      otp,
      password: 'NewPassword@123',
    });

    expect(response.status).toBe(200);

    const user = await UserModel.findOne({
      email: payload.email,
    }).select('+passwordResetOtp +passwordResetOtpExpiresAt');

    expect(user).not.toBeNull();

    expect(user?.passwordResetOtp).toBeNull();
    expect(user?.passwordResetOtpExpiresAt).toBeNull();
  });
});
