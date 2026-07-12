import { Request, Response, NextFunction } from 'express';

import { AppError } from '../shared/errors';
import { logger } from '../config/logger';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    err: error,
    requestId: req.headers['x-request-id'],
  });
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
