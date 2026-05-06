// src/controllers/adminController.js - Admin Dashboard & Analytics

import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Booking from '../models/Booking.js';
import Resource from '../models/Resource.js';
import Post from '../models/Post.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import logger from '../utils/logger.js';
import axios from 'axios';
import { createAnonymizedToken } from '../utils/encryption.js';
import { SERVICES_CONFIG } from '../config/env.js';

const ANALYTICS_SERVICE_URL = SERVICES_CONFIG.ANALYTICS_SERVICE_URL;

export const getDashboardStats = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Date range setup
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  
  // Parallel queries for better performance
  const [
    totalUsers,
    activeUsers,
    totalChats,
    totalBookings,
    totalResources,
    totalPosts,
    newUsersThisMonth,
    pendingBookings,
    flaggedPosts
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ 
      isActive: true,
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),
    Chat.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    Booking.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    Resource.countDocuments({ isPublished: true, isArchived: false }),
    Post.countDocuments({ 
      status: 'published',
      createdAt: { $gte: start, $lte: end }
    }),
    User.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }),
    Booking.countDocuments({ status: 'pending' }),
    Post.countDocuments({ 
      'moderation.flagged': true,
      'moderation.moderatorReviewed': false 
    })
  ]);
  
  // User breakdown by role
  const usersByRole = await User.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  
  // Booking status breakdown
  const bookingsByStatus = await Booking.aggregate([
    { 
      $match: { 
        createdAt: { $gte: start, $lte: end }
      }
    },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Chat safety metrics
  const chatSafetyMetrics = await Chat.aggregate([
    { 
      $match: { 
        createdAt: { $gte: start, $lte: end }
      }
    },
    { 
      $group: { 
        _id: '$safetyCheck.riskLevel',
        count: { $sum: 1 }
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalUsers,
        activeUsers,
        totalChats,
        totalBookings,
        totalResources,
        totalPosts,
        newUsersThisMonth
      },
      alerts: {
        pendingBookings,
        flaggedPosts
      },
      breakdown: {
        usersByRole,
        bookingsByStatus,
        chatSafetyMetrics
      },
      dateRange: {
        start,
        end
      }
    }
  });
});

export const getUserAnalytics = catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;
  
  // Calculate date range
  const periodDays = parseInt(period) || 30;
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
  
  // User registration trend
  const registrationTrend = await User.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
  
  // Active users by role
  const activeUsersByRole = await User.aggregate([
    {
      $match: {
        isActive: true,
        lastLogin: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // User engagement metrics
  const engagementMetrics = await User.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        avgLastLogin: { $avg: { $subtract: [new Date(), '$lastLogin'] } },
        emailVerifiedCount: {
          $sum: { $cond: ['$isEmailVerified', 1, 0] }
        }
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      registrationTrend,
      activeUsersByRole,
      engagementMetrics: engagementMetrics[0] || {}
    }
  });
});

export const getChatAnalytics = catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;
  
  const periodDays = parseInt(period) || 30;
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
  
  // Chat volume trend
  const chatVolumeTrend = await Chat.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        avgMessages: { $avg: { $size: '$messages' } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
  
  // Safety risk distribution
  const riskDistribution = await Chat.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: '$safetyCheck.riskLevel',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Sentiment analysis
  const sentimentDistribution = await Chat.aggregate([
    {
      $match: { 
        createdAt: { $gte: startDate },
        'sentimentAnalysis.overallSentiment': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$sentimentAnalysis.overallSentiment',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // High-risk sessions count
  const highRiskCount = await Chat.countDocuments({
    createdAt: { $gte: startDate },
    'safetyCheck.riskLevel': { $in: ['high', 'critical'] }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      chatVolumeTrend,
      riskDistribution,
      sentimentDistribution,
      highRiskCount,
      note: 'All data is anonymized and aggregated for privacy'
    }
  });
});

export const getBookingAnalytics = catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;
  
  const periodDays = parseInt(period) || 30;
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
  
  // Booking trends
  const bookingTrend = await Booking.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
  
  // Status distribution
  const statusDistribution = await Booking.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Concern categories
  const concernCategories = await Booking.aggregate([
    {
      $match: { 
        createdAt: { $gte: startDate },
        concernCategory: { $exists: true }
      }
    },
    {
      $group: {
        _id: '$concernCategory',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // Counselor utilization
  const counselorUtilization = await Booking.aggregate([
    {
      $match: { 
        createdAt: { $gte: startDate },
        status: { $in: ['confirmed', 'completed'] }
      }
    },
    {
      $group: {
        _id: '$counselor',
        totalBookings: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'counselorInfo'
      }
    },
    {
      $project: {
        counselorName: { $arrayElemAt: ['$counselorInfo.name', 0] },
        totalBookings: 1,
        completedSessions: 1
      }
    },
    { $sort: { totalBookings: -1 } }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      bookingTrend,
      statusDistribution,
      concernCategories,
      counselorUtilization
    }
  });
});

export const getCommunityAnalytics = catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;
  
  const periodDays = parseInt(period) || 30;
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
  
  // Post activity trend
  const postActivityTrend = await Post.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        postCount: { $sum: 1 },
        totalReplies: { $sum: '$metrics.replyCount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
  
  // Category distribution
  const categoryDistribution = await Post.aggregate([
    {
      $match: { 
        createdAt: { $gte: startDate },
        status: 'published'
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // Moderation metrics
  const moderationMetrics = await Post.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        flaggedPosts: {
          $sum: { $cond: ['$moderation.flagged', 1, 0] }
        },
        removedPosts: {
          $sum: { $cond: ['$moderation.removed', 1, 0] }
        }
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      postActivityTrend,
      categoryDistribution,
      moderationMetrics: moderationMetrics[0] || {}
    }
  });
});

export const getSystemHealth = catchAsync(async (req, res) => {
  // Database connection status
  const dbStatus = {
    connected: require('mongoose').connection.readyState === 1,
    collections: await require('mongoose').connection.db.listCollections().toArray()
  };
  
  // Check Python AI service
  let aiServiceStatus = { status: 'unknown' };
  try {
    const aiHealth = await axios.get(`${SERVICES_CONFIG.AI_SERVICE_URL}/health`, {
      timeout: 5000
    });
    aiServiceStatus = {
      status: 'healthy',
      ...aiHealth.data
    };
  } catch (error) {
    aiServiceStatus = {
      status: 'unavailable',
      error: error.message
    };
  }
  
  // Check Analytics service
  let analyticsServiceStatus = { status: 'unknown' };
  try {
    const analyticsHealth = await axios.get(`${ANALYTICS_SERVICE_URL}/health`, {
      timeout: 5000
    });
    analyticsServiceStatus = {
      status: 'healthy',
      ...analyticsHealth.data
    };
  } catch (error) {
    analyticsServiceStatus = {
      status: 'unavailable',
      error: error.message
    };
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      apiServer: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      },
      database: dbStatus,
      aiService: aiServiceStatus,
      analyticsService: analyticsServiceStatus
    }
  });
});

export const manageUsers = catchAsync(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  
  const query = {};
  if (role) query.role = role;
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } }
    ];
  }
  
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const count = await User.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: {
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    }
  });
});

export const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
  
  logger.audit('User role updated', {
    userId: id,
    newRole: role,
    updatedBy: req.user._id
  });
  
  res.status(200).json({
    status: 'success',
    message: 'User role updated',
    data: { user }
  });
});

export const toggleUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  
  const user = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  ).select('-password');
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
  
  logger.security('User status changed', {
    userId: id,
    isActive,
    changedBy: req.user._id
  });
  
  res.status(200).json({
    status: 'success',
    message: `User ${isActive ? 'activated' : 'deactivated'}`,
    data: { user }
  });
});

export const getUserChatAnalysis = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { period = '30' } = req.query;
  
  const periodDays = parseInt(period) || 30;
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
  
  // Get user by ID
  const user = await User.findById(userId).select('name email createdAt lastLogin role');
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
  
  // Generate the user's token to filter their chats
  const userToken = createAnonymizedToken(userId);
  
  // Get user's chat sessions using the correct userToken
  const chats = await Chat.find({
    userToken: userToken,
    createdAt: { $gte: startDate }
  })
  .select('title sessionId messages sentimentAnalysis safetyCheck createdAt')
  .sort({ createdAt: -1 });
  
  // Aggregate sentiment data
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
  const stressCounts = { none: 0, low: 0, moderate: 0, high: 0, severe: 0 };
  const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  const dailyMessages = {};
  const emotionCounts = {};
  
  let totalMessages = 0;
  let highRiskSessions = 0;
  
  chats.forEach(chat => {
    // Count sentiments
    if (chat.sentimentAnalysis?.overallSentiment) {
      sentimentCounts[chat.sentimentAnalysis.overallSentiment]++;
    }
    
    // Count stress levels
    if (chat.sentimentAnalysis?.stressLevel) {
      stressCounts[chat.sentimentAnalysis.stressLevel]++;
    }
    
    // Count risk levels
    if (chat.sentimentAnalysis?.emotionDetected) {
      chat.sentimentAnalysis.emotionDetected.forEach(em => {
        emotionCounts[em.emotion] = (emotionCounts[em.emotion] || 0) + em.confidence;
      });
    }
    
    // Count risk levels
    if (chat.safetyCheck?.riskLevel) {
      riskCounts[chat.safetyCheck.riskLevel]++;
      if (chat.safetyCheck.riskLevel === 'high' || chat.safetyCheck.riskLevel === 'critical') {
        highRiskSessions++;
      }
    }
    
    // Count messages per day
    const day = chat.createdAt.toISOString().split('T')[0];
    dailyMessages[day] = (dailyMessages[day] || 0) + (chat.messages?.length || 0);
    
    totalMessages += chat.messages?.length || 0;
  });
  
  // Calculate top emotions
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emotion, score]) => ({ emotion, score }));
  
  // Calculate dominant sentiment
  const dominantSentiment = Object.entries(sentimentCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  
  // Calculate overall stress trend
  const stressTrend = [];
  Object.entries(stressCounts).forEach(([level, count]) => {
    if (level !== 'none' && count > 0) {
      stressTrend.push({ level, count });
    }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        memberSince: user.createdAt,
        lastActive: user.lastLogin
      },
      summary: {
        totalSessions: chats.length,
        totalMessages,
        averageMessagesPerSession: chats.length > 0 ? Math.round(totalMessages / chats.length) : 0,
        highRiskSessions,
        dominantSentiment,
        period: `${periodDays} days`
      },
      sentimentAnalysis: {
        distribution: sentimentCounts,
        dominant: dominantSentiment
      },
      stressAnalysis: {
        distribution: stressCounts,
        trend: stressTrend
      },
      riskAnalysis: {
        distribution: riskCounts,
        highRiskCount: highRiskSessions
      },
      emotionAnalysis: {
        topEmotions
      },
      messageTrend: Object.entries(dailyMessages)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count })),
      sessions: chats.slice(0, 20).map(chat => ({
        _id: chat._id,
        title: chat.title,
        sessionId: chat.sessionId,
        messageCount: chat.messages?.length || 0,
        sentiment: chat.sentimentAnalysis?.overallSentiment || 'neutral',
        stressLevel: chat.sentimentAnalysis?.stressLevel || 'none',
        riskLevel: chat.safetyCheck?.riskLevel || 'low',
        createdAt: chat.createdAt
      }))
    }
  });
});

export const generateAnalyticsReport = catchAsync(async (req, res) => {
  const { reportType, startDate, endDate, format } = req.body;
  
  try {
    const period = 30;
    const reportContent = await import('../utils/reportGenerator.js').then(m => 
      m.generateAnalyticsReport(reportType, startDate, endDate, period)
    );
    
    if (format === 'text') {
      res.status(200).json({
        status: 'success',
        data: {
          content: reportContent,
          format: 'text',
          filename: `analytics-report-${reportType}-${Date.now()}.txt`
        }
      });
    } else {
      // For PDF format, send as downloadable text file
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-report-${reportType}-${Date.now()}.txt"`);
      res.send(reportContent);
    }
  } catch (error) {
    logger.error('Analytics report generation failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate analytics report'
    });
  }
});

