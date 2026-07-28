import { QueueOptions, WorkerOptions } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../../config/env';

export const bullConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const queueOption: QueueOptions = {
  connection: bullConnection,
};

export const workerOption: WorkerOptions = {
  connection: bullConnection,
};
