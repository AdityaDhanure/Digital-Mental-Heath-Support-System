// src/models/Notification.js - Notification System Schema

import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  // Recipient
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'booking_confirmed',
      'booking_reminder',
      'booking_cancelled',
      'booking_rescheduled',
      'chat_alert',
      'community_reply',
      'community_upvote',
      'resource_recommendation',
      'crisis_alert',
      'system_announcement',
      'counselor_message',
      'moderation_action',
      'general'
    ],
    required: true,
    index: true
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
  // Related entity reference
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['booking', 'post', 'chat', 'resource', 'user'],
    },
    entityId: {
      type: Schema.Types.ObjectId
    }
  },
  
  // Action button/link
  actionUrl: {
    type: String,
    trim: true
  },
  
  actionLabel: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  // Status
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  
  readAt: {
    type: Date
  },
  
  // Delivery channels
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  
  // Delivery status
  deliveryStatus: {
    inApp: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    }
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    index: true
  }
  
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method: Create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this({
    recipient: data.recipient,
    type: data.type,
    title: data.title,
    message: data.message,
    priority: data.priority || 'medium',
    relatedEntity: data.relatedEntity,
    actionUrl: data.actionUrl,
    actionLabel: data.actionLabel,
    channels: data.channels || { inApp: true },
    expiresAt: data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });
  
  return await notification.save();
};

// Static method: Get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    recipient: userId,
    read: false
  });
};

// Static method: Mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true, readAt: new Date() } }
  );
};

// Instance method: Mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return await this.save();
};

// Instance method: Mark as delivered
notificationSchema.methods.markAsDelivered = async function(channel) {
  if (this.deliveryStatus[channel]) {
    this.deliveryStatus[channel].delivered = true;
    this.deliveryStatus[channel].deliveredAt = new Date();
  }
  return await this.save();
};

export default model('Notification', notificationSchema);