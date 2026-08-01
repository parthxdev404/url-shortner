import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';
import { createUrl } from '../helpers/create-url';

import { AnalyticsModel } from '../../modules/analytics/model/analytics.model';
describe('GET /api/v1/analytics/:id/analytics', () => {
  it('should return analytics for a url', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    await AnalyticsModel.create([
      {
        urlId: url._id,
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
        browser: 'Chrome',
        os: 'Windows',
        device: 'Desktop',
        country: 'India',
        city: 'Delhi',
        referrer: 'Google',
      },
      {
        urlId: url._id,
        ipAddress: '127.0.0.2',
        userAgent: 'Firefox',
        browser: 'Firefox',
        os: 'Linux',
        device: 'Desktop',
        country: 'India',
        city: 'Delhi',
        referrer: 'Twitter',
      },
    ]);

    const response = await request(app)
      .get(`/api/v1/analytics/${url._id}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data.length).toBe(2);
  });

  it('should return empty array when no analytics exist', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    const response = await request(app)
      .get(`/api/v1/analytics/${url._id}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toEqual([]);
  });

  it('should return 404 when url does not exist', async () => {
    const { token } = await createAuthenticatedUser();

    const response = await request(app)
      .get(`/api/v1/analytics/${new Types.ObjectId()}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe('URL not found');
  });

  it('should reject invalid mongodb id', async () => {
    const { token } = await createAuthenticatedUser();

    const response = await request(app)
      .get('/api/v1/analytics/invalid-id/analytics')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('should require authentication', async () => {
    const response = await request(app).get(`/api/v1/analytics/${new Types.ObjectId()}/analytics`);

    expect(response.status).toBe(401);
  });

  it('should return analytics ordered by latest click first', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    await AnalyticsModel.create({
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
    });

    await AnalyticsModel.create({
      urlId: url._id,
      ipAddress: '2.2.2.2',
      userAgent: 'Firefox',
      browser: 'Firefox',
      os: 'Linux',
      device: 'Desktop',
      country: 'India',
      city: 'Delhi',
      referrer: 'Twitter',
      clickedAt: new Date('2026-02-01'),
    });

    const response = await request(app)
      .get(`/api/v1/analytics/${url._id}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(new Date(response.body.data[0].clickedAt).getTime()).toBeGreaterThan(
      new Date(response.body.data[1].clickedAt).getTime(),
    );
  });

  it('should return all analytics belonging only to requested url', async () => {
    const { token } = await createAuthenticatedUser();

    const url1 = await createUrl(token);
    const url2 = await createUrl(token);

    await AnalyticsModel.create({
      urlId: url1._id,
      ipAddress: '1.1.1.1',
      userAgent: 'Chrome',
      browser: 'Chrome',
      os: 'Windows',
      device: 'Desktop',
      country: 'India',
      city: 'Delhi',
    });

    await AnalyticsModel.create({
      urlId: url2._id,
      ipAddress: '2.2.2.2',
      userAgent: 'Firefox',
      browser: 'Firefox',
      os: 'Linux',
      device: 'Desktop',
      country: 'India',
      city: 'Mumbai',
    });

    const response = await request(app)
      .get(`/api/v1/analytics/${url1._id}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0].urlId).toBe(url1._id.toString());
  });
});
