import { Router } from 'express';

import { urlController } from '../controllers/url.controller';

import { validate } from '../../../middlewares/validate';
import { authenticate } from '../../../middlewares/authenticate.middleware';

import { updateUrlParamsSchema, updateUrlBodySchema } from '../validation/update-urls.schema';

import { bulkUrlSchema } from '../validation/bulk-url.schema';

import { createShortUrlSchema, redirectSchema, urlIdSchema } from '../validation/url.validation';

import { getMyUrlsSchema } from '../validation/get-my-url-schema';

const router = Router();

router.post('/', authenticate, validate(createShortUrlSchema), urlController.createShortUrl);

router.patch('/bulk/restore', authenticate, validate(bulkUrlSchema), urlController.bulkRestore);

router.patch(
  '/bulk/deactivate',
  authenticate,
  validate(bulkUrlSchema),
  urlController.bulkDeactivate,
);

router.delete('/bulk', authenticate, validate(bulkUrlSchema), urlController.bulkDelete);

router.get('/', authenticate, validate(getMyUrlsSchema), urlController.getMyUrls);

router.get('/:shortCode', validate(redirectSchema), urlController.redirect);

router.get('/id/:id', authenticate, validate(urlIdSchema), urlController.getById);

router.patch(
  '/id/:id',
  authenticate,
  validate(updateUrlParamsSchema),
  validate(updateUrlBodySchema),
  urlController.update,
);

router.patch('/id/:id/activate', authenticate, validate(urlIdSchema), urlController.activate);

router.patch('/id/:id/deactivate', authenticate, validate(urlIdSchema), urlController.deactivate);

router.delete('/id/:id', authenticate, validate(urlIdSchema), urlController.delete);

export default router;
