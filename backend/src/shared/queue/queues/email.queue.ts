import { Queue } from 'bullmq';
import { queueOption } from '../bull';

export const emailQueue = new Queue('email', queueOption);
