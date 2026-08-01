import request from 'supertest';
import app from './app';

type CreateUrlOptions = {
  originalUrl?: string;
  customAlias?: string;
};

export async function createUrl(token: string, options: CreateUrlOptions = {}) {
  const response = await request(app)
    .post('/api/v1/urls')
    .set('Authorization', `Bearer ${token}`)
    .send({
      originalUrl: options.originalUrl ?? 'https://google.com',
      customAlias: options.customAlias,
    });

  if (response.status !== 201) {
    throw new Error(`URL creation failed.\n${JSON.stringify(response.body, null, 2)}`);
  }

  return response.body.data;
}
