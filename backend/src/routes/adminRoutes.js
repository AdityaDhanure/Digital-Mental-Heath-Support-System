// src/routes/adminRoutes.js - Admin API Routes
import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validateMongoId, validateDateRange } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin/counselor role
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard & Analytics
router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics/users', validateDateRange, adminController.getUserAnalytics);
router.get('/analytics/chats', validateDateRange, adminController.getChatAnalytics);
router.get('/analytics/bookings', validateDateRange, adminController.getBookingAnalytics);
router.get('/analytics/community', validateDateRange, adminController.getCommunityAnalytics);
router.get('/analytics/user/:userId', validateMongoId('userId'), adminController.getUserChatAnalysis);
router.post('/analytics/generate-report', adminController.generateAnalyticsReport);

// System Management
router.get('/system/health', adminController.getSystemHealth);

// User Management
router.get('/users', adminController.manageUsers);
router.patch('/users/:id/role', validateMongoId('id'), adminController.updateUserRole);
router.patch('/users/:id/status', validateMongoId('id'), adminController.toggleUserStatus);

export default router;