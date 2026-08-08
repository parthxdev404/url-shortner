import request from 'supertest';

import app from './app';

import { UserModel } from '../../modules/users/model/user.model';
import { hashPassword } from '../../shared/utils/password';

interface AuthenticatedUser {
  userId: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
}

export async function createAuthenticatedUser(): Promise<AuthenticatedUser> {
  const email = `test-${Date.now()}@example.com`;
  const password = 'Password123!';

  const passwordHash = await hashPassword(password);

  // Create an already-verified user directly in the database.
  // This helper is intentionally NOT testing:
  // register -> verify email -> login.
  const user = await UserModel.create({
    name: 'Test User',
    email,
    passwordHash,
    isVerified: true,
  });

  // Confirm the value actually persisted.
  const savedUser = await UserModel.findById(user.id);

  if (!savedUser) {
    throw new Error('Test user was not created.');
  }

  if (!savedUser.isVerified) {
    throw new Error(
      `Test user was created but isVerified is false.\n` +
        `User: ${JSON.stringify(savedUser.toObject(), null, 2)}`,
    );
  }

  const response = await request(app).post('/api/v1/auth/login').send({
    email,
    password,
  });

  if (response.status !== 200) {
    throw new Error(
      `Login failed during test setup.\n` +
        `Status: ${response.status}\n` +
        `Body: ${JSON.stringify(response.body, null, 2)}\n` +
        `Created user: ${JSON.stringify(
          {
            id: savedUser.id,
            email: savedUser.email,
            isVerified: savedUser.isVerified,
          },
          null,
          2,
        )}`,
    );
  }

  return {
    userId: savedUser.id,
    email,
    password,
    accessToken: response.body.data.accessToken,
    refreshToken: response.body.data.refreshToken,
  };
}
