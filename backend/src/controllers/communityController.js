// src/controllers/communityController.js - Peer Support Community Logic

import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import logger from '../utils/logger.js';

export const createPost = catchAsync(async (req, res) => {
  const { title, content, category, tags, isAnonymous, attachments } = req.body;
  const userId = req.user._id;
  
  const post = await Post.create({
    author: userId,
    title,
    content,
    category: category || 'general-support',
    tags: tags || [],
    isAnonymous: isAnonymous || false,
    attachments: attachments || [],
    status: 'published'
  });
  
  logger.audit('Community post created', {
    postId: post._id,
    userId,
    isAnonymous
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Post created successfully',
    data: { post }
  });
});

export const getAllPosts = catchAsync(async (req, res) => {
  const {
    category,
    sort = '-createdAt',
    page = 1,
    limit = 20,
    search
  } = req.query;
  
  // Build query
  const query = {
    status: 'published',
    'moderation.removed': false,
    'moderation.approved': true
  };
  
  if (category) {
    query.category = category;
  }
  
  let posts;
  
  if (search) {
    posts = await Post.find({
      ...query,
      $text: { $search: search }
    })
    .populate({
      path: 'author',
      select: 'name profilePicture',
      match: { isAnonymous: false }
    })
    .select('-upvotedBy -downvotedBy -replies.upvotedBy')
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  } else {
    posts = await Post.find(query)
      .populate({
        path: 'author',
        select: 'name profilePicture'
      })
      .select('-upvotedBy -downvotedBy -replies.upvotedBy')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
  }
  
  // Hide author details for anonymous posts
  posts = posts.map(post => {
    const postObj = post.toObject();
    if (postObj.isAnonymous) {
      postObj.author = {
        name: postObj.anonymousAlias,
        isAnonymous: true
      };
    }
    return postObj;
  });
  
  const count = await Post.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: {
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    }
  });
});

export const getAllPostsAdmin = catchAsync(async (req, res) => {
  const {
    category,
    status,
    flagged,
    search,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;
  
  const query = {};
  
  if (category) query.category = category;
  if (status === 'published') query.status = 'published';
  if (status === 'draft') query.status = 'draft';
  if (status === 'removed') query['moderation.removed'] = true;
  if (flagged === 'true') query['moderation.flagged'] = true;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }
  
  const posts = await Post.find(query)
    .populate('author', 'name email role')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const count = await Post.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: {
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    }
  });
});

export const getPost = catchAsync(async (req, res) => {
  const postId = req.params.id;
  
  const post = await Post.findById(postId)
    .populate({
      path: 'author',
      select: 'name profilePicture role'
    })
    .populate({
      path: 'replies.author',
      select: 'name profilePicture'
    });
  
  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post not found'
    });
  }
  
  // Increment views
  await post.incrementViews();
  
  // Hide author details if anonymous
  const postObj = post.toObject();
  if (postObj.isAnonymous) {
    postObj.author = {
      name: postObj.anonymousAlias,
      isAnonymous: true
    };
  }
  
  // Hide reply author details if anonymous
  postObj.replies = postObj.replies.map(reply => {
    if (reply.isAnonymous) {
      reply.author = {
        name: reply.anonymousAlias,
        isAnonymous: true
      };
    }
    return reply;
  });
  
  res.status(200).json({
    status: 'success',
    data: { post: postObj }
  });
});

export const updatePost = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const { title, content, tags } = req.body;
  
  const post = await Post.findById(postId);
  
  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post not found'
    });
  }
  
  // Check ownership
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'You can only edit your own posts'
    });
  }
  
  // Update fields
  if (title) post.title = title;
  if (content) post.content = content;
  if (tags) post.tags = tags;
  
  await post.save();
  
  logger.audit('Post updated', { postId, userId: req.user._id });
  
  res.status(200).json({
    status: 'success',
    message: 'Post updated successfully',
    data: { post }
  });
});

export const deletePost = catchAsync(async (req, res) => {
  const postId = req.params.id;
  
  const post = await Post.findById(postId);
  
  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post not found'
    });
  }
  
  // Check ownership or moderator/admin
  if (post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'moderator' &&
      req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied'
    });
  }
  
  post.status = 'removed';
  post.moderation.removed = true;
  await post.save();
  
  logger.audit('Post deleted', { postId, deletedBy: req.user._id });
  
  res.status(200).json({
    status: 'success',
    message: 'Post deleted successfully'
  });
});

export const votePost = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const { voteType } = req.body; // 'upvote' or 'downvote'
  const userId = req.user._id;
  
  const post = await Post.findById(postId);
  
  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post not found'
    });
  }
  
  if (voteType === 'upvote') {
    await post.toggleUpvote(userId);
  } else if (voteType === 'downvote') {
    await post.toggleDownvote(userId);
  } else {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid vote type'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      upvotes: post.metrics.upvotes,
      downvotes: post.metrics.downvotes,
      voteScore: post.voteScore
    }
  });
});

export const addReply = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const { content, isAnonymous } = req.body;
  const userId = req.user._id;
  
  const post = await Post.findById(postId)
    .populate('author', 'name email');
  
  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post not found'
    });
  }
  
  await post.addReply(userId, content, isAnonymous || false);
  
  // Notify post author (if not replying to own post)
  if (post.author._id.toString() !== userId.toString() && !post.isAnonymous) {
    await Notification.createNotification({
      recipient: post.author._id,
      type: 'community_reply',
      title: 'New Reply on Your Post',
      message: `Someone replied to your post "${post.title}"`,
      priority: 'low',
      relatedEntity: {
        entityType: 'post',
        entityId: post._id
      },
      actionUrl: `/community/posts/${post._id}`,
      actionLabel: 'View Post'
    });
  }
  
  logger.audit('Reply added', { postId, userId });
  
  res.status(201).json({
    status: 'success',
    message: 'Reply added successfully',
    data: { post }
  });
});

export const flagPost = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const { reason } = req.body;
  const userId = req.user._id;
  
  const post = await Post.findById(postId);
  
  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post not found'
    });
  }
  
  await post.flag(userId, reason);
  
  logger.security('Post flagged', {
    postId,
    flaggedBy: userId,
    reason
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Post flagged for review. Thank you for helping keep our community safe.'
  });
});

export const moderatePost = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const { approved, notes } = req.body;
  const moderatorId = req.user._id;
  
  const post = await Post.findById(postId)
    .populate('author', 'name email');
  
  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post not found'
    });
  }
  
  await post.moderate(moderatorId, approved, notes);
  
  // Notify author if not approved
  if (!approved && post.author) {
    await Notification.createNotification({
      recipient: post.author._id,
      type: 'moderation_action',
      title: 'Post Removed',
      message: 'Your post has been removed by a moderator. Please review our community guidelines.',
      priority: 'medium',
      relatedEntity: {
        entityType: 'post',
        entityId: post._id
      }
    });
  }
  
  logger.audit('Post moderated', {
    postId,
    moderatorId,
    approved
  });
  
  res.status(200).json({
    status: 'success',
    message: approved ? 'Post approved' : 'Post removed',
    data: { post }
  });
});

export const getTrendingPosts = catchAsync(async (req, res) => {       // kdbkjsadksadbkjabdja djbe jdb ebd 
  const { limit = 10 } = req.query;
  
  const posts = await Post.getTrendingPosts(parseInt(limit));
  
  // Hide author details for anonymous posts
  const processedPosts = posts.map(post => {
    const postObj = post.toObject();
    if (postObj.isAnonymous) {
      postObj.author = {
        name: postObj.anonymousAlias,
        isAnonymous: true
      };
    }
    return postObj;
  });
  
  res.status(200).json({
    status: 'success',
    data: { posts: processedPosts }
  });
});

export const getMyPosts = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;
  
  const posts = await Post.find({
    author: userId,
    status: { $ne: 'removed' }
  })
  .select('-upvotedBy -downvotedBy')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
  
  const count = await Post.countDocuments({
    author: userId,
    status: { $ne: 'removed' }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    }
  });
});

export const getPostsByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  const posts = await Post.find({
    category,
    status: 'published',
    'moderation.removed': false,
    'moderation.approved': true
  })
  .populate('author', 'name profilePicture')
  .select('-upvotedBy -downvotedBy')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
  
  const count = await Post.countDocuments({
    category,
    status: 'published',
    'moderation.removed': false
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      posts,
      category,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    }
  });
});

export const getFlaggedPosts = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  const posts = await Post.find({
    'moderation.flagged': true,
    'moderation.moderatorReviewed': false
  })
  .populate('author', 'name email')
  .populate('moderation.flaggedBy.user', 'name')
  .sort({ 'moderation.flagCount': -1, createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
  
  const count = await Post.countDocuments({
    'moderation.flagged': true,
    'moderation.moderatorReviewed': false
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    }
  });
});

