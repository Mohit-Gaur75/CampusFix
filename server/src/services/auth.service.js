import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../utils/constants.js';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(user._id);
  const userObj = user.toObject();
  delete userObj.passwordHash;
  
  return { user: userObj, token };
};

export const demoLogin = async (role) => {
  if (!env.DEMO_MODE) {
    throw new ApiError(403, 'Demo mode is disabled');
  }
  
  const user = await User.findOne({ role });
  if (!user) {
    throw new ApiError(404, `No demo user found for role ${role}`);
  }

  const token = generateToken(user._id);
  return { user, token };
};

export const register = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new ApiError(409, 'Email already in use');
  }

  const passwordHash = await hashPassword(userData.password);
  
  // Registering is only for STUDENT
  const user = await User.create({
    ...userData,
    passwordHash,
    role: ROLES.STUDENT 
  });

  const token = generateToken(user._id);
  const userObj = user.toObject();
  delete userObj.passwordHash;

  return { user: userObj, token };
};
