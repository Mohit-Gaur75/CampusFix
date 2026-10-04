import { z } from 'zod';
import { CATEGORIES } from '../utils/constants.js';
import mongoose from 'mongoose';

const objectIdValidator = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

export const suggestCategorySchema = z.object({
  body: z.object({
    description: z.string().min(10).max(500)
  })
});

export const checkDuplicatesSchema = z.object({
  body: z.object({
    category: z.enum(Object.values(CATEGORIES)),
    locationId: objectIdValidator,
    description: z.string().min(10).max(500)
  })
});

export const createIssueSchema = z.object({
  body: z.object({
    category: z.enum(Object.values(CATEGORIES)),
    locationId: objectIdValidator,
    description: z.string().min(10).max(500),
    linkToIssueId: objectIdValidator.optional()
  })
});
