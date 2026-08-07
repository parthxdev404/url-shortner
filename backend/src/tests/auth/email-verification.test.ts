import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../helpers/app';
import { UserModel } from '../../modules/users/model/user.model';

vi.mock('../../shared/queue/jobs/send-verification-email.jobs', () => ({
  enqueueVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

import { enqueueVerificationEmail } from '../../shared/queue/jobs/send-verification-email.jobs';

describe('Email Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/verify-email', () => {
    it('should verify a user with a valid OTP', async () => {
      const payload = {
        name: 'Parth Sharma',
        email: `verify-${Date.now()}@example.com`,
        password: 'Password@123',
      };

      const registerResponse = await request(app).post('/api/v1/auth/register').send(payload);

      expect(registerResponse.status).toBe(201);

      expect(enqueueVerificationEmail).toHaveBeenCalledTimes(1);

      const emailJob = vi.mocked(enqueueVerificationEmail).mock.calls[0]?.[0];

      expect(emailJob).toBeDefined();
      expect(emailJob?.to).toBe(payload.email);
      expect(emailJob?.name).toBe(payload.name);
      expect(emailJob?.otp).toMatch(/^\d{6}$/);

      const otp = emailJob!.otp;

      const response = await request(app).post('/api/v1/auth/verify-email').send({
        email: payload.email,
        otp,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const user = await UserModel.findOne({
        email: payload.email,
      });

      expect(user).not.toBeNull();
      expect(user?.isVerified).toBe(true);
      expect(user?.verificationOtp).toBeNull();
      expect(user?.verificationOtpExpiresAt).toBeNull();
    });

    it('should reject an invalid OTP', async () => {
      const payload = {
        name: 'Parth Sharma',
        email: `invalid-otp-${Date.now()}@example.com`,
        password: 'Password@123',
      };

      await request(app).post('/api/v1/auth/register').send(payload);

      const response = await request(app).post('/api/v1/auth/verify-email').send({
        email: payload.email,
        otp: '111111',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      const user = await UserModel.findOne({
        email: payload.email,
      });

      expect(user?.isVerified).toBe(false);
    });

    it('should reject an expired OTP', async () => {
      const payload = {
        name: 'Parth Sharma',
        email: `expired-otp-${Date.now()}@example.com`,
        password: 'Password@123',
      };

      await request(app).post('/api/v1/auth/register').send(payload);

      await UserModel.findOneAndUpdate(
        { email: payload.email },
        {
          verificationOtpExpiresAt: new Date(Date.now() - 60 * 1000),
        },
      );

      const emailJob = vi.mocked(enqueueVerificationEmail).mock.calls[0]?.[0];

      expect(emailJob?.otp).toMatch(/^\d{6}$/);

      const response = await request(app).post('/api/v1/auth/verify-email').send({
        email: payload.email,
        otp: emailJob!.otp,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      const user = await UserModel.findOne({
        email: payload.email,
      });

      expect(user?.isVerified).toBe(false);
    });

    it('should reject verification for an already verified email', async () => {
      const payload = {
        name: 'Parth Sharma',
        email: `already-verified-${Date.now()}@example.com`,
        password: 'Password@123',
      };

      await request(app).post('/api/v1/auth/register').send(payload);

      const emailJob = vi.mocked(enqueueVerificationEmail).mock.calls[0]?.[0];

      expect(emailJob?.otp).toMatch(/^\d{6}$/);

      const otp = emailJob!.otp;

      const firstResponse = await request(app).post('/api/v1/auth/verify-email').send({
        email: payload.email,
        otp,
      });

      expect(firstResponse.status).toBe(200);

      const secondResponse = await request(app).post('/api/v1/auth/verify-email').send({
        email: payload.email,
        otp,
      });

      expect(secondResponse.status).toBe(401);
      expect(secondResponse.body.success).toBe(false);
    });

    it('should reject verification when the email does not exist', async () => {
      const response = await request(app).post('/api/v1/auth/verify-email').send({
        email: 'does-not-exist@example.com',
        otp: '123456',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject an OTP with an invalid format', async () => {
      const response = await request(app).post('/api/v1/auth/verify-email').send({
        email: 'user@example.com',
        otp: '12345',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/resend-verification-otp', () => {
    it('should resend a verification OTP for an unverified user', async () => {
      const payload = {
        name: 'Parth Sharma',
        email: `resend-${Date.now()}@example.com`,
        password: 'Password@123',
      };

      await request(app).post('/api/v1/auth/register').send(payload);

      expect(enqueueVerificationEmail).toHaveBeenCalledTimes(1);

      const firstEmailJob = vi.mocked(enqueueVerificationEmail).mock.calls[0]?.[0];

      expect(firstEmailJob?.otp).toMatch(/^\d{6}$/);

      const response = await request(app).post('/api/v1/auth/resend-verification-otp').send({
        email: payload.email,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(enqueueVerificationEmail).toHaveBeenCalledTimes(2);

      const secondEmailJob = vi.mocked(enqueueVerificationEmail).mock.calls[1]?.[0];

      expect(secondEmailJob).toBeDefined();
      expect(secondEmailJob?.to).toBe(payload.email);
      expect(secondEmailJob?.name).toBe(payload.name);
      expect(secondEmailJob?.otp).toMatch(/^\d{6}$/);

      expect(secondEmailJob?.otp).not.toBe(firstEmailJob?.otp);
    });

    it('should not reveal whether a non-existent email exists', async () => {
      const response = await request(app).post('/api/v1/auth/resend-verification-otp').send({
        email: 'does-not-exist@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(enqueueVerificationEmail).not.toHaveBeenCalled();
    });

    it('should reject resend for an already verified user', async () => {
      const payload = {
        name: 'Parth Sharma',
        email: `resend-verified-${Date.now()}@example.com`,
        password: 'Password@123',
      };

      await request(app).post('/api/v1/auth/register').send(payload);

      const emailJob = vi.mocked(enqueueVerificationEmail).mock.calls[0]?.[0];

      expect(emailJob?.otp).toMatch(/^\d{6}$/);

      await request(app).post('/api/v1/auth/verify-email').send({
        email: payload.email,
        otp: emailJob!.otp,
      });

      const response = await request(app).post('/api/v1/auth/resend-verification-otp').send({
        email: payload.email,
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Login verification requirement', () => {
    it('should not allow an unverified user to login', async () => {
      const payload = {
        name: 'Parth Sharma',
        email: `unverified-login-${Date.now()}@example.com`,
        password: 'Password@123',
      };

      await request(app).post('/api/v1/auth/register').send(payload);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: payload.email,
        password: payload.password,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please verify your email before logging in.');
    });

    it('should allow a verified user to login', async () => {
      const payload = {
        name: 'Parth Sharma',
        email: `verified-login-${Date.now()}@example.com`,
        password: 'Password@123',
      };

      await request(app).post('/api/v1/auth/register').send(payload);

      const emailJob = vi.mocked(enqueueVerificationEmail).mock.calls[0]?.[0];

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

      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(payload.email);
    });
  });
});
