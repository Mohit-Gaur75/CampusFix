import { Router } from 'express';
import * as metaController from '../controllers/meta.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, metaController.getMeta);

export default router;
