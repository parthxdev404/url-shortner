import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod/v3';

import { BadRequestError } from '../shared/errors';

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      if (parsed.query) req.query = parsed.query;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new BadRequestError(error.issues[0]?.message ?? 'Validation failed'));
        return;
      }

      next(error);
    }
  };
}