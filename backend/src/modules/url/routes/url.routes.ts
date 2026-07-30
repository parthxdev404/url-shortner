import { Router } from 'express';
import { urlController } from '../controllers/url.controller';
import { validate } from '../../../middlewares/validate';
import { authenticate } from '../../../middlewares/authenticate.middleware';
import { updateUrlParamsSchema, updateUrlBodySchema } from '../validation/update-urls.schema';

import { createShortUrlSchema, redirectSchema, urlIdSchema } from '../validation/url.validation';
import { getMyUrlsSchema } from '../validation/get-my-url-schema';

const router = Router();

// Create ShortUrl
router.post('/', authenticate, validate(createShortUrlSchema), urlController.createShortUrl);

// Redirect
router.get('/:shortCode', validate(redirectSchema), urlController.redirect);

// Get Url BY Id
router.get('/id/:id', validate(urlIdSchema), urlController.getById);

// Get My Urls
router.get('/', authenticate, validate(getMyUrlsSchema), urlController.getMyUrls);

// Update Url
router.patch(
  '/id/:id',
  authenticate,
  validate(updateUrlParamsSchema),
  validate(updateUrlBodySchema),
  urlController.update,
);

// Deactivate Url
router.patch('/id/:id/deactivate', validate(urlIdSchema), urlController.deactivate);

// Delete Url
router.delete('/id/:id', validate(urlIdSchema), urlController.delete);

export default router;
