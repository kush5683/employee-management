import { Router } from 'express';
import { listShifts, createShift, updateShift, deleteShift } from '../controllers/shiftsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(listShifts));
router.post('/', asyncHandler(createShift));
router.patch('/:id', asyncHandler(updateShift));
router.delete('/:id', asyncHandler(deleteShift));

export default router;
