import express from 'express';
const router = express.Router();
import * as availabilityController from '../controllers/availabilityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { cacheResponse, invalidateCache } from '../utils/cache.js';

// Counselor routes (protected)
router.get(
    '/my-slots',
    protect,
    restrictTo('counselor'),
    cacheResponse('availability', 30),
    availabilityController.getMyAvailability
);

router.post(
    '/slots',
    protect,
    restrictTo('counselor'),
    invalidateCache(['availability', 'bookings']),
    availabilityController.createOrUpdateSlots
);

router.post(
    '/copy-from-yesterday',
    protect,
    restrictTo('counselor'),
    invalidateCache(['availability']),
    availabilityController.copyFromYesterday
);

router.post(
    '/apply-to-tomorrow',
    protect,
    restrictTo('counselor'),
    invalidateCache(['availability']),
    availabilityController.applyToTomorrow
);

router.delete(
    '/slots',
    protect,
    restrictTo('counselor'),
    invalidateCache(['availability', 'bookings']),
    availabilityController.deleteAvailability
);

// Public route (for students to view counselor availability)
router.get(
    '/counselor/:counselorId',
    protect,
    cacheResponse('availability', 30),
    availabilityController.getCounselorAvailability
);

export default router;
