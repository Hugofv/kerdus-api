/**
 * Global error handler middleware
 */

import { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';
import HttpStatusCodes from '../common/HttpStatusCodes';
import { RouteError } from '../common/classes';

export function errorMiddleware(
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (process.env.NODE_ENV !== 'test') {
    logger.err(err, true);
  }

  let status = HttpStatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  if (err instanceof RouteError) {
    status = err.status;
    message = err.message;
    code = err.name || 'ROUTE_ERROR';
  } else if (err instanceof Error) {
    message = err.message;
    code = err.name || 'ERROR';
  }

  res.status(status).json({
    success: false,
    error: {
      message,
      code,
    },
  });
}

