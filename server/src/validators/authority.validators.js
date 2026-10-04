import { z } from 'zod';
import { STATUSES, PRIORITY_LEVELS } from '../utils/constants.js';
import mongoose from 'mongoose';

const objectIdValidator = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

export const assignSchema = z.object({
  body: z.object({
    departmentId: objectIdValidator,
    staffName: z.string().optional()
  })
});

export const statusSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(STATUSES)),
    note: z.string().optional()
  })
});

export const priorityOverrideSchema = z.object({
  body: z.object({
    level: z.enum(Object.values(PRIORITY_LEVELS)),
    reason: z.string().min(5)
  })
});

export const remarkSchema = z.object({
  body: z.object({
    text: z.string().min(1),
    visibleToStudent: z.boolean().default(false)
  })
});
