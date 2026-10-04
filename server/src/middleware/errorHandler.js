import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let code = 'SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = 'API_ERROR';
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.errors;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    code = 'MONGOOSE_VALIDATION_ERROR';
    message = 'Database validation failed';
    details = Object.values(err.errors).map(e => e.message);
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    code = 'CAST_ERROR';
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY_ERROR';
    message = 'Duplicate field value entered';
    details = Object.keys(err.keyValue);
  } else {
    // Other errors
    message = err.message || message;
  }

  const response = {
    success: false,
    error: {
      code,
      message,
      details: details && details.length > 0 ? details : undefined,
    }
  };

  if (env.NODE_ENV !== 'production' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  if (statusCode === 500 && env.NODE_ENV !== 'test') {
    console.error('Unhandled Error:', err);
  }

  res.status(statusCode).json(response);
};
