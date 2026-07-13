import { Request, Response, NextFunction } from 'express';

import { AppError } from '../shared/errors';
import { logger } from '../config/logger';
import { StatusCodes } from 'http-status-codes';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({
    err: error,
    path: req.originalUrl,
    method: req.method,
  });

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
  });
}