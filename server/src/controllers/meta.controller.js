import { Department } from '../models/Department.js';
import { Location } from '../models/Location.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { CATEGORIES, STATUSES, PRIORITY_LEVELS } from '../utils/constants.js';

export const getMeta = asyncHandler(async (req, res) => {
  const [departments, locations] = await Promise.all([
    Department.find({}).lean(),
    Location.find({}, '_id building floor area label zoneType').lean()
  ]);

  res.status(200).json({
    success: true,
    data: {
      categories: Object.values(CATEGORIES),
      statuses: Object.values(STATUSES),
      priorities: Object.values(PRIORITY_LEVELS),
      departments,
      locations
    }
  });
});
