// src/middleware/errorMiddleware.js - Global Error Handler

import logger from '../utils/logger.js';

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle specific error types
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} = "${value}". Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => 
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => 
  new AppError('Your session has expired. Please log in again.', 401);

const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File size is too large. Maximum size is 10MB.', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Too many files uploaded.', 400);
  }
  return new AppError('File upload error.', 400);
};

// Send error response in development
const sendErrorDev = (err, req, res) => {
  logger.error('ERROR 💥:', err);
  
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    ...(req.body && { requestBody: req.body })
  });
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  // Programming or unknown error: don't leak error details
  else {
    // Log error
    logger.error('ERROR 💥:', err);
    
    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    
    // MongoDB errors
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    // Multer errors
    if (err.name === 'MulterError') error = handleMulterError(err);
    
    sendErrorProd(error, req, res);
  }
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
  next(err);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  logger.error(err.stack);
  
  // Give server time to finish pending requests
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  logger.error(err.stack);
  
  process.exit(1);
});

// Named exports (for use in Controllers)
export { catchAsync, AppError, notFoundHandler };

// Default export (MUST be the function for app.use)
export default errorHandler;