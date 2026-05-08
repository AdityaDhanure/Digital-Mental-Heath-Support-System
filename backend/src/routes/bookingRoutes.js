// src/routes/bookingRoutes.js - Booking API Routes
import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validateBooking, validateMongoId } from '../middleware/validationMiddleware.js';
import { bookingLimiter } from '../middleware/rateLimitMiddleware.js';
import { cacheResponse, invalidateCache } from '../utils/cache.js';

const router = express.Router();


router.post('/', protect, bookingLimiter, validateBooking, invalidateCache(['bookings', 'admin', 'availability']), bookingController.createBooking);
router.get('/', protect, cacheResponse('bookings', 45), bookingController.getAllBookings);
router.get('/student/:studentId/history', protect, restrictTo('counselor'), cacheResponse('bookings', 45), bookingController.getStudentSessionHistory);
router.get('/counselor/:counselorId/availability', protect, cacheResponse('availability', 30), bookingController.getCounselorAvailability);
router.get('/:id', protect, validateMongoId('id'), cacheResponse('bookings', 45), bookingController.getBooking);
router.patch('/:id/status', protect, restrictTo('counselor', 'admin'), invalidateCache(['bookings', 'admin', 'availability']), bookingController.updateBookingStatus);
router.patch('/:id/reschedule', protect, invalidateCache(['bookings', 'admin', 'availability']), bookingController.rescheduleBooking);
router.patch('/:id/complete', protect, restrictTo('counselor'), invalidateCache(['bookings', 'admin']), bookingController.completeBooking);
router.delete('/:id', protect, invalidateCache(['bookings', 'admin', 'availability']), bookingController.cancelBooking);

export default router;
