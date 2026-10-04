import { verifyToken } from '../services/auth.service.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token');
  }

  try {
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      throw new ApiError(401, 'Not authorized, user not found');
    }
    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized, token failed');
  }
});
