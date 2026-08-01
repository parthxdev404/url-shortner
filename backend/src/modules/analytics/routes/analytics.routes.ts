import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { analyticsParamsSchema, analyticsSchema } from '../validation/analytic.validation';
import { validate } from '../../../middlewares/validate';
import { authenticate } from '../../../middlewares/authenticate.middleware';

const router = Router();

router.get(
  '/:id/analytics',
  authenticate,
  validate(analyticsSchema),
  analyticsController.getAnalytics,
);
router.get(
  '/:urlId',
  authenticate,
  validate(analyticsParamsSchema),
  analyticsController.getOverview,
);
router.get(
  '/:urlId/timeline',
  authenticate,
  validate(analyticsParamsSchema),
  analyticsController.getTimeline,
);
router.get(
  '/:urlId/browser',
  authenticate,
  validate(analyticsParamsSchema),
  analyticsController.getBrowserStats,
);
router.get(
  '/:urlId/os',
  authenticate,
  validate(analyticsParamsSchema),
  analyticsController.getOSStats,
);
router.get(
  '/:urlId/device',
  authenticate,
  validate(analyticsParamsSchema),
  analyticsController.getDeviceStats,
);
router.get(
  '/:urlId/referrer',
  authenticate,
  validate(analyticsParamsSchema),
  analyticsController.getReferrerStats,
);

router.get(
  '/:urlId/country',
  authenticate,
  validate(analyticsParamsSchema),
  analyticsController.getCountryStats,
);
export default router;
