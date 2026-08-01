import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../helpers/app';
import { createUser } from '../helpers/create-user';
import { login } from '../helpers/login';
import { UrlModel } from '../../modules/url/model/url.model';

describe('POST /api/v1/urls', () => {
  it('should create a short url successfully', async () => {
    const { user, password } = await createUser();

    const token = await login(user.email, password);

    const response = await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'https://google.com',
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe('Short URL created successfully');

    expect(response.body.data).toMatchObject({
      originalUrl: 'https://google.com',
      isActive: true,
      isDeleted: false,
      clicks: 0,
    });

    expect(response.body.data.shortCode).toBeDefined();

    const url = await UrlModel.findOne({
      shortCode: response.body.data.shortCode,
    });

    expect(url).not.toBeNull();

    expect(url?.originalUrl).toBe('https://google.com');

    expect(url?.userId.toString()).toBe(user.id);
  });

  it('should create a short url with custom alias', async () => {
    const { user, password } = await createUser();

    const token = await login(user.email, password);

    const response = await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'https://github.com',
        customAlias: 'parth123',
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.data.shortCode).toBe('parth123');

    const url = await UrlModel.findOne({
      shortCode: 'parth123',
    });

    expect(url).not.toBeNull();

    expect(url?.shortCode).toBe('parth123');
  });

  it('should reject duplicate custom alias', async () => {
    const { user, password } = await createUser();

    const token = await login(user.email, password);

    await request(app).post('/api/v1/urls').set('Authorization', `Bearer ${token}`).send({
      originalUrl: 'https://google.com',
      customAlias: 'duplicate-alias',
    });

    const response = await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'https://github.com',
        customAlias: 'duplicate-alias',
      });

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe('Custom alias already exists.');
  });

  it('should reject invalid original url', async () => {
    const { user, password } = await createUser();

    const token = await login(user.email, password);

    const response = await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'invalid-url',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('should reject missing required fields', async () => {
    const { user, password } = await createUser();

    const token = await login(user.email, password);

    const response = await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('should reject unauthenticated requests', async () => {
    const response = await request(app).post('/api/v1/urls').send({
      originalUrl: 'https://google.com',
    });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });
});
