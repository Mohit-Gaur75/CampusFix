import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  CLIENT_URL: z.string().url().min(1, 'CLIENT_URL is required').default('http://localhost:5173'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters long').default('default_jwt_secret_for_dev_env'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DEMO_MODE: z.string().transform((val) => val === 'true').default('false'),
  STORAGE_DRIVER: z.enum(['local', 'cloudinary']).default('local'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;
