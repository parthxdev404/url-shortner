import request from 'supertest';
import app from './app';

export async function login(email: string, password: string): Promise<string> {
  const response = await request(app).post('/api/v1/auth/login').send({
    email,
    password,
  });

  if (response.status !== 200) {
    throw new Error(`Login failed.\n${JSON.stringify(response.body, null, 2)}`);
  }

  return response.body.data.accessToken;
}
