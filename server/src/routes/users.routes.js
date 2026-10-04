import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { updateProfileSchema, updateRoleSchema } from '../validators/user.validators.js';
import { requireRole } from '../middleware/requireRole.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.patch('/me', authenticate, validate(updateProfileSchema), usersController.updateMe);

// Admin Routes
router.get('/', authenticate, requireRole(ROLES.ADMIN), usersController.getAllUsers);
router.patch('/:id/role', authenticate, requireRole(ROLES.ADMIN), validate(updateRoleSchema), usersController.updateRole);

export default router;
