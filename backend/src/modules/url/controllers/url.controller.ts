import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { urlService } from '../services/url.service';
import { asyncHandler } from '../../../middlewares/async-handler';
import { analyticsService } from '../../analytics/services/analytics.service';
import { UAParser } from 'ua-parser-js';
import { Types } from 'mongoose';
import { getMyUrlsSchema } from '../validation/get-my-url-schema';

class UrlController {
  createShortUrl = asyncHandler(async (req: Request, res: Response) => {
    const { originalUrl, customAlias } = req.body;

    const url = await urlService.createShortUrl(req.user!.id, originalUrl, customAlias);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Short URL created successfully',
      data: url,
    });
  });

  redirect = asyncHandler(async (req: Request, res: Response) => {
    const shortCode = req.params.shortCode as string;

    const url = await urlService.resolveRedirect(shortCode);

    const parser = new UAParser(req.get('user-agent') ?? '');
    const ua = parser.getResult();

    await urlService.incrementClicks(url.id);

    await analyticsService.recordClick({
      urlId: new Types.ObjectId(url.id),
      ipAddress: req.ip ?? 'Unknown',
      userAgent: req.get('user-agent') ?? 'Unknown',
      referrer: req.get('referer') ?? null,
      browser: ua.browser.name ?? 'Unknown',
      os: ua.os.name ?? 'Unknown',
      device: ua.device.type ?? 'Desktop',
      country: 'Unknown',
      city: 'Unknown',
    });

    res.redirect(url.originalUrl);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const url = await urlService.getById(id);

    if (!url) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Url Not Found',
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: url,
    });
  });

  getMyUrls = asyncHandler(async (req: Request, res: Response) => {
    const { query } = getMyUrlsSchema.parse({
      query: req.query,
    });

    const result = await urlService.getMyUrls(req.user!.id, query);

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const updatedUrl = await urlService.updateUrl(id, userId, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Url Updated Successfully',
      data: updatedUrl,
    });
  });

  deactivate = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    await urlService.deactivateUrl(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Url Deactivated Successfully',
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    await urlService.deleteUrl(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Url Deleted Successfully',
    });
  });
}

export const urlController = new UrlController();
