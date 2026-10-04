import { z } from 'zod';

export const getOverviewSchema = z.object({
  query: z.object({
    days: z.string().optional().transform(val => (val ? parseInt(val, 10) : 30)).refine(val => val >= 7 && val <= 90, {
      message: 'Days must be between 7 and 90'
    })
  })
});
