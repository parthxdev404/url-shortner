import request from 'supertest';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import app from '../helpers/app';
import { UserModel } from '../../modules/users/model/user.model';

vi.mock('../../shared/queue/jobs/send-verification-email.jobs', () => ({
  enqueueVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

import { enqueueVerificationEmail } from '../../shared/queue/jobs/send-verification-email.jobs';

describe('POST /api/v1/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const payload = {
      name: 'Parth Sharma',
      email: `register-${Date.now()}@example.com`,
      password: 'Password@123',
    };

    const response = await request(app).post('/api/v1/auth/register').send(payload);

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe('User created successfully. Please verify your email.');

    expect(response.body.data).toBeDefined();

    expect(response.body.data.email).toBe(payload.email);
    expect(response.body.data.name).toBe(payload.name);

    expect(response.body.data).not.toHaveProperty('passwordHash');
    expect(response.body.data).not.toHaveProperty('verificationOtp');
    expect(response.body.data).not.toHaveProperty('verificationOtpExpiresAt');

    expect(enqueueVerificationEmail).toHaveBeenCalledTimes(1);

    expect(enqueueVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: payload.email,
        name: payload.name,
      }),
    );

    const emailJob = vi.mocked(enqueueVerificationEmail).mock.calls[0]?.[0];

    expect(emailJob).toBeDefined();
    expect(emailJob?.to).toBe(payload.email);
    expect(emailJob?.name).toBe(payload.name);
    expect(emailJob?.otp).toMatch(/^\d{6}$/);

    const user = await UserModel.findOne({
      email: payload.email,
    }).select('+passwordHash +verificationOtp +verificationOtpExpiresAt');

    expect(user).not.toBeNull();

    expect(user?.email).toBe(payload.email);
    expect(user?.name).toBe(payload.name);

    expect(user?.isVerified).toBe(false);

    expect(user?.passwordHash).toBeDefined();
    expect(user?.passwordHash).not.toBe(payload.password);

    expect(user?.verificationOtp).toBeDefined();
    expect(user?.verificationOtp).not.toBe(emailJob?.otp);

    expect(user?.verificationOtpExpiresAt).toBeInstanceOf(Date);

    expect(user!.verificationOtpExpiresAt!.getTime()).toBeGreaterThan(Date.now());
  });

  it('should not allow duplicate email registration', async () => {
    const payload = {
      name: 'Parth',
      email: `duplicate-${Date.now()}@example.com`,
      password: 'Password@123',
    };

    const firstResponse = await request(app).post('/api/v1/auth/register').send(payload);

    expect(firstResponse.status).toBe(201);

    const secondResponse = await request(app).post('/api/v1/auth/register').send(payload);

    expect(secondResponse.status).toBe(409);

    expect(secondResponse.body.success).toBe(false);
  });

  it('should reject invalid email', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Parth',
      email: 'invalid-email',
      password: 'Password@123',
    });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('should reject weak password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Parth',
        email: `weak-${Date.now()}@example.com`,
        password: '123',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('should reject missing required fields', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({});

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });
});
