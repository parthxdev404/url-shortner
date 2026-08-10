import { env } from '../../config/env';
import { logger } from '../../config/logger';

import { brevo } from './email.provider';
import { SendEmailOptions } from './type';

export class EmailService {
  async send({ to, subject, html }: SendEmailOptions): Promise<void> {
    try {
      const result = await brevo.transactionalEmails.sendTransacEmail({
        sender: {
          name: env.EMAIL_FROM_NAME,
          email: env.EMAIL_FROM,
        },

        to: [
          {
            email: to,
          },
        ],

        subject,

        htmlContent: html,
      });

      logger.info(
        {
          to,
          subject,
          messageId: result.messageId,
        },
        'Email sent successfully',
      );
    } catch (error) {
      logger.error(
        {
          error,
          to,
          subject,
        },
        'Failed to send email',
      );

      throw error;
    }
  }
}

export const emailService = new EmailService();
