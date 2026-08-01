import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';

import { createUrl } from '../helpers/create-url';

import { UrlModel } from '../../modules/url/model/url.model';
import { createAuthenticatedUser } from '../helpers/authenticated-user';

describe('GET /api/v1/urls', () => {
  it('should return all urls of authenticated user', async () => {
    const { user, token } = await createAuthenticatedUser();

    await createUrl(token, {
      originalUrl: 'https://google.com',
    });

    await createUrl(token, {
      originalUrl: 'https://github.com',
    });

    const response = await request(app).get('/api/v1/urls').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.items).toHaveLength(2);

    expect(response.body.data.total).toBe(2);

    expect(response.body.data.page).toBe(1);

    expect(response.body.data.limit).toBe(10);

    for (const url of response.body.data.items) {
      expect(url.userId).toBe(user.id);
    }
  });

  it('should paginate urls correctly', async () => {
    const { token } = await createAuthenticatedUser();

    for (let i = 0; i < 15; i++) {
      await createUrl(token, {
        originalUrl: `https://example${i}.com`,
      });
    }

    const response = await request(app)
      .get('/api/v1/urls?page=2&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.items).toHaveLength(5);

    expect(response.body.data.page).toBe(2);

    expect(response.body.data.limit).toBe(10);

    expect(response.body.data.total).toBe(15);

    expect(response.body.data.totalPages).toBe(2);
  });

  it('should search urls', async () => {
    const { token } = await createAuthenticatedUser();

    await createUrl(token, {
      originalUrl: 'https://google.com',
    });

    await createUrl(token, {
      originalUrl: 'https://github.com',
    });

    await createUrl(token, {
      originalUrl: 'https://openai.com',
    });

    const response = await request(app)
      .get('/api/v1/urls?search=git')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.items).toHaveLength(1);

    expect(response.body.data.items[0].originalUrl).toContain('github');
  });

  it('should sort urls by clicks', async () => {
    const { token } = await createAuthenticatedUser();

    const url1 = await createUrl(token, {
      originalUrl: 'https://google.com',
    });

    const url2 = await createUrl(token, {
      originalUrl: 'https://github.com',
    });

    await UrlModel.updateOne(
      {
        _id: url1._id,
      },
      {
        clicks: 50,
      },
    );

    await UrlModel.updateOne(
      {
        _id: url2._id,
      },
      {
        clicks: 10,
      },
    );

    const response = await request(app)
      .get('/api/v1/urls?sortBy=clicks&order=desc')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.items[0].clicks).toBe(50);

    expect(response.body.data.items[1].clicks).toBe(10);
  });

  it('should filter active urls', async () => {
    const { token } = await createAuthenticatedUser();

    const active = await createUrl(token);

    const inactive = await createUrl(token);

    const expired = await createUrl(token);

    await UrlModel.updateOne(
      {
        _id: inactive._id,
      },
      {
        isActive: false,
      },
    );

    await UrlModel.updateOne(
      {
        _id: expired._id,
      },
      {
        expiresAt: new Date(Date.now() - 60_000),
      },
    );

    const response = await request(app)
      .get('/api/v1/urls?status=active')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.items).toHaveLength(1);

    expect(response.body.data.items[0]._id).toBe(active._id);
  });

  it('should filter inactive urls', async () => {
    const { token } = await createAuthenticatedUser();

    await createUrl(token);

    const inactive = await createUrl(token);

    await UrlModel.updateOne(
      {
        _id: inactive._id,
      },
      {
        isActive: false,
      },
    );

    const response = await request(app)
      .get('/api/v1/urls?status=inactive')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.items).toHaveLength(1);

    expect(response.body.data.items[0]._id).toBe(inactive._id);
  });

  it('should filter expired urls', async () => {
    const { token } = await createAuthenticatedUser();

    await createUrl(token);

    const expired = await createUrl(token);

    await UrlModel.updateOne(
      {
        _id: expired._id,
      },
      {
        expiresAt: new Date(Date.now() - 60_000),
      },
    );

    const response = await request(app)
      .get('/api/v1/urls?status=expired')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.items).toHaveLength(1);

    expect(response.body.data.items[0]._id).toBe(expired._id);
  });

  it('should not return another users urls', async () => {
    const userA = await createAuthenticatedUser();

    const userB = await createAuthenticatedUser();

    await createUrl(userA.token);

    await createUrl(userA.token);

    await createUrl(userB.token);

    const response = await request(app)
      .get('/api/v1/urls')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.items).toHaveLength(2);

    for (const url of response.body.data.items) {
      expect(url.userId).toBe(userA.user.id);
    }
  });

  it('should reject unauthenticated request', async () => {
    const response = await request(app).get('/api/v1/urls');

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });
});
