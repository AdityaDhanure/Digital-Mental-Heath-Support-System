import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = Router();

// Public routes
router.get('/counselors', userController.getCounselors);
router.get('/counselor/:id', userController.getCounselorById);
router.get('/student/:studentId', protect, restrictTo('counselor', 'admin'), userController.getStudentDetails);

export default router;