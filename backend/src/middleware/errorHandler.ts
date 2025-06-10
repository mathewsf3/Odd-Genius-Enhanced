import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class HttpError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred', { error: err, path: req.path, method: req.method });
  
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }
  
  return res.status(500).json({
    error: 'Internal Server Error'
  });
};