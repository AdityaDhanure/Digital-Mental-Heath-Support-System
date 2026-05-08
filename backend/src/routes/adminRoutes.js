// src/routes/adminRoutes.js - Admin API Routes
import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validateMongoId, validateDateRange } from '../middleware/validationMiddleware.js';
import { cacheResponse, invalidateCache } from '../utils/cache.js';

const router = express.Router();

// All admin routes require authentication and admin/counselor role
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard & Analytics
router.get('/dashboard', cacheResponse('admin', 45), adminController.getDashboardStats);
router.get('/recent-activity', cacheResponse('admin', 30), adminController.getRecentActivity);
router.get('/analytics/users', validateDateRange, cacheResponse('admin', 90), adminController.getUserAnalytics);
router.get('/analytics/chats', validateDateRange, cacheResponse('admin', 90), adminController.getChatAnalytics);
router.get('/analytics/bookings', validateDateRange, cacheResponse('admin', 90), adminController.getBookingAnalytics);
router.get('/analytics/community', validateDateRange, cacheResponse('admin', 90), adminController.getCommunityAnalytics);
router.get('/analytics/user/:userId', validateMongoId('userId'), cacheResponse('admin', 45), adminController.getUserChatAnalysis);
router.post('/analytics/generate-report', adminController.generateAnalyticsReport);

// System Management
router.get('/system/health', cacheResponse('admin', 15), adminController.getSystemHealth);

// User Management
router.get('/users', cacheResponse('admin', 45), adminController.manageUsers);
router.patch('/users/:id/role', validateMongoId('id'), invalidateCache(['admin']), adminController.updateUserRole);
router.patch('/users/:id/status', validateMongoId('id'), invalidateCache(['admin']), adminController.toggleUserStatus);

export default router;
