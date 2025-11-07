import { Router } from 'express';
import { login, changePassword } from '../controllers/authController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/change-password', requireAuth, asyncHandler(changePassword));

export default router;
