import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { registerUser } from '../helpers/user';
import { enqueResetPasswordEmail } from '../mocks/email-jobs';

describe('POST /api/v1/auth/reset-password', () => {
  beforeEach(() => {
    enqueResetPasswordEmail.mockClear();
  });

  it('should reset password successfully', async () => {
    const { payload } = await registerUser();

    await request(app).post('/api/v1/auth/forgot-password').send({
      email: payload.email,
    });

    expect(enqueResetPasswordEmail).toHaveBeenCalledTimes(1);

    const resetUrl = enqueResetPasswordEmail.mock.calls[0]![0].resetUrl;

    const token = new URL(resetUrl).searchParams.get('token');

    expect(token).toBeTruthy();

    const resetResponse = await request(app).post('/api/v1/auth/reset-password').send({
      token,
      password: 'NewPassword@123',
    });

    expect(resetResponse.status).toBe(200);

    expect(resetResponse.body.success).toBe(true);

    expect(resetResponse.body.message).toBe('Password reset successfully.');

    // Old password should fail
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

    await request(app).post('/api/v1/auth/forgot-password').send({
      email: payload.email,
    });

    const resetUrl = enqueResetPasswordEmail.mock.calls[0]![0].resetUrl;

    const token = new URL(resetUrl).searchParams.get('token');

    const response = await request(app).post('/api/v1/auth/reset-password').send({
      token,
      password: '123',
    });

    expect(response.status).toBe(400);
  });

  it('should not allow reusing the same reset token', async () => {
    const { payload } = await registerUser();

    await request(app).post('/api/v1/auth/forgot-password').send({
      email: payload.email,
    });

    const resetUrl = enqueResetPasswordEmail.mock.calls[0]![0].resetUrl;

    const token = new URL(resetUrl).searchParams.get('token');

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

    await request(app).post('/api/v1/auth/forgot-password').send({
      email: payload.email,
    });

    const resetUrl = enqueResetPasswordEmail.mock.calls[0]![0].resetUrl;

    const token = new URL(resetUrl).searchParams.get('token');

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
