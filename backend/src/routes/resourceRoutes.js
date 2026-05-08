// src/routes/resourceRoutes.js - Resource API Routes
import express from 'express';
import * as resourceController from '../controllers/resourceController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validateResource, validateMongoId } from '../middleware/validationMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';
import { cacheResponse, invalidateCache } from '../utils/cache.js';

const router = express.Router();

router.get('/', optionalAuth, cacheResponse('resources', 180), resourceController.getAllResources);
router.get('/my-uploads', protect, restrictTo('admin', 'counselor'), cacheResponse('resources', 60), resourceController.getMyResources);
router.get('/admin/all', protect, restrictTo('admin'), cacheResponse('resources', 60), resourceController.getAllResourcesAdmin);
router.get('/featured', cacheResponse('resources', 300), resourceController.getFeaturedResources);
router.get('/trending', cacheResponse('resources', 180), resourceController.getTrendingResources);
router.get('/category/:category', optionalAuth, cacheResponse('resources', 180), resourceController.getResourcesByCategory);
router.get('/:id', optionalAuth, validateMongoId('id'), cacheResponse('resources', 180), resourceController.getResource);

router.post('/', protect, restrictTo('admin', 'counselor'), uploadLimiter, validateResource, invalidateCache(['resources', 'admin']), resourceController.createResource);
// Admin: Fix all unpublished resources (temp fix)
router.patch('/fix-unpublished', protect, restrictTo('admin', 'counselor'), invalidateCache(['resources', 'admin']), resourceController.fixUnpublishedResources);
router.patch('/:id', protect, restrictTo('admin', 'counselor'), validateMongoId('id'), invalidateCache(['resources', 'admin']), resourceController.updateResource);
router.delete('/:id', protect, restrictTo('admin', 'counselor'), validateMongoId('id'), invalidateCache(['resources', 'admin']), resourceController.deleteResource);
router.patch('/:id/publish', protect, restrictTo('admin'), validateMongoId('id'), invalidateCache(['resources', 'admin']), resourceController.publishResource);
router.patch('/:id/verify', protect, restrictTo('admin', 'counselor'), validateMongoId('id'), invalidateCache(['resources', 'admin']), resourceController.verifyResource);
router.post('/:id/like', protect, validateMongoId('id'), invalidateCache(['resources']), resourceController.toggleLike);
router.post('/:id/rate', protect, validateMongoId('id'), invalidateCache(['resources']), resourceController.rateResource);

export default router;

