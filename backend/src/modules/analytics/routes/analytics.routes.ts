import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { analyticsParamsSchema, analyticsSchema } from '../validation/analytic.validation';
import { validate } from '../../../middlewares/validate';

const router = Router();

router.get('/:id/analytics', validate(analyticsSchema), analyticsController.getAnalytics);
router.get('/:urlId', validate(analyticsParamsSchema), analyticsController.getOverview);
router.get('/:urlId/timeline', validate(analyticsParamsSchema), analyticsController.getTimeline);
router.get('/:urlId/browser', validate(analyticsParamsSchema), analyticsController.getBrowserStats);
router.get('/:urlId/os', validate(analyticsParamsSchema), analyticsController.getOSStats);
router.get('/:urlId/device', validate(analyticsParamsSchema), analyticsController.getDeviceStats);
router.get(
  '/:urlId/referrer',
  validate(analyticsParamsSchema),
  analyticsController.getReferrerStats,
);

router.get('/:urlId/country', validate(analyticsParamsSchema), analyticsController.getCountryStats);
export default router;
