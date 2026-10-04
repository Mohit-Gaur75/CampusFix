import { z } from 'zod';
import { ROLES } from '../utils/constants.js';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    rollNo: z.string().optional()
  })
});

export const demoLoginSchema = z.object({
  body: z.object({
    role: z.enum([ROLES.STUDENT, ROLES.AUTHORITY])
  })
});
