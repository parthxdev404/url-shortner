import { Job, Worker } from 'bullmq';

import { logger } from '../../../config/logger';
import { workerOption } from '../bull';

export const schedulerWorker = new Worker(
  'scheduler',
  async (job: Job) => {
    logger.info(
      {
        jobId: job.id,
        jobName: job.name,
      },
      'Scheduler job started',
    );

    switch (job.name) {
      case 'expired-url-cleanup': {
        logger.info('Running expired URL cleanup...');

        logger.info(
          {
            deletedCount: 0,
          },
          'Expired URL cleanup completed',
        );

        break;
      }

      default: {
        logger.warn(
          {
            jobName: job.name,
          },
          'Unknown scheduler job',
        );
      }
    }
  },
  workerOption,
);

schedulerWorker.on('ready', () => {
  logger.info('Scheduler worker is ready');
});

schedulerWorker.on('active', (job) => {
  logger.info(
    {
      jobId: job.id,
      jobName: job.name,
    },
    'Scheduler job is active',
  );
});

schedulerWorker.on('completed', (job) => {
  logger.info(
    {
      jobId: job.id,
      jobName: job.name,
    },
    'Scheduler job completed',
  );
});

schedulerWorker.on('failed', (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      jobName: job?.name,
      error: error.message,
    },
    'Scheduler job failed',
  );
});

schedulerWorker.on('error', (error) => {
  logger.error(
    {
      error: error.message,
    },
    'Scheduler worker error',
  );
});

schedulerWorker.on('closing', () => {
  logger.info('Scheduler worker shutting down');
});
