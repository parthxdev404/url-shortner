import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/auth';

describe('POST /api/v1/auth/refresh', () => {
  it('should refresh tokens successfully', async () => {
    const { accessToken, refreshToken } = await createAuthenticatedUser();

    const response = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken,
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe('Token refreshed successfully.');

    expect(response.body.data.accessToken).toBeDefined();

    expect(response.body.data.refreshToken).toBeDefined();

    expect(response.body.data.accessToken).not.toBe(accessToken);

    expect(response.body.data.refreshToken).not.toBe(refreshToken);
  });

  it('should reject invalid refresh token', async () => {
    const response = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: 'invalid-token',
    });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it('should reject missing refresh token', async () => {
    const response = await request(app).post('/api/v1/auth/refresh').send({});

    expect(response.status).toBe(400);
  });

  it('should reject reused refresh token', async () => {
    const { refreshToken } = await createAuthenticatedUser();

    const first = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken,
    });

    expect(first.status).toBe(200);

    const second = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken,
    });

    expect(second.status).toBe(401);

    expect(second.body.success).toBe(false);
  });
});
