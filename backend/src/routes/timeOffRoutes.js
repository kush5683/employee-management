import { Router } from 'express';
import {
  listTimeOffRequests,
  createTimeOffRequest,
  updateTimeOffStatus,
  deleteTimeOffRequest
} from '../controllers/timeOffController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listTimeOffRequests));
router.post('/', asyncHandler(createTimeOffRequest));
router.patch('/:id/status', asyncHandler(updateTimeOffStatus));
router.delete('/:id', asyncHandler(deleteTimeOffRequest));

export default router;
