import express from 'express';
const router = express.Router();
import * as availabilityController from '../controllers/availabilityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

// Counselor routes (protected)
router.get(
    '/my-slots',
    protect,
    restrictTo('counselor'),
    availabilityController.getMyAvailability
);

router.post(
    '/slots',
    protect,
    restrictTo('counselor'),
    availabilityController.createOrUpdateSlots
);

router.post(
    '/copy-from-yesterday',
    protect,
    restrictTo('counselor'),
    availabilityController.copyFromYesterday
);

router.post(
    '/apply-to-tomorrow',
    protect,
    restrictTo('counselor'),
    availabilityController.applyToTomorrow
);

router.delete(
    '/slots',
    protect,
    restrictTo('counselor'),
    availabilityController.deleteAvailability
);

// Public route (for students to view counselor availability)
router.get(
    '/counselor/:counselorId',
    protect,
    availabilityController.getCounselorAvailability
);

export default router;
