import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/auth';

describe('POST /api/v1/auth/logout', () => {
  it('should logout successfully', async () => {
    const { accessToken } = await createAuthenticatedUser();

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Logged out successfully.');
  });

  it('should invalidate refresh token after logout', async () => {
    const { accessToken, refreshToken } = await createAuthenticatedUser();

    const logoutResponse = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.success).toBe(true);

    const refreshResponse = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken,
    });

    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body.success).toBe(false);
  });

  it('should reject logout without access token', async () => {
    const response = await request(app).post('/api/v1/auth/logout');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should reject logout with an invalid access token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
