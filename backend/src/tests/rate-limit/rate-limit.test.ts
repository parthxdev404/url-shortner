import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import app from '../helpers/app';
import { createAuthenticatedUser } from '../helpers/authenticated-user';
import { createUrl } from '../helpers/create-url';

import { cacheService } from '../../shared/cache/cache.service';
import { AnalyticsModel } from '../../modules/analytics/model/analytics.model';
import { UrlModel } from '../../modules/url/model/url.model';

describe('Redis Cache', () => {
  it('should cache analytics after first request', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    const getSpy = vi.spyOn(cacheService, 'get');
    const setSpy = vi.spyOn(cacheService, 'set');

    await request(app)
      .get(`/api/v1/analytics/${url._id}/analytics`)
      .set('Authorization', `Bearer ${token}`);

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

    await request(app)
      .get(`/api/v1/analytics/${url._id}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    expect(getSpy).toHaveBeenCalled();

    getSpy.mockRestore();
  });

  it('should refresh analytics after a new click', async () => {
    const { token } = await createAuthenticatedUser();

    const url = await createUrl(token);

    // First request (fills cache)
    const firstResponse = await request(app)
      .get(`/api/v1/analytics/${url._id}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    expect(firstResponse.status).toBe(200);

    const initialClicks = firstResponse.body.data.totalClicks;

    // Simulate redirect
    const redirect = await request(app).get(`/api/v1/urls/${url.shortCode}`);

    console.log('Redirect Status:', redirect.status);
    console.log('Redirect Location:', redirect.headers.location);

    // Check analytics documents
    const analyticsDocs = await AnalyticsModel.find({
      urlId: url._id,
    });

    console.log('Analytics Count:', analyticsDocs.length);

    // Check URL clicks
    const updatedUrl = await UrlModel.findById(url._id);

    console.log('URL Clicks:', updatedUrl?.clicks);

    // Second request
    const secondResponse = await request(app)
      .get(`/api/v1/analytics/${url._id}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    console.log('Second Analytics:', secondResponse.body.data);

    expect(secondResponse.status).toBe(200);

    expect(secondResponse.body.data.totalClicks).toBe(initialClicks + 1);
  });

  it('should cache dashboard stats', async () => {
    const { token } = await createAuthenticatedUser();

    const getSpy = vi.spyOn(cacheService, 'get');
    const setSpy = vi.spyOn(cacheService, 'set');

    await request(app).get('/api/v1/dashboard/stats').set('Authorization', `Bearer ${token}`);

    expect(getSpy).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalled();

    getSpy.mockRestore();
    setSpy.mockRestore();
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
