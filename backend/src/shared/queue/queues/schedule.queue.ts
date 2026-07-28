import { Queue } from 'bullmq';

import { queueOption } from '../bull';

export const schedulerQueue = new Queue('scheduler', queueOption);
