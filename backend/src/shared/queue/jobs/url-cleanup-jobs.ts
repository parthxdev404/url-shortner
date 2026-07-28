import { schedulerQueue } from '../queues/schedule.queue';

export async function scheduleExpiredUrlCleanup(): Promise<void> {
  await schedulerQueue.upsertJobScheduler(
    'expired-url-cleanup',
    {
      pattern: '0 2 * * *',
    },
    {
      name: 'expired-url-cleanup',
      data: {},
    },
  );
}
