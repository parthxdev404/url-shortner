import { Router } from 'express';
import { urlController } from '../controllers/url.controller';
import { validate } from '../../../middlewares/validate';

import { createShortUrlSchema, redirectSchema, urlIdSchema } from '../validation/url.validation';
import { rateLimiter } from '../../../shared/rate-limit';

const router = Router();

// Create ShortUrl
router.post(
  '/',
  rateLimiter({
    windowInSeconds: 600,
    maxRequests: 5,
  }),
  validate(createShortUrlSchema),
  urlController.createShortUrl,
);

// Redirect
router.get('/:shortCode', validate(redirectSchema), urlController.redirect);

// Get Url BY Id
router.get('/id/:id', validate(urlIdSchema), urlController.getById);

// Deactivate Url
router.patch('/id/:id/deactivate', validate(urlIdSchema), urlController.deactivate);

// Delete Url
router.delete('/id/:id', validate(urlIdSchema), urlController.delete);

export default router;
