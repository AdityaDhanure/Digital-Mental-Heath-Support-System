// src/routes/communityRoutes.js - Community API Routes
import express from 'express';
import * as communityController from '../controllers/communityController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { isModerator } from '../middleware/roleMiddleware.js';
import { validatePost, validateReply, validateMongoId } from '../middleware/validationMiddleware.js';
import { postLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.get('/posts', optionalAuth, communityController.getAllPosts);
router.get('/posts/admin/all', protect, isModerator, communityController.getAllPostsAdmin);
router.get('/posts/trending', communityController.getTrendingPosts);
router.get('/posts/category/:category', optionalAuth, communityController.getPostsByCategory);
router.get('/my-posts', protect, communityController.getMyPosts);
router.get('/flagged', protect, isModerator, communityController.getFlaggedPosts);
router.get('/posts/:id', optionalAuth, validateMongoId('id'), communityController.getPost);

router.post('/posts', protect, postLimiter, validatePost, communityController.createPost);
router.patch('/posts/:id', protect, validateMongoId('id'), communityController.updatePost);
router.delete('/posts/:id', protect, validateMongoId('id'), communityController.deletePost);
router.post('/posts/:id/vote', protect, validateMongoId('id'), communityController.votePost);
router.post('/posts/:id/replies', protect, validateMongoId('id'), validateReply, communityController.addReply);
router.post('/posts/:id/flag', protect, validateMongoId('id'), communityController.flagPost);
router.patch('/posts/:id/moderate', protect, isModerator, validateMongoId('id'), communityController.moderatePost);

export default router;