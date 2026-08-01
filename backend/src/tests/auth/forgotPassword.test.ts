import request from 'supertest';
import { describe, expect, it, beforeEach } from 'vitest';

import app from '../helpers/app';
import { registerUser } from '../helpers/user';

import { enqueResetPasswordEmail } from '../mocks/email-jobs';

describe('POST /forgot-password', () => {
  beforeEach(() => {
    enqueResetPasswordEmail.mockClear();
  });

  it('should send reset email', async () => {
    const { payload } = await registerUser();

    const response = await request(app).post('/api/v1/auth/forgot-password').send({
      email: payload.email,
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(enqueResetPasswordEmail).toHaveBeenCalledTimes(1);
  });

  it('should succeed for unknown email', async () => {
    const response = await request(app).post('/api/v1/auth/forgot-password').send({
      email: 'unknown@example.com',
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
  });

  it('should reject invalid email', async () => {
    const response = await request(app).post('/api/v1/auth/forgot-password').send({
      email: 'abc',
    });

    expect(response.status).toBe(400);
  });
});
