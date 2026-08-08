import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/auth';

describe('GET /api/v1/auth/me', () => {
  it('should return current authenticated user', async () => {
    const { accessToken, email } = await createAuthenticatedUser();

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toBeDefined();

    expect(response.body.data.email).toBe(email);

    expect(response.body.data.name).toBe('Test User');

    expect(response.body.data).not.toHaveProperty('passwordHash');
  });

  it('should reject request without access token', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should reject request with an invalid access token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
