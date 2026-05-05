// src/routes/bookingRoutes.js - Booking API Routes
import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validateBooking, validateMongoId } from '../middleware/validationMiddleware.js';
import { bookingLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();


router.post('/', protect, bookingLimiter, validateBooking, bookingController.createBooking);
router.get('/', protect, bookingController.getAllBookings);
router.get('/student/:studentId/history', protect, restrictTo('counselor'), bookingController.getStudentSessionHistory);
router.get('/counselor/:counselorId/availability', protect, bookingController.getCounselorAvailability);
router.get('/:id', protect, validateMongoId('id'), bookingController.getBooking);
router.patch('/:id/status', protect, restrictTo('counselor', 'admin'), bookingController.updateBookingStatus);
router.patch('/:id/reschedule', protect, bookingController.rescheduleBooking);
router.patch('/:id/complete', protect, restrictTo('counselor'), bookingController.completeBooking);
router.delete('/:id', protect, bookingController.cancelBooking);

export default router;