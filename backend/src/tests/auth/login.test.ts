import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { registerUser } from '../helpers/user';

describe('POST /api/v1/auth/login', () => {
  it('should login successfully', async () => {
    const { payload } = await registerUser();

    const response = await request(app).post('/api/v1/auth/login').send({
      email: payload.email,
      password: payload.password,
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe('LoggedIn Successfully');

    expect(response.body.data.accessToken).toBeDefined();

    expect(response.body.data.refreshToken).toBeDefined();

    expect(response.body.data.user.email).toBe(payload.email);

    expect(response.body.data.user.name).toBe(payload.name);

    expect(response.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('should reject wrong password', async () => {
    const { payload } = await registerUser();

    const response = await request(app).post('/api/v1/auth/login').send({
      email: payload.email,
      password: 'WrongPassword123',
    });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it('should reject unknown email', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'unknown@example.com',
      password: 'Password@123',
    });

    expect(response.status).toBe(401);
  });

  it('should reject invalid email', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'invalid-email',
      password: 'Password@123',
    });

    expect(response.status).toBe(400);
  });

  it('should reject missing password', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
    });

    expect(response.status).toBe(400);
  });

  it('should reject missing email', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      password: 'Password@123',
    });

    expect(response.status).toBe(400);
  });
});
