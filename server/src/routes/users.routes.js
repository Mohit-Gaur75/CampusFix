import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { updateProfileSchema } from '../validators/user.validators.js';

const router = Router();

router.patch('/me', authenticate, validate(updateProfileSchema), usersController.updateMe);

export default router;
