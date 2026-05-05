// src/routes/authRoutes.js - Authentication API Routes

import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegistration, validateLogin } from '../middleware/validationMiddleware.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', authLimiter, validateRegistration, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/logout', protect, authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/send-verification-otp', protect, authController.sendVerificationOtp);
router.post('/verify-email-otp', protect, authController.verifyEmailOtp);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/change-password', protect, authController.changePassword);
router.get('/me', protect, authController.getMe);
router.patch('/me', protect, authController.updateMe);
router.delete('/me', protect, authController.deleteMe);


export default router;