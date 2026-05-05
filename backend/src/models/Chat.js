// src/models/Chat.js - Chat History Schema with Privacy-First Design

import { Schema, model } from 'mongoose';
import crypto from 'crypto';
import { createAnonymizedToken } from '../utils/encryption.js';

const chatSchema = new Schema({
  // Tokenized user reference (NOT direct user ID for privacy)
  userToken: {
    type: String,
    required: true,
    index: true
  },
  
  // Session identifier for grouping conversations
  sessionId: {
    type: String,
    required: true,
    index: true
  },

  // User-defined or auto-generated chat title
  title: {
    type: String,
    default: null,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  // Message content
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    // Encrypted flag for sensitive content
    isEncrypted: {
      type: Boolean,
      default: false
    }
  }],
  
  // AI Processing metadata
  aiMetadata: {
    modelUsed: {
      type: String,
      default: 'deepseek-r1'
    },
    ragContextUsed: {
      type: Boolean,
      default: false
    },
    retrievedDocuments: [{
      documentId: String,
      relevanceScore: Number,
      title: String
    }],
    processingTime: {
      type: Number, // in milliseconds
      default: 0
    }
  },
  
  // Safety & Risk Assessment
  safetyCheck: {
    emotionalRiskScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    crisisKeywordsDetected: [{
      type: String
    }],
    flaggedForReview: {
      type: Boolean,
      default: false
    },
    counselorAlerted: {
      type: Boolean,
      default: false
    }
  },
  
  // Sentiment Analysis
  sentimentAnalysis: {
    overallSentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'mixed'],
      default: 'neutral'
    },
    emotionDetected: [{
      emotion: String,
      confidence: Number
    }],
    stressLevel: {
      type: String,
      enum: ['none', 'low', 'moderate', 'high', 'severe'],
      default: 'none'
    }
  },
  
  // Session status
  isActive: {
    type: Boolean,
    default: true
  },
  
  endedAt: {
    type: Date
  },
  
  // Privacy controls
  anonymized: {
    type: Boolean,
    default: false
  },
  
  // Auto-deletion timestamp (for privacy compliance)
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
  
}, {
  timestamps: true
});

// Indexes for performance
chatSchema.index({ userToken: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1 });
chatSchema.index({ 'safetyCheck.riskLevel': 1 });
chatSchema.index({ expiresAt: 1 });

// Static method: Create tokenized chat session
chatSchema.statics.createSession = function(userId) {
  // Import the consistent token generator
  // Use consistent token generation
  const userToken = createAnonymizedToken(userId.toString());
  
  // Generate unique session ID
  const sessionId = crypto.randomBytes(16).toString('hex');
  
  return { userToken, sessionId };
};

// Static method: Rename a chat session
chatSchema.statics.renameSession = function(userToken, sessionId, title) {
  return this.updateMany(
    { userToken, sessionId },
    { $set: { title } }
  );
};

// Instance method: Add message to chat
chatSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
    isEncrypted: metadata.isEncrypted || false
  });
  
  return this.save();
};

// Instance method: Update safety assessment
chatSchema.methods.updateSafetyCheck = function(riskData) {
  this.safetyCheck = {
    ...this.safetyCheck,
    ...riskData
  };
  
  return this.save();
};

// Instance method: End session
chatSchema.methods.endSession = function() {
  this.isActive = false;
  this.endedAt = new Date();
  
  return this.save();
};

// Pre-save middleware: Set expiration for privacy
chatSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Auto-delete after 90 days (configurable based on policy)
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }
  next();
});

export default model('Chat', chatSchema);