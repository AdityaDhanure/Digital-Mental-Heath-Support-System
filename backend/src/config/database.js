// src/config/database.js - MongoDB Connection Configuration

import logger from '../utils/logger.js';

import pkg from 'mongoose';
const { connect, connection } = pkg;

const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);

    // Connection event handlers
    connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    connection.on('error', (err) => {
      logger.error('Mongoose connection error:', err);
    });

    connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await connection.close();
      logger.info('Mongoose connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

export default connectDB;