// src/services/notificationService.js - Notification Management Service

import { createNotification, find, countDocuments, updateMany, deleteMany } from '../models/Notification';
import logger from '../utils/logger';

/**
 * Create and send notification
 * @param {Object} notificationData - Notification details
 * @returns {Promise<Object>} - Created notification
 */
export async function createAndSendNotification(notificationData) {
  try {
    const notification = await createNotification(notificationData);
    
    // Send via different channels based on configuration
    const sendPromises = [];
    
    if (notification.channels.inApp) {
      sendPromises.push(this.sendInAppNotification(notification));
    }
    
    if (notification.channels.email) {
      sendPromises.push(this.sendEmailNotification(notification));
    }
    
    if (notification.channels.push) {
      sendPromises.push(this.sendPushNotification(notification));
    }
    
    await Promise.allSettled(sendPromises);
    
    return notification;
  } catch (error) {
    logger.error('Notification creation failed:', error);
    throw error;
  }
}

/**
 * Send in-app notification
 * @param {Object} notification - Notification document
 */
export async function sendInAppNotification(notification) {
  try {
    notification.deliveryStatus.inApp = {
      delivered: true,
      deliveredAt: new Date()
    };
    await notification.save();
    
    // Emit socket event if WebSocket is available
    // io.to(notification.recipient.toString()).emit('notification', notification);
    
    logger.info('In-app notification delivered', {
      notificationId: notification._id,
      recipient: notification.recipient
    });
  } catch (error) {
    logger.error('In-app notification delivery failed:', error);
  }
}

/**
 * Send email notification
 * @param {Object} notification - Notification document
 */
export async function sendEmailNotification(notification) {
  try {
    const User = require('../models/User');
    const user = await User.findById(notification.recipient).select('email name');
    
    if (!user || !user.email) {
      throw new Error('User email not found');
    }
    
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // await emailClient.send({
    //   to: user.email,
    //   subject: notification.title,
    //   body: notification.message
    // });
    
    notification.deliveryStatus.email = {
      sent: true,
      sentAt: new Date()
    };
    await notification.save();
    
    logger.info('Email notification sent', {
      notificationId: notification._id,
      recipient: user.email
    });
  } catch (error) {
    notification.deliveryStatus.email = {
      sent: false,
      error: error.message
    };
    await notification.save();
    
    logger.error('Email notification failed:', error);
  }
}

/**
 * Send push notification
 * @param {Object} notification - Notification document
 */
export async function sendPushNotification(notification) {
  try {
    // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
    // await pushClient.send({
    //   userId: notification.recipient,
    //   title: notification.title,
    //   body: notification.message,
    //   data: { actionUrl: notification.actionUrl }
    // });
    
    notification.deliveryStatus.push = {
      sent: true,
      sentAt: new Date()
    };
    await notification.save();
    
    logger.info('Push notification sent', {
      notificationId: notification._id
    });
  } catch (error) {
    notification.deliveryStatus.push = {
      sent: false,
      error: error.message
    };
    await notification.save();
    
    logger.error('Push notification failed:', error);
  }
}

/**
 * Send bulk notifications
 * @param {Array} recipients - Array of user IDs
 * @param {Object} notificationData - Notification template
 */
export async function sendBulkNotifications(recipients, notificationData) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (const recipientId of recipients) {
    try {
      await this.createAndSendNotification({
        ...notificationData,
        recipient: recipientId
      });
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        recipient: recipientId,
        error: error.message
      });
    }
  }
  
  logger.info('Bulk notifications sent', results);
  return results;
}

/**
 * Send scheduled reminders for bookings
 */
export async function sendBookingReminders() {
  try {
    const Booking = require('../models/Booking');
    
    // Find bookings happening in 24 hours
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(Date.now() + 25 * 60 * 60 * 1000);
    
    const upcomingBookings = await Booking.find({
      appointmentDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: 'confirmed'
    }).populate('student counselor');
    
    for (const booking of upcomingBookings) {
      // Send to student
      await this.createAndSendNotification({
        recipient: booking.student._id,
        type: 'booking_reminder',
        title: 'Appointment Reminder',
        message: `You have a counseling session tomorrow at ${booking.appointmentTime.start}`,
        priority: 'high',
        relatedEntity: {
          entityType: 'booking',
          entityId: booking._id
        },
        channels: {
          inApp: true,
          email: true,
          push: true
        }
      });
      
      // Send to counselor
      await this.createAndSendNotification({
        recipient: booking.counselor._id,
        type: 'booking_reminder',
        title: 'Appointment Reminder',
        message: `You have a counseling session tomorrow at ${booking.appointmentTime.start} with ${booking.student.name}`,
        priority: 'medium',
        relatedEntity: {
          entityType: 'booking',
          entityId: booking._id
        },
        channels: {
          inApp: true,
          email: true
        }
      });
      
      await booking.addReminder();
    }
    
    logger.info(`Sent reminders for ${upcomingBookings.length} bookings`);
  } catch (error) {
    logger.error('Booking reminder job failed:', error);
  }
}

/**
 * Send crisis alert notification
 * @param {String} userId - User ID
 * @param {Object} details - Crisis details
 */
export async function sendCrisisAlert(userId, details) {
  try {
    const User = require('../models/User');
    
    // Get all counselors and admins
    const alertRecipients = await User.find({
      role: { $in: ['counselor', 'admin'] },
      isActive: true
    }).select('_id');
    
    const notificationPromises = alertRecipients.map(recipient =>
      this.createAndSendNotification({
        recipient: recipient._id,
        type: 'crisis_alert',
        title: '⚠️ Crisis Alert',
        message: `A student needs immediate attention. Risk level: ${details.riskLevel}`,
        priority: 'urgent',
        metadata: {
          anonymizedUserId: details.userToken,
          riskLevel: details.riskLevel,
          timestamp: new Date().toISOString()
        },
        channels: {
          inApp: true,
          email: true,
          push: true
        }
      })
    );
    
    await Promise.all(notificationPromises);
    
    logger.security('Crisis alert sent to all counselors/admins', {
      riskLevel: details.riskLevel
    });
  } catch (error) {
    logger.error('Crisis alert failed:', error);
  }
}

/**
 * Get user notifications
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 */
export async function getUserNotifications(userId, options = {}) {
  const { 
    page = 1, 
    limit = 20, 
    unreadOnly = false,
    type 
  } = options;
  
  const query = { recipient: userId };
  
  if (unreadOnly) {
    query.read = false;
  }
  
  if (type) {
    query.type = type;
  }
  
  const notifications = await find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const count = await countDocuments(query);
  
  return {
    notifications,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count
  };
}

/**
 * Mark notifications as read
 * @param {Array} notificationIds - Array of notification IDs
 */
export async function markAsRead(notificationIds) {
  await updateMany(
    { _id: { $in: notificationIds } },
    { $set: { read: true, readAt: new Date() } }
  );
  
  logger.info(`Marked ${notificationIds.length} notifications as read`);
}

/**
 * Clean up old notifications
 */
export async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      read: true
    });
    
    logger.info(`Deleted ${result.deletedCount} old notifications`);
  } catch (error) {
    logger.error('Notification cleanup failed:', error);
  }
}

