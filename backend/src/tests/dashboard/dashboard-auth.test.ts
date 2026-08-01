import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';

describe('Dashboard Authentication & Edge Cases', () => {
  describe('Authentication', () => {
    const endpoints = [
      '/api/v1/dashboard',
      '/api/v1/dashboard/stats',
      '/api/v1/dashboard/top',
      '/api/v1/dashboard/recent',
    ];

    it.each(endpoints)('should reject requests to %s without authentication', async (endpoint) => {
      const response = await request(app).get(endpoint);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it.each(endpoints)('should reject invalid bearer token for %s', async (endpoint) => {
      const response = await request(app)
        .get(endpoint)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it.each(endpoints)('should reject malformed authorization header for %s', async (endpoint) => {
      const response = await request(app).get(endpoint).set('Authorization', 'Invalid token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Empty Dashboard', () => {
    it('should return empty dashboard for a new user', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.stats.totalUrls).toBe(0);
      expect(response.body.data.stats.totalClicks).toBe(0);

      expect(response.body.data.recentUrls).toEqual([]);
      expect(response.body.data.topUrls).toEqual([]);
    });

    it('should return empty stats for a new user', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data.totalUrls).toBe(0);
      expect(response.body.data.totalClicks).toBe(0);
    });

    it('should return empty recent urls for a new user', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/v1/dashboard/recent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data).toEqual([]);
    });

    it('should return empty top urls for a new user', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/v1/dashboard/top')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data).toEqual([]);
    });
  });
});
