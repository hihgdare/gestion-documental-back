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
    details?: unknown;
    timestamp: string;
    path: string;
  };
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const timestamp = new Date().toISOString();
  const {status, code, message, details} = getErrorData(error);

  // Log error for debugging
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${timestamp}] ${error.name}: ${error.message}`, {
      stack: error.stack,
      path: req.originalUrl,
      method: req.method,
    });
  }

  res.status(status).json({
    error: {
      message: message || error.message,
      code,
      details,
      timestamp,
      path: req.originalUrl,
    },
  });
};

function getErrorData(error: Error): {status: number, code: string, message?: string, details?: unknown} {
  if (error instanceof UnauthorizedError) {
    return { status: 401, code: 'UNAUTHORIZED' };
  } else if (error instanceof ValidationError) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: error.field },
    };
  } else if (error instanceof ForbiddenError) {
    return { status: 403, code: 'FORBIDDEN' };
  } else if (error instanceof NotFoundError) {
    return { status: 404, code: 'NOT_FOUND' };
  } else if (error instanceof ConflictError) {
    return { status: 409, code: 'CONFLICT' };
  } else if (error instanceof DomainError) {
    return { status: 400, code: 'DOMAIN_ERROR' };
  } else {
    return {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    };
  }
}
