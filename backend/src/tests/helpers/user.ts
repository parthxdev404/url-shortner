import request from 'supertest';

import app from './app';
import { defaultUser } from '../fixtures/users';

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(overrides: Partial<RegisterUserInput> = {}) {
  const payload: RegisterUserInput = {
    ...defaultUser,
    email: `user-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    ...overrides,
  };

  const response = await request(app).post('/api/v1/auth/register').send(payload);

  if (response.status !== 201) {
    throw new Error(`User registration failed: ${JSON.stringify(response.body)}`);
  }

  return {
    payload,
    response,
    user: response.body.data,
  };
}
