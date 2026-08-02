import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../helpers/app';
import { registerUser } from '../helpers/user';
import { emailQueue } from '../../shared/queue/queues/email.queue';

async function generateResetToken(email: string): Promise<string> {
  const addSpy = vi.spyOn(emailQueue, 'add').mockResolvedValue({} as never);

  const response = await request(app).post('/api/v1/auth/forgot-password').send({
    email,
  });

  expect(response.status).toBe(200);

  expect(addSpy).toHaveBeenCalledTimes(1);

  const [, payload] = addSpy.mock.calls[0]!;

  const token = new URL(payload.resetUrl).searchParams.get('token');

  expect(token).toBeTruthy();

  addSpy.mockRestore();

  return token!;
}

describe('POST /api/v1/auth/reset-password', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should reset password successfully', async () => {
    const { payload } = await registerUser();

    const token = await generateResetToken(payload.email);

    const resetResponse = await request(app).post('/api/v1/auth/reset-password').send({
      token,
      password: 'NewPassword@123',
    });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.success).toBe(true);
    expect(resetResponse.body.message).toBe('Password reset successfully.');

    const oldLogin = await request(app).post('/api/v1/auth/login').send({
      email: payload.email,
      password: payload.password,
    });

    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app).post('/api/v1/auth/login').send({
      email: payload.email,
      password: 'NewPassword@123',
    });

    expect(newLogin.status).toBe(200);
    expect(newLogin.body.success).toBe(true);
  });

  it('should reject invalid reset token', async () => {
    const response = await request(app).post('/api/v1/auth/reset-password').send({
      token: 'invalid-token',
      password: 'NewPassword@123',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should reject missing token', async () => {
    const response = await request(app).post('/api/v1/auth/reset-password').send({
      password: 'NewPassword@123',
    });

    expect(response.status).toBe(400);
  });

  it('should reject missing password', async () => {
    const response = await request(app).post('/api/v1/auth/reset-password').send({
      token: 'some-token',
    });

    expect(response.status).toBe(400);
  });

  it('should reject weak password', async () => {
    const { payload } = await registerUser();

    const token = await generateResetToken(payload.email);

    const response = await request(app).post('/api/v1/auth/reset-password').send({
      token,
      password: '123',
    });

    expect(response.status).toBe(400);
  });

  it('should not allow reusing the same reset token', async () => {
    const { payload } = await registerUser();

    const token = await generateResetToken(payload.email);

    const first = await request(app).post('/api/v1/auth/reset-password').send({
      token,
      password: 'NewPassword@123',
    });

    expect(first.status).toBe(200);

    const second = await request(app).post('/api/v1/auth/reset-password').send({
      token,
      password: 'AnotherPassword@123',
    });

    expect(second.status).toBe(401);
    expect(second.body.success).toBe(false);
  });

  it('should invalidate existing refresh tokens after password reset', async () => {
    const { payload } = await registerUser();

    const login = await request(app).post('/api/v1/auth/login').send({
      email: payload.email,
      password: payload.password,
    });

    const oldRefreshToken = login.body.data.refreshToken;

    const token = await generateResetToken(payload.email);

    await request(app).post('/api/v1/auth/reset-password').send({
      token,
      password: 'NewPassword@123',
    });

    const refreshResponse = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: oldRefreshToken,
    });

    expect(refreshResponse.status).toBe(401);
  });
});
