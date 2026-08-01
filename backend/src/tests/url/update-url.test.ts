import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';
import { createUrl } from '../helpers/create-url';
import { UrlModel } from '../../modules/url/model/url.model';

describe('PATCH /api/v1/urls/id/:id', () => {
  it('should update original url', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    const response = await request(app)
      .patch(`/api/v1/urls/id/${url._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'https://openai.com',
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.originalUrl).toBe('https://openai.com');

    const updated = await UrlModel.findById(url._id);

    expect(updated?.originalUrl).toBe('https://openai.com');
  });

  it('should update expiresAt', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    const expiresAt = new Date(Date.now() + 86400000);

    const response = await request(app)
      .patch(`/api/v1/urls/id/${url._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        expiresAt,
      });

    expect(response.status).toBe(200);

    expect(new Date(response.body.data.expiresAt).getTime()).toBe(expiresAt.getTime());
  });

  it('should update isActive', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    const response = await request(app)
      .patch(`/api/v1/urls/id/${url._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        isActive: false,
      });

    expect(response.status).toBe(200);

    expect(response.body.data.isActive).toBe(false);

    const updated = await UrlModel.findById(url._id);

    expect(updated?.isActive).toBe(false);
  });

  it('should update multiple fields', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    const expiresAt = new Date(Date.now() + 86400000);

    const response = await request(app)
      .patch(`/api/v1/urls/id/${url._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'https://github.com',
        expiresAt,
        isActive: false,
      });

    expect(response.status).toBe(200);

    expect(response.body.data.originalUrl).toBe('https://github.com');

    expect(response.body.data.isActive).toBe(false);
  });

  it('should reject invalid object id', async () => {
    const { token } = await createAuthenticatedUser();

    const response = await request(app)
      .patch('/api/v1/urls/id/invalid')
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'https://google.com',
      });

    expect(response.status).toBe(400);
  });

  it('should reject invalid url', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    const response = await request(app)
      .patch(`/api/v1/urls/id/${url._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'not-a-url',
      });

    expect(response.status).toBe(400);
  });

  it('should return 404 for non existing url', async () => {
    const { token } = await createAuthenticatedUser();

    const response = await request(app)
      .patch('/api/v1/urls/id/507f191e810c19729de860ea')
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'https://google.com',
      });

    expect(response.status).toBe(404);
  });

  it('should not allow updating another users url', async () => {
    const userA = await createAuthenticatedUser();

    const userB = await createAuthenticatedUser();

    const url = await createUrl(userA.token);

    const response = await request(app)
      .patch(`/api/v1/urls/id/${url._id}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({
        originalUrl: 'https://hacked.com',
      });

    expect(response.status).toBe(404);
  });

  it('should require authentication', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    const response = await request(app).patch(`/api/v1/urls/id/${url._id}`).send({
      originalUrl: 'https://google.com',
    });

    expect(response.status).toBe(401);
  });

  it('should keep unchanged fields intact', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    await request(app)
      .patch(`/api/v1/urls/id/${url._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'https://newsite.com',
      });

    const updated = await UrlModel.findById(url._id);

    expect(updated?.shortCode).toBe(url.shortCode);

    expect(updated?.clicks).toBe(url.clicks);

    expect(updated?.userId.toString()).toBe(url.userId);
  });
});
