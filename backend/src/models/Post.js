// src/models/Post.js - Peer Support Community Post Schema

import { Schema, model } from 'mongoose';
const postSchema = new Schema({
  // Author information
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Anonymity control
  isAnonymous: {
    type: Boolean,
    default: false
  },

  anonymousAlias: {
    type: String,
    default: function () {
      return `Anonymous${Math.floor(Math.random() * 10000)}`;
    }
  },

  // Post content
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: 200
  },

  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: 5000
  },

  // Category
  category: {
    type: String,
    enum: [
      'general-support',
      'academic-stress',
      'anxiety',
      'depression',
      'relationships',
      'self-care',
      'success-stories',
      'resources',
      'questions',
      'other'
    ],
    default: 'general-support',
    index: true
  },

  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  // Media attachments (optional)
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document']
    },
    url: String,
    filename: String
  }],

  // Engagement metrics
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    replyCount: {
      type: Number,
      default: 0
    }
  },

  // User interactions
  upvotedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  downvotedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Replies/Comments
  replies: [{
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    anonymousAlias: String,
    content: {
      type: String,
      required: true,
      maxlength: 2000
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    upvotes: {
      type: Number,
      default: 0
    },
    upvotedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    flagged: {
      type: Boolean,
      default: false
    },
    moderatorApproved: {
      type: Boolean,
      default: true
    }
  }],

  // Moderation
  moderation: {
    flagged: {
      type: Boolean,
      default: false
    },
    flagCount: {
      type: Number,
      default: 0
    },
    flaggedBy: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    moderatorReviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    moderatorNotes: String,
    approved: {
      type: Boolean,
      default: true
    },
    removed: {
      type: Boolean,
      default: false
    },
    removalReason: String
  },

  // Content safety
  contentSafety: {
    scanned: {
      type: Boolean,
      default: false
    },
    safetyScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    flaggedKeywords: [String],
    requiresReview: {
      type: Boolean,
      default: false
    }
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'removed'],
    default: 'published',
    index: true
  },

  isPinned: {
    type: Boolean,
    default: false
  },

  isLocked: {
    type: Boolean,
    default: false
  },

  publishedAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, status: 1, createdAt: -1 });
postSchema.index({ isPinned: -1, createdAt: -1 });
postSchema.index({ 'moderation.flagged': 1, 'moderation.moderatorReviewed': 1 });

// Text search index
postSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

// Virtual for vote score
postSchema.virtual('voteScore').get(function () {
  return this.metrics.upvotes - this.metrics.downvotes;
});

// Static method: Get trending posts
postSchema.statics.getTrendingPosts = async function (limit = 10) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return await this.find({
    status: 'published',
    'moderation.approved': true,
    'moderation.removed': false,
    'metrics.upvotes': { $gt: 0 }, // Must have at least 1 like to be trending
    createdAt: { $gte: oneDayAgo }
  })
    // Priority order: likes (upvotes) > replies > views
    .sort({
      'metrics.upvotes': -1,
      'metrics.replyCount': -1,
      'metrics.views': -1
    })
    .limit(limit)
    .populate('author', 'name profilePicture')
    .select('-upvotedBy -downvotedBy');
};

// Instance method: Toggle upvote
postSchema.methods.toggleUpvote = async function (userId) {
  const upvoteIndex = this.upvotedBy.indexOf(userId);
  const downvoteIndex = this.downvotedBy.indexOf(userId);

  // Remove downvote if exists
  if (downvoteIndex > -1) {
    this.downvotedBy.splice(downvoteIndex, 1);
    this.metrics.downvotes -= 1;
  }

  // Toggle upvote
  if (upvoteIndex > -1) {
    this.upvotedBy.splice(upvoteIndex, 1);
    this.metrics.upvotes -= 1;
  } else {
    this.upvotedBy.push(userId);
    this.metrics.upvotes += 1;
  }

  return await this.save();
};

// Instance method: Toggle downvote
postSchema.methods.toggleDownvote = async function (userId) {
  const upvoteIndex = this.upvotedBy.indexOf(userId);
  const downvoteIndex = this.downvotedBy.indexOf(userId);

  // Remove upvote if exists
  if (upvoteIndex > -1) {
    this.upvotedBy.splice(upvoteIndex, 1);
    this.metrics.upvotes -= 1;
  }

  // Toggle downvote
  if (downvoteIndex > -1) {
    this.downvotedBy.splice(downvoteIndex, 1);
    this.metrics.downvotes -= 1;
  } else {
    this.downvotedBy.push(userId);
    this.metrics.downvotes += 1;
  }

  return await this.save();
};

// Instance method: Add reply
postSchema.methods.addReply = async function (userId, content, isAnonymous = false) {
  const reply = {
    author: userId,
    content,
    isAnonymous,
    anonymousAlias: isAnonymous ? `Anonymous${Math.floor(Math.random() * 10000)}` : null
  };

  this.replies.push(reply);
  this.metrics.replyCount += 1;

  return await this.save();
};

// Instance method: Flag post
postSchema.methods.flag = async function (userId, reason) {
  this.moderation.flaggedBy.push({ user: userId, reason });
  this.moderation.flagCount += 1;
  this.moderation.flagged = true;

  return await this.save();
};

// Instance method: Moderate post
postSchema.methods.moderate = async function (moderatorId, approved, notes) {
  this.moderation.moderatorReviewed = true;
  this.moderation.reviewedBy = moderatorId;
  this.moderation.reviewedAt = new Date();
  this.moderation.moderatorNotes = notes;
  this.moderation.approved = approved;

  if (!approved) {
    this.moderation.removed = true;
    this.status = 'removed';
  }

  return await this.save();
};

// Instance method: Increment views
postSchema.methods.incrementViews = async function () {
  this.metrics.views += 1;
  return await this.save();
};

// Pre-save middleware: Anonymize if needed
postSchema.pre('save', function (next) {
  if (this.isAnonymous && !this.anonymousAlias) {
    this.anonymousAlias = `Anonymous${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

export default model('Post', postSchema);