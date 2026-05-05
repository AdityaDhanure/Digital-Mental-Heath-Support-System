// src/controllers/notificationController.js

import Notification from '../models/Notification.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import logger from '../utils/logger.js';

// ─── GET /notifications ─────────────────────────────────────────────────────
export const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const unreadOnly = req.query.unreadOnly === 'true';
  const type = req.query.type;

  const query = { recipient: userId };
  if (unreadOnly) query.read = false;
  if (type) query.type = type;

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    },
  });
});

// ─── GET /notifications/unread-count ────────────────────────────────────────
export const getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.status(200).json({
    status: 'success',
    data: { count },
  });
});

// ─── GET /notifications/:id ─────────────────────────────────────────────────
export const getNotificationById = catchAsync(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({ status: 'error', message: 'Notification not found' });
  }

  // Auto-mark as read when opened
  if (!notification.read) {
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
  }

  res.status(200).json({ status: 'success', data: { notification } });
});

// ─── PATCH /notifications/:id/read ──────────────────────────────────────────
export const markOneAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { $set: { read: true, readAt: new Date() } },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ status: 'error', message: 'Notification not found' });
  }

  res.status(200).json({ status: 'success', data: { notification } });
});

// ─── PATCH /notifications/read-all ──────────────────────────────────────────
export const markAllAsRead = catchAsync(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { $set: { read: true, readAt: new Date() } }
  );

  logger.info('All notifications marked as read', {
    userId: req.user._id,
    updated: result.modifiedCount,
  });

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} notifications marked as read`,
  });
});

// ─── DELETE /notifications/:id ──────────────────────────────────────────────
export const deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({ status: 'error', message: 'Notification not found' });
  }

  res.status(200).json({ status: 'success', message: 'Notification deleted' });
});

// ─── POST /notifications/seed-demo (dev only) ────────────────────────────────
export const seedDemoNotifications = catchAsync(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ status: 'error', message: 'Not available in production' });
  }

  const demos = [
    {
      recipient: req.user._id,
      type: 'booking_confirmed',
      title: 'Session Confirmed',
      message: 'Your counseling session has been confirmed for tomorrow at 2:00 PM.',
      priority: 'high',
      actionUrl: '/bookings',
      actionLabel: 'View Booking',
    },
    {
      recipient: req.user._id,
      type: 'resource_recommendation',
      title: 'Resource Recommended',
      message: 'A new article on managing exam stress has been added to your recommended resources.',
      priority: 'medium',
      actionUrl: '/resources',
      actionLabel: 'Browse Resources',
    },
    {
      recipient: req.user._id,
      type: 'system_announcement',
      title: 'Welcome to MindfulCampus!',
      message: 'Thank you for joining MindfulCampus. Explore resources, book sessions, and connect with counselors whenever you need support.',
      priority: 'low',
    },
  ];

  await Notification.insertMany(demos);
  res.status(201).json({ status: 'success', message: 'Demo notifications created' });
});
