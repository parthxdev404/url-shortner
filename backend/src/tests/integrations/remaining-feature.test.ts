import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';
import { createUrl } from '../helpers/create-url';

describe('Remaining Integration Tests', () => {
  describe('Authorization', () => {
    it('should not allow another user to update a url', async () => {
      const owner = await createAuthenticatedUser();
      const stranger = await createAuthenticatedUser();

      const url = await createUrl(owner.token);

      const response = await request(app)
        .patch(`/api/v1/urls/id/${url._id}`)
        .set('Authorization', `Bearer ${stranger.token}`)
        .send({
          originalUrl: 'https://google.com',
        });

      expect(response.status).toBe(404);
    });

    it('should not allow another user to delete a url', async () => {
      const owner = await createAuthenticatedUser();
      const stranger = await createAuthenticatedUser();

      const url = await createUrl(owner.token);

      const response = await request(app)
        .delete(`/api/v1/urls/id/${url._id}`)
        .set('Authorization', `Bearer ${stranger.token}`);

      expect(response.status).toBe(404);
    });

    it('should not allow another user to deactivate a url', async () => {
      const owner = await createAuthenticatedUser();
      const stranger = await createAuthenticatedUser();

      const url = await createUrl(owner.token);

      const response = await request(app)
        .patch(`/api/v1/urls/id/${url._id}/deactivate`)
        .set('Authorization', `Bearer ${stranger.token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Validation', () => {
    it('should reject invalid url when creating short url', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/v1/urls')
        .set('Authorization', `Bearer ${token}`)
        .send({
          originalUrl: 'this-is-not-a-valid-url',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid mongodb id', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/v1/urls/id/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing required fields', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/v1/urls')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid pagination values', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/v1/urls?page=-1&limit=0')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk delete urls', async () => {
      const { token } = await createAuthenticatedUser();

      const url1 = await createUrl(token);
      const url2 = await createUrl(token);

      const response = await request(app)
        .delete('/api/v1/urls/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [url1._id.toString(), url2._id.toString()],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Soft-deleted URLs should no longer be accessible
      const deleted1 = await request(app)
        .get(`/api/v1/urls/id/${url1._id}`)
        .set('Authorization', `Bearer ${token}`);

      const deleted2 = await request(app)
        .get(`/api/v1/urls/id/${url2._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleted1.status).toBe(404);
      expect(deleted2.status).toBe(404);
    });

    it('should bulk restore urls', async () => {
      const { token } = await createAuthenticatedUser();

      const url1 = await createUrl(token);
      const url2 = await createUrl(token);

      // Soft delete first
      await request(app)
        .delete('/api/v1/urls/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [url1._id.toString(), url2._id.toString()],
        });

      // Restore
      const response = await request(app)
        .patch('/api/v1/urls/bulk/restore')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [url1._id.toString(), url2._id.toString()],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const restored1 = await request(app)
        .get(`/api/v1/urls/id/${url1._id}`)
        .set('Authorization', `Bearer ${token}`);

      const restored2 = await request(app)
        .get(`/api/v1/urls/id/${url2._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(restored1.body.data.isDeleted).toBe(false);
      expect(restored2.body.data.isDeleted).toBe(false);
    });

    it('should bulk deactivate urls', async () => {
      const { token } = await createAuthenticatedUser();

      const url1 = await createUrl(token);
      const url2 = await createUrl(token);

      const response = await request(app)
        .patch('/api/v1/urls/bulk/deactivate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [url1._id.toString(), url2._id.toString()],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deactivated1 = await request(app)
        .get(`/api/v1/urls/id/${url1._id}`)
        .set('Authorization', `Bearer ${token}`);

      const deactivated2 = await request(app)
        .get(`/api/v1/urls/id/${url2._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deactivated1.body.data.isActive).toBe(false);
      expect(deactivated2.body.data.isActive).toBe(false);
    });
  });

  describe('Dashboard', () => {
    it('should return dashboard statistics', async () => {
      const { token } = await createAuthenticatedUser();

      await createUrl(token);
      await createUrl(token);

      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveProperty('totalUrls');
      expect(response.body.data).toHaveProperty('activeUrls');
      expect(response.body.data).toHaveProperty('totalClicks');
    });

    it('should return recent urls', async () => {
      const { token } = await createAuthenticatedUser();

      await createUrl(token);
      await createUrl(token);

      const response = await request(app)
        .get('/api/v1/dashboard/recent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return top clicked urls', async () => {
      const { token } = await createAuthenticatedUser();

      const url = await createUrl(token);

      await request(app).get(`/${url.shortCode}`);
      await request(app).get(`/${url.shortCode}`);

      const response = await request(app)
        .get('/api/v1/dashboard/top')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('General Errors', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/v1/dashboard/stats');

      expect(response.status).toBe(401);
    });

    it('should return 404 for missing resources', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/v1/urls/id/507f191e810c19729de860ea')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should return 409 when duplicate alias is used', async () => {
      const { token } = await createAuthenticatedUser();

      await request(app).post('/api/v1/urls').set('Authorization', `Bearer ${token}`).send({
        originalUrl: 'https://google.com',
        customAlias: 'myalias',
      });

      const response = await request(app)
        .post('/api/v1/urls')
        .set('Authorization', `Bearer ${token}`)
        .send({
          originalUrl: 'https://github.com',
          customAlias: 'myalias',
        });

      expect(response.status).toBe(409);
    });
  });
});
