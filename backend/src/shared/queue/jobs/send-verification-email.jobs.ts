import { emailQueue } from '../queues/email.queue';

interface SendVerificationEmailJob {
  to: string;
  name: string;
  verificationUrl: string;
}

export async function enqueVerificationEmail(data: SendVerificationEmailJob): Promise<void> {
  await emailQueue.add('send-verification-email', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },

    removeOnComplete: 100,
    removeOnFail: 50,
  });
}
