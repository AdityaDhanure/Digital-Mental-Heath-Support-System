// src/routes/communityRoutes.js - Community API Routes
import express from 'express';
import * as communityController from '../controllers/communityController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { isModerator } from '../middleware/roleMiddleware.js';
import { validatePost, validateReply, validateMongoId } from '../middleware/validationMiddleware.js';
import { postLimiter } from '../middleware/rateLimitMiddleware.js';
import { cacheResponse, invalidateCache } from '../utils/cache.js';

const router = express.Router();

router.get('/posts', optionalAuth, cacheResponse('community', 90), communityController.getAllPosts);
router.get('/posts/admin/all', protect, isModerator, cacheResponse('community', 45), communityController.getAllPostsAdmin);
router.get('/posts/trending', cacheResponse('community', 120), communityController.getTrendingPosts);
router.get('/posts/category/:category', optionalAuth, cacheResponse('community', 90), communityController.getPostsByCategory);
router.get('/my-posts', protect, cacheResponse('community', 45), communityController.getMyPosts);
router.get('/flagged', protect, isModerator, cacheResponse('community', 30), communityController.getFlaggedPosts);
router.get('/posts/:id', optionalAuth, validateMongoId('id'), cacheResponse('community', 90), communityController.getPost);

router.post('/posts', protect, postLimiter, validatePost, invalidateCache(['community', 'admin']), communityController.createPost);
router.patch('/posts/:id', protect, validateMongoId('id'), invalidateCache(['community', 'admin']), communityController.updatePost);
router.delete('/posts/:id', protect, validateMongoId('id'), invalidateCache(['community', 'admin']), communityController.deletePost);
router.post('/posts/:id/vote', protect, validateMongoId('id'), invalidateCache(['community']), communityController.votePost);
router.post('/posts/:id/replies', protect, validateMongoId('id'), validateReply, invalidateCache(['community']), communityController.addReply);
router.post('/posts/:id/flag', protect, validateMongoId('id'), invalidateCache(['community', 'admin']), communityController.flagPost);
router.patch('/posts/:id/moderate', protect, isModerator, validateMongoId('id'), invalidateCache(['community', 'admin']), communityController.moderatePost);

export default router;
