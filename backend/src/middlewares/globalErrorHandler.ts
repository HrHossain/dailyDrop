import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import createError from 'http-errors';
import { env } from '../validations/env.schema.js';
import { logger } from '../lib/logger.js';

const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (res.headersSent) {
    return next(err);
  }
  // ১. Zod Validation Error Handling
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      success: false,
      message: 'Validation Error',
      error: formattedErrors,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  // ২. HTTP Errors (http-errors package or operational errors)
  if (createError.isHttpError(err) || err.expose) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  // unkonown error handling (unexpected errors)
  if (err instanceof Error) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: err.message || 'Internal Server Error',
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
  // ৩. Development Environment Error (Detailed stack trace)
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      status: 'error',
      message: message,
      error: err,
      stack: err.stack,
    });
  }

  // ৪. Production Environment: Unexpected/Internal Server Errors
  // logger.error ব্যবহার করা হয়েছে যাতে প্রফেশনাল লগিং সিস্টেমে সঠিক লেভেল ট্র্যাক হয়
  logger.error('ERROR 💥', err);

  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Internal Server Error',
  });
};

export default globalErrorHandler;
