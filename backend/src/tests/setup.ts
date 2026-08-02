process.env.NODE_ENV = 'test';

import { beforeAll, afterAll, beforeEach, vi } from 'vitest';

vi.mock('../../shared/queue/jobs/send-verification-email.jobs', async () => {
  const mocks = await import('../tests/mocks/email-jobs.js');

  return {
    enqueVerificationEmail: mocks.enqueVerificationEmail,
  };
});

vi.mock('../../shared/queue/jobs/send-reset-password-email.job', async () => {
  const mocks = await import('../tests/mocks/email-jobs.js');

  return {
    enqueResetPasswordEmail: mocks.enqueResetPasswordEmail,
  };
});

import { clearDatabase, connectTestDB, disconnectTestDB } from './helpers/db';
import { redis } from '../infastructure/redis/redis';

beforeAll(async () => {
  await connectTestDB();

  await redis.connect();
  await redis.flushdb();
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await redis.flushdb();
  await redis.quit();

  await disconnectTestDB();
});
