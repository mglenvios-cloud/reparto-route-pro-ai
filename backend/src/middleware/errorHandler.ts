import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    });
  }

  console.error('Error no manejado:', err);
  return res.status(500).json({
    success: false,
    error: config.nodeEnv === 'production' ? 'Error interno del servidor' : err.message,
  });
};
