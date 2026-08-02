import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';
import { createUrl } from '../helpers/create-url';

import { UrlModel } from '../../modules/url/model/url.model';

describe('Dashboard Module', () => {
  let token: string;

  beforeEach(async () => {
    const auth = await createAuthenticatedUser();
    token = auth.token;

    const url1 = await createUrl(token);
    const url2 = await createUrl(token);
    const url3 = await createUrl(token);
    const url4 = await createUrl(token);

    await UrlModel.findByIdAndUpdate(url1._id, {
      clicks: 120,
    });

    await UrlModel.findByIdAndUpdate(url2._id, {
      clicks: 70,
      isActive: false,
    });

    await UrlModel.findByIdAndUpdate(url3._id, {
      clicks: 15,
      expiresAt: new Date(Date.now() - 1000),
    });

    await UrlModel.findByIdAndUpdate(url4._id, {
      clicks: 2,
      isDeleted: true,
      deletedAt: new Date(),
    });
  });

  describe('GET /dashboard/stats', () => {
    it('should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.totalUrls).toBe(3);

      expect(response.body.data.activeUrls).toBeGreaterThanOrEqual(1);
      expect(response.body.data.inactiveUrls).toBeGreaterThanOrEqual(1);
      expect(response.body.data.deletedUrls).toBeGreaterThanOrEqual(1);
      expect(response.body.data.expiredUrls).toBeGreaterThanOrEqual(1);
      expect(response.body.data.totalClicks).toBe(205);
    });
  });

  describe('GET /dashboard/recent', () => {
    it('should return recent urls', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/recent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(Array.isArray(response.body.data)).toBe(true);

      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /dashboard/top', () => {
    it('should return urls sorted by clicks', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/top')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(Array.isArray(response.body.data)).toBe(true);

      expect(response.body.data.length).toBeGreaterThan(0);

      for (let i = 0; i < response.body.data.length - 1; i++) {
        expect(response.body.data[i].clicks).toBeGreaterThanOrEqual(
          response.body.data[i + 1].clicks,
        );
      }
    });
  });

  describe('GET /dashboard', () => {
    it('should return complete dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data).toHaveProperty('recentUrls');
      expect(response.body.data).toHaveProperty('topUrls');

      expect(Array.isArray(response.body.data.recentUrls)).toBe(true);
      expect(Array.isArray(response.body.data.topUrls)).toBe(true);

      expect(response.body.data.stats.totalUrls).toBe(3);
    });
  });

  describe('Authentication', () => {
    it('should reject unauthenticated stats request', async () => {
      const response = await request(app).get('/api/v1/dashboard/stats');

      expect(response.status).toBe(401);
    });

    it('should reject unauthenticated dashboard request', async () => {
      const response = await request(app).get('/api/v1/dashboard');

      expect(response.status).toBe(401);
    });

    it('should reject unauthenticated top urls request', async () => {
      const response = await request(app).get('/api/v1/dashboard/top');

      expect(response.status).toBe(401);
    });

    it('should reject unauthenticated recent urls request', async () => {
      const response = await request(app).get('/api/v1/dashboard/recent');

      expect(response.status).toBe(401);
    });
  });
});
