import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';
import { createUrl } from '../helpers/create-url';

import { UrlModel } from '../../modules/url/model/url.model';
import { AnalyticsModel } from '../../modules/analytics/model/analytics.model';

describe('GET /api/v1/urls/:shortCode', () => {
  it('should redirect to original url', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token, {
      originalUrl: 'https://openai.com',
    });

    const response = await request(app)
      .get(`/api/v1/urls/${url.shortCode}`)
      .set('Authorization', `Bearer ${token}`)
      .redirects(0);

    expect(response.status).toBe(302);

    expect(response.headers.location).toBe('https://openai.com');
  });

  it('should increment click count', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    await request(app)
      .get(`/api/v1/urls/${url.shortCode}`)
      .set('Authorization', `Bearer ${token}`)
      .redirects(0);

    const updated = await UrlModel.findById(url._id);

    expect(updated?.clicks).toBe(1);
  });

  it('should create analytics record', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    await request(app)
      .get(`/api/v1/urls/${url.shortCode}`)
      .set('Authorization', `Bearer ${token}`)
      .set('User-Agent', 'Mozilla/5.0')
      .redirects(0);

    const analytics = await AnalyticsModel.findOne({
      urlId: url._id,
    });

    expect(analytics).not.toBeNull();

    expect(analytics?.urlId.toString()).toBe(url._id);

    expect(analytics?.browser).toBeDefined();

    expect(analytics?.os).toBeDefined();
  });

  it('should return 404 for invalid shortcode', async () => {
    const { token } = await createAuthenticatedUser();

    const response = await request(app)
      .get('/api/v1/urls/abcdef')
      .set('Authorization', `Bearer ${token}`)
      .redirects(0);

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);
  });

  it('should reject inactive urls', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    await UrlModel.updateOne(
      {
        _id: url._id,
      },
      {
        isActive: false,
      },
    );

    const response = await request(app)
      .get(`/api/v1/urls/${url.shortCode}`)
      .set('Authorization', `Bearer ${token}`)
      .redirects(0);

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);
  });

  it('should reject expired urls', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    await UrlModel.updateOne(
      {
        _id: url._id,
      },
      {
        expiresAt: new Date(Date.now() - 1000),
      },
    );

    const response = await request(app)
      .get(`/api/v1/urls/${url.shortCode}`)
      .set('Authorization', `Bearer ${token}`)
      .redirects(0);

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);
  });

  it('should increment clicks on every redirect', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    for (let i = 0; i < 5; i++) {
      await request(app)
        .get(`/api/v1/urls/${url.shortCode}`)
        .set('Authorization', `Bearer ${token}`)
        .redirects(0);
    }

    const updated = await UrlModel.findById(url._id);

    expect(updated?.clicks).toBe(5);
  });

  it('should create analytics for every redirect', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    for (let i = 0; i < 3; i++) {
      await request(app)
        .get(`/api/v1/urls/${url.shortCode}`)
        .set('Authorization', `Bearer ${token}`)
        .redirects(0);
    }

    const count = await AnalyticsModel.countDocuments({
      urlId: url._id,
    });

    expect(count).toBe(3);
  });
});
