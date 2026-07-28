import { Job, Worker } from 'bullmq';

import { logger } from '../../../config/logger';
import { emailService } from '../../email/email.service';
import { verifyEmailTemplate } from '../../email/templates/verify-email';
import { workerOption } from '../bull';

interface SendVerificationEmailTab {
  to: string;
  name: string;
  verificationUrl: string;
}

export const emailWorker = new Worker<SendVerificationEmailTab>(
  'email',

  async (job: Job<SendVerificationEmailTab>) => {
    const { to, name, verificationUrl } = job.data;

    await emailService.send({
      to,
      subject: 'Verify Your Email',
      html: verifyEmailTemplate(name, verificationUrl),
    });
    emailWorker.on('completed', (job) => {
      logger.info(
        {
          jobId: job.id,
        },
        'Email job completed',
      );
    });

    emailWorker.on('failed', (job, error) => {
      logger.error(
        {
          jobId: job?.id,
          error: error.message,
        },
        'Email job failed',
      );
    });

    logger.info({ jobId: job.id, email: to }, 'Verification email processed');
  },
  workerOption,
);
