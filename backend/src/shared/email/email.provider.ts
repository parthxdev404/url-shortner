import { Resend } from 'resend';

import { env } from '../../config/env';
import { logger } from '../../config/logger';

export const resend = new Resend(env.RESEND_API_KEY);
logger.info('Resend email provider initialized');
