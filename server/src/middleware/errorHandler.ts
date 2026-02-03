import { Request, Response, NextFunction } from 'express';
import { ApiError, ERROR_CODES } from '@adoption/shared';

/**
 * Global error handler middleware
 * Catches all unhandled errors and returns a safe error response
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled error:', err);

  const response: ApiError = {
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    },
  };

  res.status(500).json(response);
}
