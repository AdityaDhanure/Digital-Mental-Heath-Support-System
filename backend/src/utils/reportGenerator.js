// src/utils/reportGenerator.js - PDF Report Generation for Admin Analytics
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Booking from '../models/Booking.js';
import Resource from '../models/Resource.js';
import Post from '../models/Post.js';
import { createAnonymizedToken } from './encryption.js';

const generatePDFContent = (reportData) => {
  const {
    reportType,
    period,
    startDate,
    endDate,
    overview,
    chatAnalytics,
    bookingAnalytics,
    communityAnalytics,
    generatedAt
  } = reportData;

  let content = '';
  
  content += '═══════════════════════════════════════════════════════════════\n';
  content += '                  MENTAL HEALTH SUPPORT PLATFORM\n';
  content += '                    ANALYTICS REPORT\n';
  content += '═══════════════════════════════════════════════════════════════\n\n';
  
  content += `Report Type: ${reportType.toUpperCase()}\n`;
  content += `Period: ${period} days\n`;
  content += `Generated: ${new Date(generatedAt).toLocaleString()}\n`;
  content += `Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n`;
  content += '\n───────────────────────────────────────────────────────────────\n\n';

  // Overview Section
  if (overview) {
    content += '📊 PLATFORM OVERVIEW\n';
    content += '───────────────────────────────────────────────────────────────\n';
    content += `  Total Users:           ${overview.totalUsers || 0}\n`;
    content += `  Active Users (7d):     ${overview.activeUsers || 0}\n`;
    content += `  New Users (30d):       ${overview.newUsersThisMonth || 0}\n`;
    content += `  Total Chat Sessions:   ${overview.totalChats || 0}\n`;
    content += `  Total Bookings:        ${overview.totalBookings || 0}\n`;
    content += `  Published Resources:   ${overview.totalResources || 0}\n`;
    content += `  Community Posts:      ${overview.totalPosts || 0}\n`;
    content += '\n';
  }

  // Chat Analytics Section
  if (chatAnalytics) {
    content += '💬 CHAT ANALYTICS\n';
    content += '───────────────────────────────────────────────────────────────\n';
    
    if (chatAnalytics.sentimentDistribution?.length > 0) {
      content += '  Sentiment Distribution:\n';
      const totalSent = chatAnalytics.sentimentDistribution.reduce((sum, s) => sum + s.count, 0);
      chatAnalytics.sentimentDistribution.forEach(s => {
        const pct = totalSent > 0 ? ((s.count / totalSent) * 100).toFixed(1) : '0.0';
        content += `    - ${(s._id || 'unknown').padEnd(10)}: ${String(s.count).padStart(4)} (${pct}%)\n`;
      });
    }
    
    if (chatAnalytics.riskDistribution?.length > 0) {
      content += '\n  Risk Level Distribution:\n';
      chatAnalytics.riskDistribution.forEach(r => {
        content += `    - ${(r._id || 'unknown').padEnd(10)}: ${String(r.count).padStart(4)}\n`;
      });
    }
    
    content += `\n  High Risk Sessions:    ${chatAnalytics.highRiskCount || 0}\n`;
    content += '\n';
  }

  // Booking Analytics Section
  if (bookingAnalytics) {
    content += '📅 COUNSELING SESSION ANALYTICS\n';
    content += '───────────────────────────────────────────────────────────────\n';
    
    if (bookingAnalytics.statusDistribution?.length > 0) {
      content += '  Booking Status:\n';
      bookingAnalytics.statusDistribution.forEach(s => {
        content += `    - ${(s._id || 'unknown').padEnd(12)}: ${String(s.count).padStart(4)}\n`;
      });
    }
    
    if (bookingAnalytics.concernCategories?.length > 0) {
      content += '\n  Top Counseling Topics:\n';
      bookingAnalytics.concernCategories.slice(0, 5).forEach((c, i) => {
        content += `    ${i + 1}. ${(c._id || 'Other').padEnd(20)}: ${String(c.count).padStart(4)}\n`;
      });
    }
    
    if (bookingAnalytics.counselorUtilization?.length > 0) {
      content += '\n  Counselor Performance:\n';
      bookingAnalytics.counselorUtilization.slice(0, 5).forEach(c => {
        const rate = c.totalBookings > 0 
          ? Math.round((c.completedSessions / c.totalBookings) * 100) 
          : 0;
        content += `    - ${(c.counselorName || 'Unknown').padEnd(20)}: ${String(c.completedSessions).padStart(3)}/${String(c.totalBookings).padStart(3)} (${rate}%)\n`;
      });
    }
    content += '\n';
  }

  // Community Analytics Section
  if (communityAnalytics) {
    content += '👥 COMMUNITY ANALYTICS\n';
    content += '───────────────────────────────────────────────────────────────\n';
    
    if (communityAnalytics.categoryDistribution?.length > 0) {
      content += '  Post Categories:\n';
      communityAnalytics.categoryDistribution.slice(0, 8).forEach(c => {
        content += `    - ${((c._id || '').replace('-', ' ')).padEnd(25)}: ${String(c.count).padStart(4)}\n`;
      });
    }
    content += '\n';
  }

  // Alerts Section
  content += '⚠️  ALERTS & RECOMMENDATIONS\n';
  content += '───────────────────────────────────────────────────────────────\n';
  
  if (overview?.pendingBookings > 0) {
    content += `  ⚡ ${overview.pendingBookings} pending booking(s) require attention\n`;
  }
  if (overview?.flaggedPosts > 0) {
    content += `  🚩 ${overview.flaggedPosts} flagged post(s) need moderation\n`;
  }
  if (chatAnalytics?.highRiskCount > 0) {
    content += `  🛡️  ${chatAnalytics.highRiskCount} high-risk chat session(s) detected\n`;
  }
  
  if (!overview?.pendingBookings && !overview?.flaggedPosts && !chatAnalytics?.highRiskCount) {
    content += '  ✅ No critical alerts at this time\n';
  }
  
  content += '\n───────────────────────────────────────────────────────────────\n';
  content += '                    END OF REPORT\n';
  content += '═══════════════════════════════════════════════════════════════\n';
  content += '\nThis report is automatically generated for administrative purposes.\n';
  content += 'For sensitive data inquiries, please contact the system administrator.\n';

  return content;
};

export const generateAnalyticsReport = async (reportType, startDate, endDate, period = 30) => {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - period * 24 * 60 * 60 * 1000);
  const endDateObj = endDate ? new Date(endDate) : new Date();

  // Gather all analytics data
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
    Chat.countDocuments({ createdAt: { $gte: start, $lte: endDateObj } }),
    Booking.countDocuments({ createdAt: { $gte: start, $lte: endDateObj } }),
    Resource.countDocuments({ isPublished: true, isArchived: false }),
    Post.countDocuments({ status: 'published', createdAt: { $gte: start, $lte: endDateObj } }),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    Booking.countDocuments({ status: 'pending' }),
    Post.countDocuments({ 'moderation.flagged': true, 'moderation.moderatorReviewed': false })
  ]);

  // Chat analytics
  const [
    sentimentDistribution,
    riskDistribution,
    highRiskCount
  ] = await Promise.all([
    Chat.aggregate([
      { $match: { createdAt: { $gte: start }, 'sentimentAnalysis.overallSentiment': { $exists: true } } },
      { $group: { _id: '$sentimentAnalysis.overallSentiment', count: { $sum: 1 } } }
    ]),
    Chat.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: '$safetyCheck.riskLevel', count: { $sum: 1 } } }
    ]),
    Chat.countDocuments({ createdAt: { $gte: start }, 'safetyCheck.riskLevel': { $in: ['high', 'critical'] } })
  ]);

  // Booking analytics
  const [
    statusDistribution,
    concernCategories,
    counselorUtilization
  ] = await Promise.all([
    Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lte: endDateObj } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lte: endDateObj }, concernCategory: { $exists: true } } },
      { $group: { _id: '$concernCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lte: endDateObj } } },
      { $group: { 
        _id: '$counselor',
        totalBookings: { $sum: 1 },
        completedSessions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'counselorInfo' } },
      { $unwind: '$counselorInfo' },
      { $project: { counselorName: '$counselorInfo.name', totalBookings: 1, completedSessions: 1 } },
      { $sort: { totalBookings: -1 } }
    ])
  ]);

  // Community analytics
  const categoryDistribution = await Post.aggregate([
    { $match: { status: 'published', createdAt: { $gte: start, $lte: endDateObj } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const reportData = {
    reportType,
    period,
    startDate: start,
    endDate: endDateObj,
    overview: {
      totalUsers,
      activeUsers,
      totalChats,
      totalBookings,
      totalResources,
      totalPosts,
      newUsersThisMonth,
      pendingBookings,
      flaggedPosts
    },
    chatAnalytics: {
      sentimentDistribution,
      riskDistribution,
      highRiskCount
    },
    bookingAnalytics: {
      statusDistribution,
      concernCategories,
      counselorUtilization
    },
    communityAnalytics: {
      categoryDistribution
    },
    generatedAt: new Date()
  };

  return generatePDFContent(reportData);
};

export default { generateAnalyticsReport };
