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

router.get('/:shortCode', validate(redirectSchema), urlController.redirect);
router.get('/id/:id', validate(urlIdSchema), urlController.getById);
router.get('/', authenticate, validate(getMyUrlsSchema), urlController.getMyUrls);
router.get('/trash', validate(getMyUrlsSchema), urlController.getTrash);
router.patch(
  '/id/:id',
  authenticate,
  validate(updateUrlParamsSchema),
  validate(updateUrlBodySchema),
  urlController.update,
);

router.patch('/id/:id/restore', validate(urlIdSchema), urlController.restore);
router.patch('/bulk/restore', validate(bulkUrlSchema), urlController.bulkRestore);
router.patch('/id/:id/deactivate', validate(urlIdSchema), urlController.deactivate);
router.patch('/bulk/deactivate', validate(bulkUrlSchema), urlController.bulkDeactivate);
router.delete('/id/:id', validate(urlIdSchema), urlController.delete);
router.delete('/id/:id/permanent', validate(urlIdSchema), urlController.permanentDelete);
router.delete('/buld', validate(bulkUrlSchema), urlController.bulkDelete);

export default router;
