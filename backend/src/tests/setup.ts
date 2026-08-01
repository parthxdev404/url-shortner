process.env.NODE_ENV = 'test';

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { clearDatabase, connectTestDB, disconnectTestDB } from './helpers/db';
import { redis } from '../infastructure/redis/redis';

beforeAll(async () => {
  await connectTestDB();
  await redis.flushdb();
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnectTestDB();
});
