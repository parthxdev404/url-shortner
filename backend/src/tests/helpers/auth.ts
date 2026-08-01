import request from 'supertest';

import app from './app';
import { registerUser } from './user';

type CreateAuthenticatedUserOptions = {
  verifyEmail?: boolean;
};

export async function createAuthenticatedUser(options: CreateAuthenticatedUserOptions = {}) {
  const { verifyEmail = false } = options;

  const { payload, user } = await registerUser();

  // If your app requires verified users before login,
  // we'll implement this later.
  if (verifyEmail) {
    // TODO:
    // await verifyUser(user.id);
  }

  const response = await request(app).post('/api/v1/auth/login').send({
    email: payload.email,
    password: payload.password,
  });

  if (response.status !== 200) {
    throw new Error(
      `Login failed during test setup.\nStatus: ${response.status}\nBody: ${JSON.stringify(response.body, null, 2)}`,
    );
  }

  return {
    user,
    payload,
    accessToken: response.body.data.accessToken,
    refreshToken: response.body.data.refreshToken,
    cookies: response.headers['set-cookie'] ?? [],
  };
}
