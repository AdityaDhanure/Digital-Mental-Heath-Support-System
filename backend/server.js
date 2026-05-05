// server.js - Main Entry Point for Backend

import 'dotenv/config';

import app from './src/app.js';
import connectDB from './src/config/database.js';
import logger from './src/utils/logger.js';
import { verifyEmailConnection } from './src/services/emailService.js';

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Start Server
const server = app.listen(PORT, async () => {
  logger.info(`🚀 Mental Health Backend Server running on port ${PORT}`);
  logger.info(`📅 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Verify Email Connection
  await verifyEmailConnection();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

export default server;