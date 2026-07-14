import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';

import { analyticsService } from '../services/analytics.service';
import { urlService } from '../../url/services/url.service';
import { asyncHandler } from '../../../middlewares/async-handler';

class AnalyticsController {
  getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const url = await urlService.getById(id);

    if (!url) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'URL not found',
      });

      return;
    }

    const analytics = await analyticsService.getAnalytics(
      new Types.ObjectId(id),
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: analytics,
    });
  });
}

export const analyticsController = new AnalyticsController();