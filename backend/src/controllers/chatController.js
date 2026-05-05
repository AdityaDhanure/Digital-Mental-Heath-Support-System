// src/controllers/chatController.js - UPDATED with MongoDB storage

import Chat from '../models/Chat.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { createAnonymizedToken, encrypt, decrypt } from '../utils/encryption.js';
import logger from '../utils/logger.js';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

/**
 * Strip Python-style dict artifacts from AI response and return clean text.
 * Handles cases like: {'type': 'text', 'text': 'Hello!', 'extras': {...}}
 */
function sanitizeAIResponse(raw) {
  if (!raw || typeof raw !== 'string') return raw;

  // If it looks like a Python dict string, try to extract the 'text' key
  if (raw.trim().startsWith('{')) {
    // Replace Python single-quotes with double-quotes for JSON parsing
    try {
      const jsonReady = raw
        .replace(/'/g, '"')
        .replace(/None/g, 'null')
        .replace(/True/g, 'true')
        .replace(/False/g, 'false');
      const parsed = JSON.parse(jsonReady);
      if (parsed.text) return parsed.text;
      if (parsed.content) return parsed.content;
      if (parsed.message) return parsed.message;
    } catch (_) {
      // Fallback: extract 'text' value with regex
      const match = raw.match(/['"]text['"]\s*:\s*['"](.+?)['"]\s*(?:,|\})/s);
      if (match) return match[1];
    }
  }

  return raw;
}



/**
 * Send message to AI chatbot and store in MongoDB
 * POST /api/chat/message
 */
export const sendMessage = catchAsync(async (req, res) => {
  const { message, sessionId } = req.body;
  const userId = req.user._id;
  
  // Create anonymized user token for privacy
  const userToken = createAnonymizedToken(userId.toString());
  
  // Find or create chat session in MongoDB
  let chatSession = await Chat.findOne({
    userToken,
    sessionId: sessionId || 'default',
    isActive: true
  });
  
  if (!chatSession) {
    const { userToken: newToken, sessionId: newSessionId } = Chat.createSession(userId.toString());
    chatSession = await Chat.create({
      userToken: newToken,
      sessionId: sessionId || newSessionId,
      messages: []
    });
  }
  
  // Add user message to MongoDB
  await chatSession.addMessage('user', message);

  // Auto-title the session from the first user message if not already titled
  let autoTitle = null;
  if (!chatSession.title && chatSession.messages.length === 1) {
    autoTitle = message.length > 50 ? message.slice(0, 50).trimEnd() + '...' : message;
    chatSession.title = autoTitle;
    await chatSession.save();
  }
  
  // Prepare conversation history for AI (last 10 messages)
  const conversationHistory = chatSession.messages.slice(-10).map(msg => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp
  }));
  
  try {
    // Call Python AI Service with conversation history
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat`, {
      message,
      sessionId: chatSession.sessionId,
      userId: userToken,
      conversationHistory,
      useRAG: true
    }, {
      timeout: 30000
    });
    
    const { 
      response: rawAiMessage, 
      safetyCheck, 
      sentiment,
      ragContext,
      processingTime 
    } = aiResponse.data;

    // Strip Python dict artifacts — keep only clean text
    const aiMessage = sanitizeAIResponse(rawAiMessage);
    
    // Add AI response to MongoDB
    await chatSession.addMessage('assistant', aiMessage);
    
    // Update AI metadata in MongoDB
    chatSession.aiMetadata = {
      modelUsed: aiResponse.data.modelUsed || 'gpt-3.5-turbo',
      ragContextUsed: ragContext?.used || false,
      retrievedDocuments: ragContext?.documents || [],
      processingTime: processingTime || 0
    };
    
    // Update safety assessment in MongoDB
    if (safetyCheck) {
      await chatSession.updateSafetyCheck({
        emotionalRiskScore: safetyCheck.riskScore || 0,
        riskLevel: safetyCheck.riskLevel || 'low',
        crisisKeywordsDetected: safetyCheck.keywords || [],
        flaggedForReview: safetyCheck.flagged || false,
        counselorAlerted: safetyCheck.alertCounselor || false
      });
    }
    
    // Update sentiment analysis in MongoDB
    if (sentiment) {
      chatSession.sentimentAnalysis = {
        overallSentiment: sentiment.overall || 'neutral',
        emotionDetected: sentiment.emotions.map(e => ({
          emotion: e.emotion,
          confidence: e.confidence
        })) || [],
        stressLevel: sentiment.stressLevel || 'none'
      };
    }
    
    // Save all updates to MongoDB
    await chatSession.save();
    
    logger.chat('AI response generated and saved to MongoDB', {
      sessionId: chatSession.sessionId,
      userId: userId.toString(),
      riskLevel: safetyCheck?.riskLevel || 'low',
      messageCount: chatSession.messages.length,
      processingTime
    });
    
    // Send counselor alert if needed
    if (safetyCheck?.alertCounselor) {
      // TODO: Implement notification service to alert counselors
      logger.security('High-risk chat detected - counselor alert triggered', {
        userId: userId.toString(),
        sessionId: chatSession.sessionId,
        riskLevel: safetyCheck.riskLevel
      });
    }
    
    // Prepare response
    const responseData = {
      message: aiMessage,
      sessionId: chatSession.sessionId,
      messageCount: chatSession.messages.length,
      autoTitle: autoTitle || chatSession.title || null,
      safety: {
        riskLevel: safetyCheck?.riskLevel || 'low',
        needsCounselor: safetyCheck?.flagged || false
      },
      sentiment: sentiment?.overall || 'neutral',
      processingTime
    };
    
    // Include emergency resources if high risk
    if (safetyCheck?.riskLevel === 'high' || safetyCheck?.riskLevel === 'critical') {
      responseData.emergencyResources = {
        helpline: '1-800-273-8255',
        emergencyContacts: ['Crisis Counselor', 'Campus Security'],
        immediateActions: [
          'Contact a counselor immediately',
          'Call emergency helpline',
          'Reach out to a trusted friend or family member'
        ]
      };
    }
    
    res.status(200).json({
      status: 'success',
      data: responseData
    });
    
  } catch (error) {
    logger.error('AI Service error:', error);
    
    // Save error state to MongoDB
    await chatSession.addMessage('system', 'AI service temporarily unavailable', {
      isEncrypted: false
    });
    
    const fallbackMessage = "I'm having trouble connecting right now. Please try again in a moment, or contact a counselor directly if you need immediate help.";
    
    await chatSession.addMessage('assistant', fallbackMessage, { 
      isEncrypted: false 
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        message: fallbackMessage,
        sessionId: chatSession.sessionId,
        messageCount: chatSession.messages.length,
        safety: {
          riskLevel: 'low',
          needsCounselor: false
        },
        error: 'AI_SERVICE_UNAVAILABLE'
      }
    });
  }
});

/**
 * Get chat history from MongoDB
 * GET /api/chat/history
 */
export const getChatHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, sessionId } = req.query;
  
  const userToken = createAnonymizedToken(userId.toString());
  
  const query = {
    userToken,
    isActive: true
  };
  
  if (sessionId) {
    query.sessionId = sessionId;
  }
  
  // Get chat sessions from MongoDB
  const chats = await Chat.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-userToken -__v')
    .lean();
  
  const count = await Chat.countDocuments(query);
  
  // Format response
  const formattedChats = chats.map(chat => ({
    sessionId: chat.sessionId,
    title: chat.title || null,
    messageCount: chat.messages.length,
    lastMessage: chat.messages[chat.messages.length - 1],
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    riskLevel: chat.safetyCheck?.riskLevel || 'low',
    sentiment: chat.sentimentAnalysis?.overallSentiment || 'neutral'
  }));
  
  res.status(200).json({
    status: 'success',
    data: {
      chats: formattedChats,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    }
  });
});

/**
 * Get specific chat session with full history from MongoDB
 * GET /api/chat/session/:sessionId
 */
export const getChatSession = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.params;
  
  const userToken = createAnonymizedToken(userId.toString());
  
  // Find all chats with this sessionId and userToken
  const chatSessions = await Chat.find({
    userToken,
    sessionId
  })
  .select('-userToken -__v')
  .sort({ createdAt: 1 })
  .lean();
  
  if (!chatSessions || chatSessions.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Chat session not found'
    });
  }
  
  // If there are multiple sessions with same sessionId, merge messages
  let allMessages = [];
  let latestMetadata = {};
  let sessionTitle = null;
  
  chatSessions.forEach(session => {
    allMessages = allMessages.concat(session.messages);
    if (session.title) {
      sessionTitle = session.title;
    }
    latestMetadata = {
      safetyCheck: session.safetyCheck,
      sentimentAnalysis: session.sentimentAnalysis,
      aiMetadata: session.aiMetadata,
      updatedAt: session.updatedAt
    };
  });
  
  // Sort messages by timestamp
  allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  res.status(200).json({
    status: 'success',
    data: { 
      chat: {
        sessionId,
        title: sessionTitle,
        messages: allMessages,
        messageCount: allMessages.length,
        userId: userId.toString(),
        ...latestMetadata,
        createdAt: chatSessions[0].createdAt,
        updatedAt: latestMetadata.updatedAt
      }
    }
  });
});

/**
 * End chat session in MongoDB
 * POST /api/chat/session/:sessionId/end
 */
export const endChatSession = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.params;
  
  const userToken = createAnonymizedToken(userId.toString());
  
  const chatSession = await Chat.findOne({
    userToken,
    sessionId,
    isActive: true
  });
  
  if (!chatSession) {
    return res.status(404).json({
      status: 'error',
      message: 'Chat session not found'
    });
  }
  
  await chatSession.endSession();
  
  logger.chat('Chat session ended', { 
    sessionId,
    userId: userId.toString(),
    messageCount: chatSession.messages.length
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Chat session ended'
  });
});

/**
 * Delete chat history from MongoDB (privacy compliance)
 * DELETE /api/chat/history
 */
export const deleteChatHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.body;
  
  const userToken = createAnonymizedToken(userId.toString());
  
  const query = { userToken };
  if (sessionId) {
    query.sessionId = sessionId;
  }
  
  const result = await Chat.deleteMany(query);
  
  logger.security('Chat history deleted', {
    userId: userId.toString(),
    sessionsDeleted: result.deletedCount
  });
  
  res.status(200).json({
    status: 'success',
    message: `${result.deletedCount} chat session(s) deleted`
  });
});

/**
 * Get AI recommendations based on chat history from MongoDB
 * GET /api/chat/recommendations
 */
export const getRecommendations = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const userToken = createAnonymizedToken(userId.toString());
  
  // Get recent chat sessions from MongoDB
  const recentChats = await Chat.find({
    userToken,
    isActive: true
  })
  .sort({ createdAt: -1 })
  .limit(5)
  .select('sentimentAnalysis safetyCheck messages')
  .lean();
  
  // Analyze patterns
  const stressLevels = recentChats.map(c => c.sentimentAnalysis?.stressLevel || 'none');
  const sentiments = recentChats.map(c => c.sentimentAnalysis?.overallSentiment || 'neutral');
  const riskLevels = recentChats.map(c => c.safetyCheck?.riskLevel || 'low');
  
  const highStressCount = stressLevels.filter(s => s === 'high' || s === 'severe').length;
  const negativeCount = sentiments.filter(s => s === 'negative').length;
  const highRiskCount = riskLevels.filter(r => r === 'high' || r === 'critical').length;
  
  const recommendations = [];
  
  // High stress pattern
  if (highStressCount >= 2) {
    recommendations.push({
      type: 'stress-management',
      priority: 'high',
      title: 'Stress Management Resources',
      description: 'You seem to be experiencing high stress levels. Consider these resources.',
      resources: ['breathing-exercises', 'meditation-guides', 'counselor-booking'],
      actionUrl: '/resources?category=stress'
    });
  }
  
  // Negative sentiment pattern
  if (negativeCount >= 3) {
    recommendations.push({
      type: 'counseling',
      priority: 'high',
      title: 'Talk to a Counselor',
      description: 'Professional support can help you navigate difficult emotions.',
      action: 'book-counseling',
      actionUrl: '/bookings/create'
    });
  }
  
  // High risk detected
  if (highRiskCount >= 1) {
    recommendations.push({
      type: 'emergency',
      priority: 'urgent',
      title: 'Immediate Support Available',
      description: 'We noticed you might be in distress. Help is available 24/7.',
      resources: ['crisis-helpline', 'emergency-contacts', 'immediate-counseling'],
      actionUrl: '/emergency-resources'
    });
  }
  
  // General wellness
  recommendations.push({
    type: 'general',
    priority: 'normal',
    title: 'Daily Wellness Tips',
    description: 'Check out our wellness resources',
    resources: ['self-care-guides', 'success-stories', 'peer-community'],
    actionUrl: '/resources'
  });
  
  res.status(200).json({
    status: 'success',
    data: { 
      recommendations,
      analysis: {
        totalSessions: recentChats.length,
        highStressCount,
        negativeCount,
        highRiskCount
      }
    }
  });
});

/**
 * Rename a chat session title in MongoDB
 * PATCH /api/chat/session/:sessionId/rename
 */
export const renameSession = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.params;
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ status: 'error', message: 'Title is required' });
  }

  const userToken = createAnonymizedToken(userId.toString());

  const result = await Chat.renameSession(userToken, sessionId, title.trim());

  if (result.matchedCount === 0) {
    return res.status(404).json({ status: 'error', message: 'Chat session not found' });
  }

  logger.chat('Chat session renamed', { sessionId, userId: userId.toString(), title });

  res.status(200).json({
    status: 'success',
    message: 'Chat renamed successfully',
    data: { sessionId, title: title.trim() }
  });
});

/**
 * Report inappropriate AI response
 * POST /api/chat/report
 */
export const reportResponse = catchAsync(async (req, res) => {
  const { sessionId, messageIndex, reason } = req.body;
  const userId = req.user._id;
  
  logger.security('AI response reported', {
    userId: userId.toString(),
    sessionId,
    messageIndex,
    reason
  });
  
  // TODO: Add to review queue for moderators
  
  res.status(200).json({
    status: 'success',
    message: 'Report submitted. Thank you for helping us improve.'
  });
});

/**
 * Get chat statistics for user
 * GET /api/chat/stats
 */
export const getChatStats = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const userToken = createAnonymizedToken(userId.toString());
  
  // Aggregate statistics from MongoDB
  const stats = await Chat.aggregate([
    {
      $match: {
        userToken,
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalMessages: { $sum: { $size: '$messages' } },
        avgMessagesPerSession: { $avg: { $size: '$messages' } },
        lastActivity: { $max: '$updatedAt' }
      }
    }
  ]);
  
  // Risk level distribution
  const riskDistribution = await Chat.aggregate([
    {
      $match: {
        userToken,
        isActive: true
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
      stats: stats[0] || {
        totalSessions: 0,
        totalMessages: 0,
        avgMessagesPerSession: 0,
        lastActivity: null
      },
      riskDistribution
    }
  });
});