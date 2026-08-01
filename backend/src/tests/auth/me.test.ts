import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/auth';

describe('GET /api/v1/auth/me', () => {
  it('should return current user', async () => {
    const { accessToken, payload } = await createAuthenticatedUser();

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.email).toBe(payload.email);

    expect(response.body.data.name).toBe(payload.name);

    expect(response.body.data).not.toHaveProperty('passwordHash');
  });

  it('should reject missing token', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
  });

  it('should reject invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});
