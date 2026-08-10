import { BrevoClient } from '@getbrevo/brevo';

import { env } from '../../config/env';
import { logger } from '../../config/logger';

export const brevo = new BrevoClient({
  apiKey: env.BREVO_API_KEY,
});

logger.info('Brevo email provider initialized');
