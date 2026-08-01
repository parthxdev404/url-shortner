import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';
import { createUrl } from '../helpers/create-url';
import { UrlModel } from '../../modules/url/model/url.model';

describe('Bulk URL Actions', () => {
  describe('PATCH /api/v1/urls/bulk/deactivate', () => {
    it('should deactivate multiple urls', async () => {
      const { token } = await createAuthenticatedUser();

      const url1 = await createUrl(token);
      const url2 = await createUrl(token);
      const url3 = await createUrl(token);

      const response = await request(app)
        .patch('/api/v1/urls/bulk/deactivate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [url1._id, url2._id, url3._id],
        });

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      const urls = await UrlModel.find({
        _id: {
          $in: [url1._id, url2._id, url3._id],
        },
      });

      expect(urls.every((u) => u.isActive === false)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/urls/bulk/deactivate')
        .send({
          ids: ['507f191e810c19729de860ea'],
        });

      expect(response.status).toBe(401);
    });

    it('should validate ids', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .patch('/api/v1/urls/bulk/deactivate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [],
        });

      expect(response.status).toBe(400);
    });

    it("should not deactivate another user's urls", async () => {
      const owner = await createAuthenticatedUser();
      const attacker = await createAuthenticatedUser();

      const url = await createUrl(owner.token);

      const response = await request(app)
        .patch('/api/v1/urls/bulk/deactivate')
        .set('Authorization', `Bearer ${attacker.token}`)
        .send({
          ids: [url._id],
        });

      expect(response.status).toBe(404);

      const updated = await UrlModel.findById(url._id);

      expect(updated?.isActive).toBe(true);
    });
  });

  describe('DELETE /api/v1/urls/bulk', () => {
    it('should soft delete multiple urls', async () => {
      const { token } = await createAuthenticatedUser();

      const url1 = await createUrl(token);
      const url2 = await createUrl(token);
      const url3 = await createUrl(token);

      const response = await request(app)
        .delete('/api/v1/urls/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [url1._id, url2._id, url3._id],
        });

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      const urls = await UrlModel.find({
        _id: {
          $in: [url1._id, url2._id, url3._id],
        },
      });

      expect(urls.every((u) => u.isDeleted)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/urls/bulk')
        .send({
          ids: ['507f191e810c19729de860ea'],
        });

      expect(response.status).toBe(401);
    });

    it('should validate ids', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/v1/urls/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [],
        });

      expect(response.status).toBe(400);
    });

    it("should not delete another user's urls", async () => {
      const owner = await createAuthenticatedUser();
      const attacker = await createAuthenticatedUser();

      const url = await createUrl(owner.token);

      const response = await request(app)
        .delete('/api/v1/urls/bulk')
        .set('Authorization', `Bearer ${attacker.token}`)
        .send({
          ids: [url._id],
        });

      expect(response.status).toBe(404);

      const updated = await UrlModel.findById(url._id);

      expect(updated?.isDeleted).toBe(false);
    });
  });

  describe('PATCH /api/v1/urls/bulk/restore', () => {
    it('should restore multiple urls', async () => {
      const { token } = await createAuthenticatedUser();

      const url1 = await createUrl(token);
      const url2 = await createUrl(token);

      await request(app)
        .delete(`/api/v1/urls/id/${url1._id}`)
        .set('Authorization', `Bearer ${token}`);

      await request(app)
        .delete(`/api/v1/urls/id/${url2._id}`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .patch('/api/v1/urls/bulk/restore')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [url1._id, url2._id],
        });

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      const urls = await UrlModel.find({
        _id: {
          $in: [url1._id, url2._id],
        },
      });

      expect(urls.every((u) => !u.isDeleted)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/urls/bulk/restore')
        .send({
          ids: ['507f191e810c19729de860ea'],
        });

      expect(response.status).toBe(401);
    });

    it('should validate ids', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .patch('/api/v1/urls/bulk/restore')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [],
        });

      expect(response.status).toBe(400);
    });

    it("should not restore another user's urls", async () => {
      const owner = await createAuthenticatedUser();
      const attacker = await createAuthenticatedUser();

      const url = await createUrl(owner.token);

      await request(app)
        .delete(`/api/v1/urls/id/${url._id}`)
        .set('Authorization', `Bearer ${owner.token}`);

      const response = await request(app)
        .patch('/api/v1/urls/bulk/restore')
        .set('Authorization', `Bearer ${attacker.token}`)
        .send({
          ids: [url._id],
        });

      expect(response.status).toBe(404);

      const updated = await UrlModel.findById(url._id);

      expect(updated?.isDeleted).toBe(true);
    });
  });
});
