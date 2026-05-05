// src/controllers/resourceController.js - Resource Hub Business Logic

import Resource from '../models/Resource.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import logger from '../utils/logger.js';

export const createResource = catchAsync(async (req, res) => {
  const {
    title,
    description,
    type,
    category,
    tags,
    content,
    language,
    targetAudience,
    difficulty,
    author,
    externalSource,
    searchKeywords
  } = req.body;
  
  const resource = await Resource.create({
    title,
    description,
    type,
    category,
    tags: tags || [],
    content: {
      text: content?.text,
      mediaUrl: content?.mediaUrl,
      thumbnailUrl: content?.thumbnailUrl,
      duration: content?.duration,
      fileSize: content?.fileSize
    },
    language: language || 'english',
    targetAudience: targetAudience || 'all',
    difficulty: difficulty || 'beginner',
    author,
    externalSource,
    searchKeywords: searchKeywords || tags || [],
    uploadedBy: req.user._id,
    isPublished: true // Auto-publish for both admins and counselors
  });
  
  logger.audit('Resource created', {
    resourceId: resource._id,
    title: resource.title,
    uploadedBy: req.user._id
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Resource created successfully',
    data: { resource }
  });
});

export const getAllResources = catchAsync(async (req, res) => {
  const {
    category,
    type,
    language,
    difficulty,
    search,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;
  
  // Build query
  const query = {
    isPublished: true,
    isArchived: false
  };
  
  if (category) query.category = category;
  if (type) query.type = type;
  if (language) query.language = language;
  if (difficulty) query.difficulty = difficulty;
  
  let resources;
  
  // Handle search
  if (search) {
    resources = await Resource.searchResources(search, query);
  } else {
    resources = await Resource.find(query)
      .populate('uploadedBy', 'name role')
      .select('-likedBy')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
  }
  
  const count = await Resource.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: {
      resources,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    }
  });
});

// Get resources uploaded by current user (for My Uploads)
export const getMyResources = catchAsync(async (req, res) => {
  const {
    category,
    type,
    page = 1,
    limit = 50,
    sort = '-createdAt'
  } = req.query;
  
  const query = {
    uploadedBy: req.user._id,
    isArchived: false
  };
  
  if (category) query.category = category;
  if (type) query.type = type;
  
  const resources = await Resource.find(query)
    .populate('uploadedBy', 'name role')
    .select('-likedBy')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const count = await Resource.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: {
      resources,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    }
  });
});

// Get all resources for admin (including unpublished)
export const getAllResourcesAdmin = catchAsync(async (req, res) => {
  const {
    category,
    type,
    status,
    search,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;
  
  const query = {
    isArchived: false
  };
  
  if (category) query.category = category;
  if (type) query.type = type;
  if (status === 'published') query.isPublished = true;
  if (status === 'unpublished') query.isPublished = false;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  const resources = await Resource.find(query)
    .populate('uploadedBy', 'name role')
    .select('-likedBy')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const count = await Resource.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: {
      resources,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    }
  });
});

export const getResource = catchAsync(async (req, res) => {
  const resourceId = req.params.id;
  
  const resource = await Resource.findById(resourceId)
    .populate('uploadedBy', 'name role')
    .populate('verifiedBy', 'name');
  
  if (!resource) {
    return res.status(404).json({
      status: 'error',
      message: 'Resource not found'
    });
  }
  
  // Check if published (unless admin/counselor)
  if (!resource.isPublished && 
      req.user?.role !== 'admin' && 
      req.user?.role !== 'counselor') {
    return res.status(403).json({
      status: 'error',
      message: 'Resource not available'
    });
  }
  
  // Increment view count
  await Resource.incrementViews(resourceId);
  
  res.status(200).json({
    status: 'success',
    data: { resource }
  });
});

export const updateResource = catchAsync(async (req, res) => {
  const resourceId = req.params.id;
  const updates = req.body;
  
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return res.status(404).json({
      status: 'error',
      message: 'Resource not found'
    });
  }
  
  // Check ownership
  if (resource.uploadedBy.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have permission to update this resource'
    });
  }
  
  // Update fields
  const allowedUpdates = [
    'title', 'description', 'content', 'tags', 'category',
    'type', 'language', 'targetAudience', 'difficulty'
  ];
  
  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      if (field === 'content') {
        resource.content = { ...resource.content, ...updates.content };
      } else {
        resource[field] = updates[field];
      }
    }
  });
  
  await resource.save();
  
  logger.audit('Resource updated', {
    resourceId,
    updatedBy: req.user._id
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Resource updated successfully',
    data: { resource }
  });
});

export const deleteResource = catchAsync(async (req, res) => {
  const resourceId = req.params.id;
  
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return res.status(404).json({
      status: 'error',
      message: 'Resource not found'
    });
  }
  
  // Check ownership
  if (resource.uploadedBy.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have permission to delete this resource'
    });
  }
  
  // Soft delete (archive)
  resource.isArchived = true;
  resource.isPublished = false;
  await resource.save();
  
  logger.audit('Resource archived', {
    resourceId,
    deletedBy: req.user._id
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Resource deleted successfully'
  });
});

export const publishResource = catchAsync(async (req, res) => {
  const resourceId = req.params.id;
  
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return res.status(404).json({
      status: 'error',
      message: 'Resource not found'
    });
  }
  
  await resource.publish();
  
  logger.audit('Resource published', {
    resourceId,
    publishedBy: req.user._id
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Resource published successfully',
    data: { resource }
  });
});

export const verifyResource = catchAsync(async (req, res) => {
  const resourceId = req.params.id;
  
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return res.status(404).json({
      status: 'error',
      message: 'Resource not found'
    });
  }
  
  resource.verified = true;
  resource.verifiedBy = req.user._id;
  resource.verifiedAt = new Date();
  await resource.save();
  
  logger.audit('Resource verified', {
    resourceId,
    verifiedBy: req.user._id
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Resource verified successfully',
    data: { resource }
  });
});

export const toggleLike = catchAsync(async (req, res) => {
  const resourceId = req.params.id;
  const userId = req.user._id;
  
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return res.status(404).json({
      status: 'error',
      message: 'Resource not found'
    });
  }
  
  await resource.toggleLike(userId);
  
  const isLiked = resource.likedBy.includes(userId);
  
  res.status(200).json({
    status: 'success',
    message: isLiked ? 'Resource liked' : 'Resource unliked',
    data: {
      liked: isLiked,
      likeCount: resource.metrics.likes
    }
  });
});

export const rateResource = catchAsync(async (req, res) => {
  const resourceId = req.params.id;
  const { rating } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      status: 'error',
      message: 'Rating must be between 1 and 5'
    });
  }
  
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return res.status(404).json({
      status: 'error',
      message: 'Resource not found'
    });
  }
  
  await resource.addRating(rating);
  
  res.status(200).json({
    status: 'success',
    message: 'Rating submitted',
    data: {
      averageRating: resource.metrics.averageRating,
      totalRatings: resource.metrics.totalRatings
    }
  });
});

export const getFeaturedResources = catchAsync(async (req, res) => {
  const resources = await Resource.find({
    isPublished: true,
    verified: true,
    isArchived: false
  })
  .select('-likedBy')
  .sort({ 'metrics.views': -1, 'metrics.likes': -1 })
  .limit(10)
  .populate('uploadedBy', 'name role');
  
  res.status(200).json({
    status: 'success',
    data: { resources }
  });
});

export const getResourcesByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  const resources = await Resource.find({
    category,
    isPublished: true,
    isArchived: false
  })
  .select('-likedBy')
  .populate('uploadedBy', 'name role')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
  
  const count = await Resource.countDocuments({
    category,
    isPublished: true,
    isArchived: false
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      resources,
      category,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    }
  });
});

export const getTrendingResources = catchAsync(async (req, res) => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const resources = await Resource.find({
    isPublished: true,
    isArchived: false,
    createdAt: { $gte: oneDayAgo }
  })
  .select('-likedBy')
  .sort({ 'metrics.views': -1 })
  .limit(10)
  .populate('uploadedBy', 'name role');
  
  res.status(200).json({
    status: 'success',
    data: { resources }
  });
});

export const fixUnpublishedResources = catchAsync(async (req, res) => {
  const result = await Resource.updateMany(
    { isPublished: false },
    { $set: { isPublished: true } }
  );
  
  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} resources updated to published`,
    data: { modifiedCount: result.modifiedCount }
  });
});

