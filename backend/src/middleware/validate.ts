import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/** Validates a request part against a zod schema. */
export function validate(schema: ZodSchema, part: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      (req as any)[`validated${part.charAt(0).toUpperCase()}${part.slice(1)}`] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next({
          status: 400,
          message: 'Validation failed',
          details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        });
      }
      next(err);
    }
  };
}
