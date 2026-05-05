// src/routes/notificationRoutes.js

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.post('/seed-demo', notificationController.seedDemoNotifications);

router.get('/:id', notificationController.getNotificationById);
router.patch('/:id/read', notificationController.markOneAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
