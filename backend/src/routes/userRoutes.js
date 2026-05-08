import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { cacheResponse } from '../utils/cache.js';

const router = Router();

// Public routes
router.get('/counselors', cacheResponse('users', 120), userController.getCounselors);
router.get('/counselor/:id', cacheResponse('users', 120), userController.getCounselorById);
router.get('/student/:studentId', protect, restrictTo('counselor', 'admin'), cacheResponse('users', 60), userController.getStudentDetails);

export default router;
