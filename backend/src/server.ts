import 'dotenv/config';
import './shared/queue/workers/email.worker';
import './shared/queue/workers/schedule.worker';
import http from 'node:http';
import dns from 'node:dns';
import app from './app.js';
import { env } from './config/env.js';
import { connectMongoDB, disconnectMongoDB } from './infastructure/database/mongodb.js';
import { connectRedis, disconnectRedis } from './infastructure/redis/redis.js';
import { logger } from './config/logger.js';
import { scheduleExpiredUrlCleanup } from './shared/queue/jobs/url-cleanup-jobs';
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap(): Promise<void> {
  try {
    logger.info('Starting application...');
    logger.info('Email worker started');

    await connectMongoDB();
    await connectRedis();
    await scheduleExpiredUrlCleanup();

    const server = http.createServer(app);

    server.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV,
        },
        'Server started successfully',
      );
    });

    async function shutdown(signal: string) {
      logger.info({ signal }, 'Gracefully shutting down...');

      server.close(async () => {
        await disconnectMongoDB();
        await disconnectRedis();

        logger.info('Application stopped');

        process.exit(0);
      });
    }

    process.on('SIGINT', () => {
      void shutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
      void shutdown('SIGTERM');
    });
  } catch (error) {
    logger.fatal({ error }, 'Application failed to start');
    process.exit(1);
  }
}

void bootstrap();
