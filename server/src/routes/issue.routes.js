import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as issueController from '../controllers/issue.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { uploadMiddleware } from '../services/upload.service.js';
import { suggestCategorySchema, createIssueSchema, checkDuplicatesSchema } from '../validators/issue.validators.js';
import { ROLES } from '../utils/constants.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

const issueSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 requests per `window`
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many issues created, please try again later.'));
  },
});

router.post('/suggest-category', authenticate, requireRole(ROLES.STUDENT), validate(suggestCategorySchema), issueController.suggestCategory);

router.post('/check-duplicates', authenticate, requireRole(ROLES.STUDENT), validate(checkDuplicatesSchema), issueController.checkDuplicates);

router.post('/', 
  authenticate, 
  requireRole(ROLES.STUDENT), 
  issueSubmitLimiter, 
  uploadMiddleware, 
  validate(createIssueSchema), 
  issueController.createIssue
);

router.get('/mine', authenticate, requireRole(ROLES.STUDENT), issueController.getMyIssues);

router.get('/public', issueController.getPublicIssues);

router.get('/:id', authenticate, issueController.getIssueById);

router.post('/:id/feedback', authenticate, requireRole(ROLES.STUDENT), issueController.provideFeedback);

export default router;
