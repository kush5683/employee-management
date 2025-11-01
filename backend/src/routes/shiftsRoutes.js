import { Router } from 'express';
import { listShifts, createShift, updateShift, deleteShift } from '../controllers/shiftsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listShifts));
router.post('/', asyncHandler(createShift));
router.patch('/:id', asyncHandler(updateShift));
router.delete('/:id', asyncHandler(deleteShift));

export default router;
