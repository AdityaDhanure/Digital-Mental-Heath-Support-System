// src/middleware/validationMiddleware.js - Input Validation and Sanitization

import { body, param, query, validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';
import logger from '../utils/logger.js';

// Handle validation errors
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
}

export const validateRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role')
    .optional()
    .isIn(['student', 'counselor', 'admin']).withMessage('Invalid role'),

  // Phone number validation (required for all)
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(\+91[\s-]?)?[6-9]\d{9}$/).withMessage('Please provide a valid Indian mobile number'),

  // Gender validation (required for all)
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender option'),

  // Student-specific fields (conditional validation)
  body('department')
    .if(body('role').equals('student'))
    .notEmpty().withMessage('Department is required for students')
    .isIn(['CSE', 'ENTC', 'Mechanical', 'Civil', 'Electrical', 'IT']).withMessage('Invalid department'),

  body('year')
    .if(body('role').equals('student'))
    .notEmpty().withMessage('Year is required for students')
    .isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4')
    .toInt(),

  body('studentId')
    .if(body('role').equals('student'))
    .trim()
    .notEmpty().withMessage('Student ID is required for students')
    .isLength({ min: 5, max: 20 }).withMessage('Student ID must be between 5 and 20 characters'),

  // Counselor-specific fields (conditional validation)
  body('specialization')
    .if(body('role').equals('counselor'))
    .notEmpty().withMessage('Specialization is required for counselors')
    .isArray({ min: 1 }).withMessage('At least one specialization is required')
    .custom((value) => {
      const validSpecializations = [
        'Anxiety & Stress Management',
        'Depression & Mood Disorders',
        'Academic Counseling',
        'Career Guidance',
        'Relationship & Family Counseling',
        'Trauma & PTSD',
        'Addiction & Substance Abuse',
        'General Mental Health'
      ];
      const allValid = value.every(spec => validSpecializations.includes(spec));
      if (!allValid) {
        throw new Error('Invalid specialization option');
      }
      return true;
    }),

  body('address.street')
    .if(body('role').equals('counselor'))
    .trim()
    .notEmpty().withMessage('Street address is required for counselors'),

  body('address.city')
    .if(body('role').equals('counselor'))
    .trim()
    .notEmpty().withMessage('City is required for counselors'),

  body('address.state')
    .if(body('role').equals('counselor'))
    .trim()
    .notEmpty().withMessage('State is required for counselors'),

  body('address.pincode')
    .if(body('role').equals('counselor'))
    .trim()
    .notEmpty().withMessage('Pincode is required for counselors')
    .matches(/^\d{6}$/).withMessage('Pincode must be a valid 6-digit number'),

  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors
];

export const validateChatMessage = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message cannot be empty')
    .isLength({ max: 5000 }).withMessage('Message is too long (max 5000 characters)')
    .customSanitizer(value => sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {}
    })),

  body('sessionId')
    .optional()
    .isString().withMessage('Session ID must be a string'),

  handleValidationErrors
];

export const validateBooking = [
  body('counselorId')
    .notEmpty().withMessage('Counselor ID is required')
    .isMongoId().withMessage('Invalid counselor ID'),

  body('appointmentDate')
    .notEmpty().withMessage('Appointment date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom(value => {
      const appointmentDate = new Date(value);
      const now = new Date();
      if (appointmentDate < now) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),

  body('appointmentTime.start')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (use HH:MM)'),

  body('appointmentTime.end')
    .notEmpty().withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (use HH:MM)'),

  body('sessionType')
    .optional()
    .isIn(['first-visit', 'follow-up', 'crisis', 'group', 'emergency']).withMessage('Invalid session type'),

  body('mode')
    .optional()
    .isIn(['online', 'offline', 'phone']).withMessage('Invalid session mode'),

  body('concernCategory')
    .optional()
    .isIn(['anxiety', 'depression', 'stress', 'academic', 'relationship', 'family', 'other']).withMessage('Invalid concern category'),

  body('studentNotes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Student notes are too long (max 500 characters)')
    .customSanitizer(value => sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {}
    })),

  handleValidationErrors
];

export const validateResource = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters')
    .customSanitizer(value => sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {}
    })),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters')
    .customSanitizer(value => sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
      allowedAttributes: {}
    })),

  body('type')
    .notEmpty().withMessage('Resource type is required')
    .isIn(['article', 'video', 'audio', 'pdf', 'exercise', 'guide', 'infographic']).withMessage('Invalid resource type'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn([
      'anxiety', 'depression', 'stress', 'sleep', 'mindfulness',
      'coping-strategies', 'self-care', 'academic-pressure',
      'relationships', 'crisis-management', 'general-wellness'
    ]).withMessage('Invalid category'),

  body('language')
    .optional()
    .isIn(['english', 'hindi', 'marathi', 'multilingual']).withMessage('Invalid language'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom(tags => {
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),

  handleValidationErrors
];

export const validatePost = [
  body('title')
    .trim()
    .notEmpty().withMessage('Post title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters')
    .customSanitizer(value => sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {}
    })),

  body('content')
    .trim()
    .notEmpty().withMessage('Post content is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters')
    .customSanitizer(value => sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      allowedAttributes: {}
    })),

  body('category')
    .optional()
    .isIn([
      'general-support', 'academic-stress', 'anxiety', 'depression',
      'relationships', 'self-care', 'success-stories', 'resources',
      'questions', 'other'
    ]).withMessage('Invalid category'),

  body('isAnonymous')
    .optional()
    .isBoolean().withMessage('isAnonymous must be a boolean'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom(tags => {
      if (tags.length > 5) {
        throw new Error('Maximum 5 tags allowed');
      }
      return true;
    }),

  handleValidationErrors
];

export const validateReply = [
  body('content')
    .trim()
    .notEmpty().withMessage('Reply content is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Reply must be between 1 and 2000 characters')
    .customSanitizer(value => sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong'],
      allowedAttributes: {}
    })),

  body('isAnonymous')
    .optional()
    .isBoolean().withMessage('isAnonymous must be a boolean'),

  handleValidationErrors
];

// MongoDB ID validation
export function validateMongoId(paramName = 'id') {
  return [
    param(paramName)
      .isMongoId().withMessage(`Invalid ${paramName}`),

    handleValidationErrors
  ];
}

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('sort')
    .optional()
    .isString().withMessage('Sort must be a string'),

  handleValidationErrors
];

export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format')
    .custom((endDate, { req }) => {
      if (req.query.startDate && new Date(endDate) < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  handleValidationErrors
];

// Custom sanitizer for rich text content
export function sanitizeRichText(req, res, next) {
  if (req.body.content) {
    req.body.content = sanitizeHtml(req.body.content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
      allowedAttributes: {
        'a': ['href', 'target']
      },
      allowedSchemes: ['http', 'https']
    });
  }
  next();
}

