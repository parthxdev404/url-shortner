import { Router } from 'express';

import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../../../middlewares/authenticate.middleware';

const router = Router();

router.get('/stats', authenticate, dashboardController.getStats);
router.get('/recent', authenticate, dashboardController.getRecentUrls);
router.get('/top', authenticate, dashboardController.getTopUrls);
router.get('/', authenticate, dashboardController.getDashboard);

export default router;
