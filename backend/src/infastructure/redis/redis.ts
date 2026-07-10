import Redis from 'ioredis'
import { env } from '../../config/env'
import { logger } from '../../config/logger'

export const redis = new Redis(env.REDIS_URL , {
    maxRetriesPerRequest : null,
    lazyConnect : true
})

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('ready', () => {
  logger.info('Redis ready');
});

redis.on('error', (error) => {
  logger.error({ error }, 'Redis error');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.warn('Redis reconnecting...');
});

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();

    logger.info('Redis connection established');
  } catch (error) {
    logger.fatal({ error }, 'Unable to connect to Redis');
    process.exit(1);
  }
}


export async function disconnectRedis(): Promise<void> {
  try {
    await redis.quit();

    logger.info('Redis disconnected');
  } catch (error) {
    logger.error({ error }, 'Error disconnecting Redis');
  }
}