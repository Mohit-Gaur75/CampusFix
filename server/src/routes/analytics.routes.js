import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { getOverviewSchema } from '../validators/analytics.validators.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(ROLES.AUTHORITY, ROLES.ADMIN));

router.get('/overview', validate(getOverviewSchema), analyticsController.getOverview);

export default router;
