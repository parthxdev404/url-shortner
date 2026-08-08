import { Job, Worker } from 'bullmq';

import { logger } from '../../../config/logger';
import { emailService } from '../../email/email.service';
import { resetPasswordTemplate } from '../../email/templates/reset-password';
import { verifyEmailTemplate } from '../../email/templates/verify-email';
import { workerOption } from '../bull';
interface VerificationEmailJob {
  to: string;
  name: string;
  otp: string;
}

interface ResetPasswordEmailJob {
  to: string;
  name: string;
  otp: string;
}

type EmailJob = VerificationEmailJob | ResetPasswordEmailJob;

export const emailWorker = new Worker<EmailJob>(
  'email',
  async (job: Job<EmailJob>) => {
    switch (job.name) {
      case 'send-verification-email': {
        const { to, name, otp } = job.data as VerificationEmailJob;

        const email = verifyEmailTemplate(name, otp);

        await emailService.send({
          to,
          subject: email.subject,
          html: email.html,
        });

        logger.info(
          {
            jobId: job.id,
            email: to,
          },
          'Verification email processed',
        );

        break;
      }
      case 'send-reset-password-email': {
        const { to, name, otp } = job.data as ResetPasswordEmailJob;

        const email = resetPasswordTemplate(name, otp);

        await emailService.send({
          to,
          subject: email.subject,
          html: email.html,
        });

        logger.info(
          {
            jobId: job.id,
            email: to,
          },
          'Password reset email processed',
        );

        break;
      }
      default: {
        logger.warn(
          {
            jobId: job.id,
            jobName: job.name,
          },
          'Unknown email job',
        );
      }
    }
  },
  workerOption,
);

emailWorker.on('ready', () => {
  logger.info('Email worker is ready');
});

emailWorker.on('active', (job) => {
  logger.info(
    {
      jobId: job.id,
      jobName: job.name,
    },
    'Email job started',
  );
});

emailWorker.on('completed', (job) => {
  logger.info(
    {
      jobId: job.id,
      jobName: job.name,
    },
    'Email job completed',
  );
});

emailWorker.on('failed', (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      jobName: job?.name,
      error: error.message,
    },
    'Email job failed',
  );
});

emailWorker.on('error', (error) => {
  logger.error(
    {
      error: error.message,
    },
    'Email worker error',
  );
});
