import { resend } from './email.provider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { SendEmailOptions } from './type';

export class EmailService {
  async send({ to, subject, html }: SendEmailOptions): Promise<void> {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    logger.info(
      {
        to,
        subject,
      },
      'Email sent successfully',
    );
  }
}

export const emailService = new EmailService();
