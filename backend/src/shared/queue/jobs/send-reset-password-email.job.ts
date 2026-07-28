import { emailQueue } from '../queues/email.queue';

interface SendResetPasswordEmailJob {
  to: string;
  name: string;
  resetUrl: string;
}

export async function enqueResetPasswordEmail(data: SendResetPasswordEmailJob): Promise<void> {
  await emailQueue.add('send-reset-password-email', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },

    removeOnComplete: 100,
    removeOnFail: 50,
  });
}
