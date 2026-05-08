// src/routes/notificationRoutes.js

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as notificationController from '../controllers/notificationController.js';
import { cacheResponse, invalidateCache } from '../utils/cache.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', cacheResponse('notifications', 30), notificationController.getNotifications);
router.get('/unread-count', cacheResponse('notifications', 15), notificationController.getUnreadCount);
router.patch('/read-all', invalidateCache(['notifications', 'admin']), notificationController.markAllAsRead);
router.post('/seed-demo', invalidateCache(['notifications', 'admin']), notificationController.seedDemoNotifications);

router.get('/:id', cacheResponse('notifications', 30), notificationController.getNotificationById);
router.patch('/:id/read', invalidateCache(['notifications', 'admin']), notificationController.markOneAsRead);
router.delete('/:id', invalidateCache(['notifications', 'admin']), notificationController.deleteNotification);

export default router;
