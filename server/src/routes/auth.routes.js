import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { loginSchema, registerSchema, demoLoginSchema } from '../validators/auth.validators.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/demo', authLimiter, validate(demoLoginSchema), authController.demoLogin);
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.get('/me', authenticate, authController.getMe);

export default router;
