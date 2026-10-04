import { Router } from 'express';
import * as authorityController from '../controllers/authority.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { assignSchema, statusSchema, priorityOverrideSchema, remarkSchema } from '../validators/authority.validators.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(ROLES.AUTHORITY, ROLES.ADMIN));

router.get('/issues', authorityController.listIssues);
router.get('/issues/:id/similar', authorityController.getSimilar);

router.patch('/issues/:id/assign', validate(assignSchema), authorityController.assignIssue);
router.patch('/issues/:id/status', validate(statusSchema), authorityController.changeStatus);
router.patch('/issues/:id/priority', validate(priorityOverrideSchema), authorityController.overridePriority);

router.post('/issues/:id/remarks', validate(remarkSchema), authorityController.addRemark);
router.post('/issues/:targetId/merge/:sourceId', authorityController.mergeIssues);

export default router;
