
// src/routes/chatRoutes.js - Chat API Routes
import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateChatMessage } from '../middleware/validationMiddleware.js';
import { chatLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/message', protect, chatLimiter, validateChatMessage, chatController.sendMessage);
router.get('/history', protect, chatController.getChatHistory);
router.get('/session/:sessionId', protect, chatController.getChatSession);
router.patch('/session/:sessionId/rename', protect, chatController.renameSession);
router.post('/session/:sessionId/end', protect, chatController.endChatSession);
router.delete('/history', protect, chatController.deleteChatHistory);
router.get('/recommendations', protect, chatController.getRecommendations);
router.get('/stats', protect, chatController.getChatStats);
router.post('/report', protect, chatController.reportResponse);

export default router;