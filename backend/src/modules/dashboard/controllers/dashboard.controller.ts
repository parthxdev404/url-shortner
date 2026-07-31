import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { asyncHandler } from '../../../middlewares/async-handler';
import { dashboardService } from '../services/dashboard.service';

class DashboardController {
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await dashboardService.getDashboardStats(req.user!.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: stats,
    });
  });

  getRecentUrls = asyncHandler(async (req: Request, res: Response) => {
    const urls = await dashboardService.getRecentUrls(req.user!.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: urls,
    });
  });

  getTopUrls = asyncHandler(async (req: Request, res: Response) => {
    const urls = await dashboardService.getTopUrls(req.user!.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: urls,
    });
  });

  getDashboard = asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getDashboard(req.user!.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: dashboard,
    });
  });
}

export const dashboardController = new DashboardController();
