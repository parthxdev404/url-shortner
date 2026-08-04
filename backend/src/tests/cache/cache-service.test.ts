import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';
import { createUrl } from '../helpers/create-url';

import { cacheService } from '../../shared/cache/cache.service';

describe('Redis Cache', () => {
  it('should cache analytics after first request', async () => {
    const { token } = await createAuthenticatedUser();
    const url = await createUrl(token);

    const getSpy = vi.spyOn(cacheService, 'get');
    const setSpy = vi.spyOn(cacheService, 'set');

    const response = await request(app)
      .get(`/api/v1/analytics/${url._id}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(getSpy).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalled();

    getSpy.mockRestore();
    setSpy.mockRestore();
  });

  it('should use cached analytics on second request', async () => {
    const { token } = await createAuthenticatedUser();
    const url = await createUrl(token);

    await request(app)
      .get(`/api/v1/analytics/${url._id}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    const getSpy = vi.spyOn(cacheService, 'get');

    const response = await request(app)
      .get(`/api/v1/analytics/${url._id}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(getSpy).toHaveBeenCalled();

    getSpy.mockRestore();
  });

  it('should cache redirected urls', async () => {
    const { token } = await createAuthenticatedUser();
    const url = await createUrl(token);

    const getSpy = vi.spyOn(cacheService, 'get');
    const setSpy = vi.spyOn(cacheService, 'set');

    const response = await request(app).get(`/api/v1/urls/${url.shortCode}`);

    expect(response.status).toBe(302);
    expect(getSpy).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalled();

    getSpy.mockRestore();
    setSpy.mockRestore();
  });

  it('should cache dashboard stats', async () => {
    const { token } = await createAuthenticatedUser();

    const getSpy = vi.spyOn(cacheService, 'get');

    const response = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(getSpy).toHaveBeenCalled();

    getSpy.mockRestore();
  });

  it('should invalidate cache after url update', async () => {
    const { token } = await createAuthenticatedUser();
    const url = await createUrl(token);

    const deleteSpy = vi.spyOn(cacheService, 'delete');

    const response = await request(app)
      .patch(`/api/v1/urls/id/${url._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'https://google.com',
      });

    expect(response.status).toBe(200);
    expect(deleteSpy).toHaveBeenCalled();

    deleteSpy.mockRestore();
  });

  it('should invalidate cache after url delete', async () => {
    const { token } = await createAuthenticatedUser();
    const url = await createUrl(token);

    const deleteSpy = vi.spyOn(cacheService, 'delete');

    const response = await request(app)
      .delete(`/api/v1/urls/id/${url._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(deleteSpy).toHaveBeenCalled();

    deleteSpy.mockRestore();
  });

  it('should invalidate cache after url deactivation', async () => {
    const { token } = await createAuthenticatedUser();
    const url = await createUrl(token);

    const deleteSpy = vi.spyOn(cacheService, 'delete');

    const response = await request(app)
      .patch(`/api/v1/urls/id/${url._id}/deactivate`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(deleteSpy).toHaveBeenCalled();

    deleteSpy.mockRestore();
  });

  it('should not fail when cache is empty', async () => {
    const { token } = await createAuthenticatedUser();

    vi.spyOn(cacheService, 'get').mockResolvedValueOnce(null);

    const response = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
