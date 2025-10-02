import { Request, Response, NextFunction } from 'express';
import {
  DomainError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from '../domain/errors';

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
    timestamp: string;
    path: string;
  };
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl;

  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';
  let details: any = undefined;

  if (error instanceof ValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = error.message;
    details = { field: error.field };
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = error.message;
  } else if (error instanceof ConflictError) {
    statusCode = 409;
    code = 'CONFLICT';
    message = error.message;
  } else if (error instanceof UnauthorizedError) {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = error.message;
  } else if (error instanceof ForbiddenError) {
    statusCode = 403;
    code = 'FORBIDDEN';
    message = error.message;
  } else if (error instanceof DomainError) {
    statusCode = 400;
    code = 'DOMAIN_ERROR';
    message = error.message;
  }

  // Log error for debugging
  console.error(`[${timestamp}] ${error.name}: ${error.message}`, {
    stack: error.stack,
    path,
    method: req.method,
  });

  const errorResponse: ErrorResponse = {
    error: {
      message,
      code,
      details,
      timestamp,
      path,
    },
  };

  res.status(statusCode).json(errorResponse);
};