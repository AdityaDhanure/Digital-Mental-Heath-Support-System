// src/models/Resource.js - Psychoeducational Resource Hub Schema

import { Schema, model } from 'mongoose';

const resourceSchema = new Schema({
  // Basic information
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: 200,
    index: true
  },
  
  description: {
    type: String,
    required: [true, 'Resource description is required'],
    trim: true,
    maxlength: 1000
  },
  
  // Content type
  type: {
    type: String,
    enum: ['article', 'video', 'audio', 'pdf', 'exercise', 'guide', 'infographic'],
    required: true,
    index: true
  },
  
  // Category classification
  category: {
    type: String,
    enum: [
      'anxiety',
      'therapy',
      'depression', 
      'stress',
      'sleep',
      'mindfulness',
      'coping-strategies',
      'self-care',
      'academic-pressure',
      'relationships',
      'crisis-management',
      'general-wellness'
    ],
    required: true,
    index: true
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Content storage
  content: {
    // For text-based resources
    text: {
      type: String,
      maxlength: 50000
    },
    
    // For media resources (Cloudinary URLs)
    mediaUrl: {
      type: String,
      trim: true
    },
    
    // Thumbnail for videos/images
    thumbnailUrl: {
      type: String,
      trim: true
    },
    
    // Duration for audio/video (in seconds)
    duration: {
      type: Number,
      min: 0
    },
    
    // File size (in bytes)
    fileSize: {
      type: Number,
      min: 0
    }
  },
  
  // Language support
  language: {
    type: String,
    enum: ['english', 'hindi', 'marathi', 'multilingual'],
    default: 'english',
    index: true
  },
  
  // Translations
  translations: [{
    language: {
      type: String,
      enum: ['english', 'hindi', 'marathi']
    },
    title: String,
    description: String,
    content: String
  }],
  
  // Authorship and verification
  author: {
    name: {
      type: String,
      trim: true
    },
    credentials: {
      type: String,
      trim: true
    },
    organization: {
      type: String,
      trim: true
    }
  },
  
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  verified: {
    type: Boolean,
    default: false
  },
  
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  verifiedAt: {
    type: Date
  },
  
  // Target audience
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'counselors', 'faculty'],
    default: 'all'
  },
  
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  // Engagement metrics
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  
  // User interactions
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // External source
  externalSource: {
    name: String,
    url: String,
    licenseType: String
  },
  
  // Visibility and status
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isArchived: {
    type: Boolean,
    default: false
  },
  
  publishedAt: {
    type: Date
  },
  
  // Search optimization
  searchKeywords: [{
    type: String,
    lowercase: true,
    trim: true
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for full-text search
resourceSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  searchKeywords: 'text'
});

// Compound indexes
resourceSchema.index({ category: 1, language: 1, isPublished: 1 });
resourceSchema.index({ type: 1, isPublished: 1 });
resourceSchema.index({ 'metrics.views': -1 });

// Virtual for formatted duration
resourceSchema.virtual('formattedDuration').get(function() {
  if (!this.content.duration) return null;
  
  const minutes = Math.floor(this.content.duration / 60);
  const seconds = this.content.duration % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Static method: Increment view count
resourceSchema.statics.incrementViews = async function(resourceId) {
  return await this.findByIdAndUpdate(
    resourceId,
    { $inc: { 'metrics.views': 1 } },
    { new: true }
  );
};

// Static method: Search resources
resourceSchema.statics.searchResources = async function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    isPublished: true,
    ...filters
  };
  
  return await this.find(searchQuery)
    .select('-likedBy')
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);
};

// Instance method: Toggle like
resourceSchema.methods.toggleLike = async function(userId) {
  const index = this.likedBy.indexOf(userId);
  
  if (index > -1) {
    // Unlike
    this.likedBy.splice(index, 1);
    this.metrics.likes -= 1;
  } else {
    // Like
    this.likedBy.push(userId);
    this.metrics.likes += 1;
  }
  
  return await this.save();
};

// Instance method: Add rating
resourceSchema.methods.addRating = async function(rating) {
  const currentTotal = this.metrics.averageRating * this.metrics.totalRatings;
  this.metrics.totalRatings += 1;
  this.metrics.averageRating = (currentTotal + rating) / this.metrics.totalRatings;
  
  return await this.save();
};

// Instance method: Publish resource
resourceSchema.methods.publish = function() {
  this.isPublished = true;
  this.publishedAt = new Date();
  return this.save();
};

// Pre-save middleware: Generate search keywords
resourceSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('description') || this.isModified('tags')) {
    const keywords = [
      ...this.title.toLowerCase().split(' '),
      ...this.description.toLowerCase().split(' '),
      ...this.tags
    ];
    
    this.searchKeywords = [...new Set(keywords)].filter(k => k.length > 3);
  }
  next();
});

export default model('Resource', resourceSchema);