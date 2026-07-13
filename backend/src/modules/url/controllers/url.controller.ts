import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { urlService } from '../services/url.service';
import { asyncHandler } from '../../../middlewares/async-handler';

class UrlController {
  createShortUrl = asyncHandler(async (req: Request, res: Response) => {
    const { originalUrl } = req.body;

    const url = await urlService.createShortUrl(originalUrl);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Short URL created successfully',
      data: url,
    });
  });

  redirect = asyncHandler(async (req: Request, res: Response) => {
    const shortCode = req.params.shortCode as string;

    const url = await urlService.getOriginalUrl(shortCode);

    if (!url) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Short URL not found',
      });

      return;
    }

    await urlService.incrementClicks(url._id.toString());

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