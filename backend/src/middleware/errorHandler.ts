import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route not found: ${_req.method} ${_req.originalUrl}`));
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err?.code === 'P2002') {
    status = 409;
    message = `A record with the same unique value already exists (${err.meta?.target ?? 'unique constraint'}).`;
  } else if (err?.code === 'P2003') {
    status = 400;
    message = 'Related record does not exist or is still referenced by other records.';
  } else if (err?.code === 'P2025') {
    status = 404;
    message = 'Record not found.';
  }

  if (status >= 500) {
    console.error('[errorHandler]', err);
    message = 'Internal server error';
    details = undefined;
  }

  res.status(status).json({ error: message, ...(details ? { details } : {}) });
}
