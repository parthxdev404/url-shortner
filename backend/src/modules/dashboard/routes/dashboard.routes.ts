import { Router } from 'express';

import { dashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/stats', dashboardController.getStats);
router.get('recent', dashboardController.getRecentUrls);
router.get('/top', dashboardController.getTopUrls);
router.get('/', dashboardController.getDashboard);

export default router;
