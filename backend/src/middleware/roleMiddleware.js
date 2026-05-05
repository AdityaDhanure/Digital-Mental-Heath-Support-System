// src/middleware/roleMiddleware.js - Role-Based Access Control

import logger from '../utils/logger.js';

// Restrict access to specific roles
export function restrictTo(...roles) {
  return (req, res, next) => {
    // Check if user exists (should be set by authMiddleware.protect)
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'You must be logged in to access this resource.'
      });
    }
    
    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      logger.warn(`Access denied: User ${req.user._id} (${req.user.role}) attempted to access ${req.originalUrl}`);
      
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
}

// Check if user is a student
export function isStudent(req, res, next) {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      status: 'error',
      message: 'This resource is only accessible to students.'
    });
  }
  next();
}

// Check if user is a counselor
export function isCounselor(req, res, next) {
  if (req.user.role !== 'counselor') {
    return res.status(403).json({
      status: 'error',
      message: 'This resource is only accessible to counselors.'
    });
  }
  next();
}

// Check if user is an admin
export function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'This resource is only accessible to administrators.'
    });
  }
  next();
}

// Check if user is a moderator
export function isModerator(req, res, next) {
  if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'This resource is only accessible to moderators.'
    });
  }
  next();
}

// Check resource ownership
export function checkOwnership(Model, paramName = 'id') {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          status: 'error',
          message: 'Resource not found.'
        });
      }
      
      // Check if user owns the resource
      // Handle both 'author' and 'student' field names
      const ownerId = resource.author || resource.student || resource.user;
      
      if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
        // Admin and moderators can bypass ownership check
        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
          return res.status(403).json({
            status: 'error',
            message: 'You do not have permission to access this resource.'
          });
        }
      }
      
      // Attach resource to request for use in controller
      req.resource = resource;
      next();
      
    } catch (error) {
      logger.error('Ownership check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error checking resource ownership.'
      });
    }
  };
}

// Check if user can access another user's data
export function canAccessUserData(req, res, next) {
  const targetUserId = req.params.userId || req.params.id;
  const requestingUserId = req.user._id.toString();
  
  // Users can access their own data
  if (targetUserId === requestingUserId) {
    return next();
  }
  
  // Counselors can access student data for their appointments
  if (req.user.role === 'counselor') {
    // Additional check should be done in controller
    return next();
  }
  
  // Admins can access all user data
  if (req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    status: 'error',
    message: 'You do not have permission to access this user\'s data.'
  });
}

// Check counselor-student relationship for bookings
export async function checkCounselorStudentRelation(req, res, next) {
  try {
    const Booking = require('../models/Booking').default;
    
    const bookingId = req.params.bookingId || req.params.id;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found.'
      });
    }
    
    const userId = req.user._id.toString();
    const studentId = booking.student.toString();
    const counselorId = booking.counselor.toString();
    
    // Check if user is part of this booking
    if (userId !== studentId && userId !== counselorId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this booking.'
      });
    }
    
    req.booking = booking;
    next();
    
  } catch (error) {
    logger.error('Relationship check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error verifying relationship.'
    });
  }
}

// Privacy protection for chat access
export function protectChatPrivacy(req, res, next) {
  // Even admins cannot access private chat logs
  if (req.user.role === 'admin') {
    logger.warn(`Admin ${req.user._id} attempted to access chat logs`);
    return res.status(403).json({
      status: 'error',
      message: 'Chat conversations are strictly confidential and cannot be accessed by administrators.',
      code: 'PRIVACY_PROTECTED'
    });
  }
  
  next();
}

// Allow only user to access their own chats
export function restrictChatAccess(req, res, next) {
  const userToken = req.params.userToken || req.body.userToken;
  
  // Generate token from current user ID to compare
  const crypto = require('crypto');
  const expectedToken = crypto
    .createHash('sha256')
    .update(req.user._id.toString())
    .digest('hex');
  
  // In real implementation, you'd verify the token properly
  // This is a simplified version
  
  next();
}

// Feature flag check (for gradual rollout)
export function checkFeatureAccess(featureName) {
  return (req, res, next) => {
    // Check if feature is enabled for this user/role
    const enabledFeatures = process.env.ENABLED_FEATURES?.split(',') || [];
    
    if (!enabledFeatures.includes(featureName)) {
      return res.status(403).json({
        status: 'error',
        message: 'This feature is currently not available.',
        code: 'FEATURE_DISABLED'
      });
    }
    
    next();
  };
}

