import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';
import { createUrl } from '../helpers/create-url';
import { UrlModel } from '../../modules/url/model/url.model';

describe('Bulk URL Actions', () => {
  describe('PATCH /api/v1/urls/bulk/deactivate', () => {
    it('should deactivate multiple URLs', async () => {
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

      expect(urls).toHaveLength(3);
      expect(urls.every((url) => url.isActive === false)).toBe(true);
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

    it("should not deactivate another user's URLs", async () => {
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

      expect(updated).not.toBeNull();
      expect(updated?.isActive).toBe(true);
    });
  });

  describe('DELETE /api/v1/urls/bulk', () => {
    it('should soft delete multiple URLs', async () => {
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

      expect(urls).toHaveLength(3);
      expect(urls.every((url) => url.isDeleted === true)).toBe(true);
      expect(urls.every((url) => url.deletedAt !== null)).toBe(true);
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

    it("should not delete another user's URLs", async () => {
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

      expect(updated).not.toBeNull();
      expect(updated?.isDeleted).toBe(false);
      expect(updated?.deletedAt).toBeNull();
    });
  });

  describe('PATCH /api/v1/urls/bulk/restore', () => {
    it('should restore multiple URLs', async () => {
      const { token } = await createAuthenticatedUser();

      const url1 = await createUrl(token);
      const url2 = await createUrl(token);

      /*
       * IMPORTANT:
       * Individual DELETE /id/:id is now a HARD DELETE.
       *
       * Bulk restore requires soft-deleted URLs,
       * so we must use the bulk DELETE endpoint here.
       */
      const deleteResponse = await request(app)
        .delete('/api/v1/urls/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [url1._id, url2._id],
        });

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      const deletedUrls = await UrlModel.find({
        _id: {
          $in: [url1._id, url2._id],
        },
      });

      expect(deletedUrls).toHaveLength(2);
      expect(deletedUrls.every((url) => url.isDeleted === true)).toBe(true);

      const response = await request(app)
        .patch('/api/v1/urls/bulk/restore')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: [url1._id, url2._id],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const restoredUrls = await UrlModel.find({
        _id: {
          $in: [url1._id, url2._id],
        },
      });

      expect(restoredUrls).toHaveLength(2);

      expect(restoredUrls.every((url) => url.isDeleted === false)).toBe(true);

      expect(restoredUrls.every((url) => url.deletedAt === null)).toBe(true);
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

    it("should not restore another user's URLs", async () => {
      const owner = await createAuthenticatedUser();
      const attacker = await createAuthenticatedUser();

      const url = await createUrl(owner.token);

      /*
       * Soft delete the owner's URL using the bulk endpoint.
       * We cannot use DELETE /id/:id because that permanently
       * removes the document.
       */
      const deleteResponse = await request(app)
        .delete('/api/v1/urls/bulk')
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          ids: [url._id],
        });

      expect(deleteResponse.status).toBe(200);

      const deleted = await UrlModel.findById(url._id);

      expect(deleted).not.toBeNull();
      expect(deleted?.isDeleted).toBe(true);

      const response = await request(app)
        .patch('/api/v1/urls/bulk/restore')
        .set('Authorization', `Bearer ${attacker.token}`)
        .send({
          ids: [url._id],
        });

      expect(response.status).toBe(404);

      const updated = await UrlModel.findById(url._id);

      expect(updated).not.toBeNull();

      /*
       * The attacker must not be able to restore
       * another user's deleted URL.
       */
      expect(updated?.isDeleted).toBe(true);
      expect(updated?.deletedAt).not.toBeNull();
    });
  });
});
