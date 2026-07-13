import { Response, Request, NextFunction } from 'express';
import { AnyZodObject , ZodError } from 'zod/v3';

import { BadRequestError } from '../shared/errors';

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
     const parsed =  schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      req.body = parsed.body;
      req.params = parsed.params;
      req.query = parsed.query;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(error.issues[0]?.message);
      }

      next(error);
    }
  };
}