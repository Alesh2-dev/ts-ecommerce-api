import { Request, Response, NextFunction } from 'express';
import { isDev } from '../config/env';
import { ApiResponse } from '../types';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── 404 Handler ─────────────────────────────────────────────────────────────

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  } satisfies ApiResponse);
};

// ─── Global Error Handler ─────────────────────────────────────────────────────

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error(`[Error] ${err.name}: ${err.message}`);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    } satisfies ApiResponse);
    return;
  }

  // Unknown / unhandled error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(isDev && { stack: err.stack }),
  } satisfies ApiResponse);
};