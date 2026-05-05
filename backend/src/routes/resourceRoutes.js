// src/routes/resourceRoutes.js - Resource API Routes
import express from 'express';
import * as resourceController from '../controllers/resourceController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validateResource, validateMongoId } from '../middleware/validationMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, resourceController.getAllResources);
router.get('/my-uploads', protect, restrictTo('admin', 'counselor'), resourceController.getMyResources);
router.get('/admin/all', protect, restrictTo('admin'), resourceController.getAllResourcesAdmin);
router.get('/featured', resourceController.getFeaturedResources);
router.get('/trending', resourceController.getTrendingResources);
router.get('/category/:category', optionalAuth, resourceController.getResourcesByCategory);
router.get('/:id', optionalAuth, validateMongoId('id'), resourceController.getResource);

router.post('/', protect, restrictTo('admin', 'counselor'), uploadLimiter, validateResource, resourceController.createResource);
router.patch('/:id', protect, restrictTo('admin', 'counselor'), validateMongoId('id'), resourceController.updateResource);
router.delete('/:id', protect, restrictTo('admin', 'counselor'), validateMongoId('id'), resourceController.deleteResource);
router.patch('/:id/publish', protect, restrictTo('admin'), validateMongoId('id'), resourceController.publishResource);
router.patch('/:id/verify', protect, restrictTo('admin', 'counselor'), validateMongoId('id'), resourceController.verifyResource);
router.post('/:id/like', protect, validateMongoId('id'), resourceController.toggleLike);
router.post('/:id/rate', protect, validateMongoId('id'), resourceController.rateResource);

// Admin: Fix all unpublished resources (temp fix)
router.patch('/fix-unpublished', protect, restrictTo('admin', 'counselor'), resourceController.fixUnpublishedResources);

export default router;

