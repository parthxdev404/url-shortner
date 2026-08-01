import request from 'supertest';
import { describe, expect, it, beforeEach } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';
import { createUrl } from '../helpers/create-url';

import { AnalyticsModel } from '../../modules/analytics/model/analytics.model';
describe('Analytics Stats Endpoints', () => {
  let token: string;
  let url: Awaited<ReturnType<typeof createUrl>>;

  beforeEach(async () => {
    const auth = await createAuthenticatedUser();

    token = auth.token;

    url = await createUrl(token);

    await AnalyticsModel.insertMany([
      {
        urlId: url._id,
        ipAddress: '1.1.1.1',
        userAgent: 'Chrome',
        browser: 'Chrome',
        os: 'Windows',
        device: 'Desktop',
        country: 'India',
        city: 'Delhi',
        referrer: 'Google',
        clickedAt: new Date('2026-01-01'),
      },
      {
        urlId: url._id,
        ipAddress: '2.2.2.2',
        userAgent: 'Chrome',
        browser: 'Chrome',
        os: 'Windows',
        device: 'Desktop',
        country: 'India',
        city: 'Delhi',
        referrer: 'Google',
        clickedAt: new Date('2026-01-01'),
      },
      {
        urlId: url._id,
        ipAddress: '3.3.3.3',
        userAgent: 'Firefox',
        browser: 'Firefox',
        os: 'Linux',
        device: 'Mobile',
        country: 'USA',
        city: 'New York',
        referrer: 'Twitter',
        clickedAt: new Date('2026-01-02'),
      },
    ]);
  });

  describe('GET /:urlId', () => {
    it('should return overview', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/${url._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data.totalClicks).toBe(3);

      expect(response.body.data.uniqueVisitors).toBe(3);

      expect(response.body.data.topBrowser).toBe('Chrome');

      expect(response.body.data.topOS).toBe('Windows');

      expect(response.body.data.lastClicked).toBeTruthy();
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app).get(`/api/v1/analytics/${url._id}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /:urlId/timeline', () => {
    it('should return timeline', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/${url._id}/timeline`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data).toEqual([
        {
          date: '2026-01-01',
          clicks: 2,
        },
        {
          date: '2026-01-02',
          clicks: 1,
        },
      ]);
    });
  });

  describe('GET /:urlId/browser', () => {
    it('should return browser distribution', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/${url._id}/browser`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data).toEqual([
        {
          name: 'Chrome',
          count: 2,
        },
        {
          name: 'Firefox',
          count: 1,
        },
      ]);
    });
  });

  describe('GET /:urlId/os', () => {
    it('should return os distribution', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/${url._id}/os`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data).toEqual([
        {
          name: 'Windows',
          count: 2,
        },
        {
          name: 'Linux',
          count: 1,
        },
      ]);
    });
  });

  describe('GET /:urlId/device', () => {
    it('should return device distribution', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/${url._id}/device`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data).toEqual([
        {
          name: 'Desktop',
          count: 2,
        },
        {
          name: 'Mobile',
          count: 1,
        },
      ]);
    });
  });

  describe('GET /:urlId/referrer', () => {
    it('should return referrer distribution', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/${url._id}/referrer`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data).toEqual([
        {
          name: 'Google',
          count: 2,
        },
        {
          name: 'Twitter',
          count: 1,
        },
      ]);
    });
  });

  describe('GET /:urlId/country', () => {
    it('should return country distribution', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/${url._id}/country`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data).toEqual([
        {
          name: 'India',
          count: 2,
        },
        {
          name: 'USA',
          count: 1,
        },
      ]);
    });
  });

  it('should reject invalid object id', async () => {
    const response = await request(app)
      .get('/api/v1/analytics/invalid/browser')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
