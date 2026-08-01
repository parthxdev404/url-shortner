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

    expect(response.body.message).toBe('Logged Out Successfully');
  });

  it('should invalidate refresh token after logout', async () => {
    const { accessToken, refreshToken } = await createAuthenticatedUser();

    await request(app).post('/api/v1/auth/logout').set('Authorization', `Bearer ${accessToken}`);

    const response = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken,
    });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it('should reject logout without token', async () => {
    const response = await request(app).post('/api/v1/auth/logout');

    expect(response.status).toBe(401);
  });

  it('should reject invalid access token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});
