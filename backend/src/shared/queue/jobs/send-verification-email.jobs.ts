import { emailQueue } from '../queues/email.queue';
export interface SendVerificationEmailJob {
  to: string;
  name: string;
  otp: string;
}

export const enqueueVerificationEmail = async (data: SendVerificationEmailJob) => {
  await emailQueue.add('send-verification-email', data);
};
