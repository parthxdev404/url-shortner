import request from 'supertest';
import { describe, it, expect } from 'vitest';

import app from '../helpers/app';
import { vi } from 'vitest';
import { UserModel } from '../../modules/users/model/user.model';

vi.mock('../../src/shared/queue/jobs/email.jobs', () => ({
  enqueVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));
import { enqueVerificationEmail } from '../../shared/queue/jobs/send-verification-email.jobs';

describe('POST /api/v1/auth/register', () => {
  it('should register a new user successfully', async () => {
    const payload = {
      name: 'Parth Sharma',
      email: 'parth@example.com',
      password: 'Password@123',
    };

    const response = await request(app).post('/api/v1/auth/register').send(payload);

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe('User created successfully');

    expect(response.body.data.email).toBe(payload.email);

    expect(response.body.data.name).toBe(payload.name);

    expect(response.body.data).not.toHaveProperty('passwordHash');

    expect(enqueVerificationEmail).toHaveBeenCalledTimes(1);

    expect(enqueVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: payload.email,
        name: payload.name,
      }),
    );

    const user = await UserModel.findOne({
      email: payload.email,
    });

    expect(user).not.toBeNull();

    expect(user?.email).toBe(payload.email);

    expect(user?.passwordHash).not.toBe(payload.password);
  });

  it('should not allow duplicate email registration', async () => {
    const payload = {
      name: 'Parth',
      email: 'duplicate@example.com',
      password: 'Password@123',
    };

    await request(app).post('/api/v1/auth/register').send(payload);

    const response = await request(app).post('/api/v1/auth/register').send(payload);

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);
  });

  it('should reject invalid email', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Parth',
      email: 'invalid-email',
      password: 'Password@123',
    });

    expect(response.status).toBe(400);
  });

  it('should reject weak password', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Parth',
      email: 'weak@example.com',
      password: '123',
    });

    expect(response.status).toBe(400);
  });

  it('should reject missing required fields', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({});

    expect(response.status).toBe(400);
  });
});
