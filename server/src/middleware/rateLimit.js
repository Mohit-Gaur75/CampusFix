import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window`
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests from this IP, please try again later.'));
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per `window`
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many authentication attempts, please try again later.'));
  },
});
