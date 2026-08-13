import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';
import { createUrl } from '../helpers/create-url';
import { UrlModel } from '../../modules/url/model/url.model';

describe('DELETE /api/v1/urls/id/:id', () => {
  describe('deleteUrl', () => {
    it('should delete a URL by id', async () => {
      const { token } = await createAuthenticatedUser();

      const url = await createUrl(token);

      const response = await request(app)
        .delete(`/api/v1/urls/id/${url._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe('URL deleted successfully');

      // deleteUrl now performs a HARD delete.
      const deleted = await UrlModel.findById(url._id);

      expect(deleted).toBeNull();
    });

    it('should return 404 for a non-existing URL', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/v1/urls/id/507f191e810c19729de860ea')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should not delete another user's URL", async () => {
      const owner = await createAuthenticatedUser();
      const attacker = await createAuthenticatedUser();

      const url = await createUrl(owner.token);

      const response = await request(app)
        .delete(`/api/v1/urls/id/${url._id.toString()}`)
        .set('Authorization', `Bearer ${attacker.token}`)
        .expect(404);

      expect(response.body.success).toBe(false);

      const stillExists = await UrlModel.findById(url._id);

      expect(stillExists).not.toBeNull();
    });

    it('should require authentication', async () => {
      const { token } = await createAuthenticatedUser();

      const url = await createUrl(token);

      const response = await request(app).delete(`/api/v1/urls/id/${url._id}`);

      expect(response.status).toBe(401);
    });

    it('should not be returned by getById after deletion', async () => {
      const { token } = await createAuthenticatedUser();

      const url = await createUrl(token);

      await request(app)
        .delete(`/api/v1/urls/id/${url._id}`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .get(`/api/v1/urls/id/${url._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should not redirect after deletion', async () => {
      const { token } = await createAuthenticatedUser();

      const url = await createUrl(token);

      await request(app)
        .delete(`/api/v1/urls/id/${url._id}`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .get(`/api/v1/urls/${url.shortCode}`)
        .set('Authorization', `Bearer ${token}`)
        .redirects(0);

      expect(response.status).toBe(404);
    });
  });
});
