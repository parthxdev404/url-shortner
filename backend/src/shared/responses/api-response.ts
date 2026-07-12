import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta | Record<string, unknown>;
  errors?: unknown[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown[];
}

export const success = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta | Record<string, unknown>,
) => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };

  return res.status(statusCode).json(response);
};

export const created = <T>(res: Response, message: string, data: T) => {
  return success(res, message, data, 201);
};

export const noContent = (res: Response) => {
  return res.status(204).send();
};

export const error = (res: Response, message: string, statusCode = 500, errors?: unknown[]) => {
  const response: ApiErrorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
};
