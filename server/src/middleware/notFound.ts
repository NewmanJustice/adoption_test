import { Request, Response } from 'express';
import { ApiError, ERROR_CODES } from '@adoption/shared';

/**
 * 404 Not Found handler
 * Returns a JSON error response for unknown routes
 */
export function notFoundHandler(_req: Request, res: Response): void {
  const response: ApiError = {
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: 'The requested resource was not found',
    },
  };

  res.status(404).json(response);
}
