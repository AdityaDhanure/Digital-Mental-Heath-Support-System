// src/controllers/authController.js - Authentication Business Logic

import User from '../models/User.js';
import { generateTokenPair, verifyRefreshToken, generateEmailVerificationToken, generatePasswordResetToken } from '../utils/tokenGenerator.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import logger from '../utils/logger.js';
import { createHash } from 'crypto';
import * as emailService from '../services/emailService.js';

export const register = catchAsync(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    gender,
    // Student-specific
    studentId,
    department,
    year,
    // Counselor-specific
    specialization,
    address
  } = req.body;

  // Check if user already exists
  const existingEmail = await User.findOne({ email });

  // Create user data object
  const userData = {
    name: role === 'counselor' && !name.startsWith('Dr. ')
      ? `Dr. ${name}`
      : name,
    email,
    password,
    role: role || 'student',
    authProvider: 'local',
    phone,
    gender
  };

  // Add role-specific fields
  if (userData.role === 'student') {
    userData.studentProfile = {
      studentId,
      department,
      year
    };
  } else if (userData.role === 'counselor') {
    userData.counselorProfile = {
      specialization: specialization || []
    };
    // Add address for counselors
    if (address) {
      userData.address = {
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode
      };
    }
  } else if (userData.role === 'admin' || userData.email == existingEmail) {
    return res.status(400).json({
      status: "error",
      message: "Admin already exists! Please login as Admin."
    })
  }

  // return for existing email
  if (existingEmail) {
    return res.status(400).json({
      status: 'error',
      message: 'Email already registered'
    });
  }

  // Create new user
  const user = await User.create(userData);

  // Generate email verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const tokens = generateTokenPair(user);

  logger.audit('User registered', {
    userId: user._id,
    email: user.email,
    role: user.role
  });

  // Return user data without sensitive fields
  const registeredUserData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    gender: user.gender,
    isEmailVerified: user.isEmailVerified,
    studentProfile: user.studentProfile,
    counselorProfile: user.counselorProfile,
    address: user.address,
    createdAt: user.createdAt
  };

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully. Please verify your email.',
    data: {
      user: registeredUserData,
      tokens
    }
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists with password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    logger.security('Login attempt with non-existent email', { email });
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    logger.security('Login attempt on deactivated account', {
      userId: user._id,
      email
    });
    return res.status(401).json({
      status: 'error',
      message: 'Your account has been deactivated. Please contact support.',
      code: 'ACCOUNT_DEACTIVATED'
    });
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    logger.security('Failed login attempt', {
      userId: user._id,
      email
    });
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const tokens = generateTokenPair(user);

  logger.audit('User logged in', {
    userId: user._id,
    email: user.email,
    role: user.role
  });

  // Return complete user data without sensitive fields
  const loggedInUserData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    studentProfile: user.studentProfile,
    counselorProfile: user.counselorProfile,
    address: user.address,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt
  };

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: loggedInUserData,
      tokens
    }
  });
});

export const logout = catchAsync(async (req, res) => {
  logger.audit('User logged out', {
    userId: req.user._id,
    email: req.user.email
  });

  // In production, add refresh token to blacklist
  // await addToBlacklist(req.body.refreshToken);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      status: 'error',
      message: 'Refresh token is required'
    });
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Check if user still exists
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token'
    });
  }

  // Generate new token pair
  const tokens = generateTokenPair(user);

  logger.audit('Token refreshed', { userId: user._id });

  res.status(200).json({
    status: 'success',
    data: { tokens }
  });
});

export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;

  // Hash token to compare with database
  const hashedToken = createHash('sha256')
    .update(token)
    .digest('hex');

  console.log("HASHED TOKEN GENERATED: ", hashedToken)          // It will not print because token is generated by not set to the field

  // Find user with valid token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid or expired verification token'
    });
  }

  // Update user
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  logger.audit('Email verified', { userId: user._id, email: user.email });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

// ─── POST /auth/send-verification-otp ────────────────────────────────────────
export const sendVerificationOtp = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.isEmailVerified) {
    return res.status(400).json({
      status: 'error',
      message: 'Email is already verified'
    });
  }

  const otp = user.createEmailOtp();
  await user.save({ validateBeforeSave: false });

  try {
    await emailService.sendVerificationEmail(user.email, user.name, otp);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to send verification email. Please try again later.'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Verification OTP sent to your email'
  });
});

// ─── POST /auth/verify-email-otp ─────────────────────────────────────────────
export const verifyEmailOtp = catchAsync(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide the OTP'
    });
  }

  const hashedOtp = createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    _id: req.user._id,
    emailOtp: hashedOtp,
    emailOtpExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid or expired OTP'
    });
  }

  user.isEmailVerified = true;
  user.emailOtp = undefined;
  user.emailOtpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  logger.audit('Email verified via OTP', { userId: user._id, email: user.email });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully',
    data: { 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        isEmailVerified: user.isEmailVerified,
        studentProfile: user.studentProfile,
        counselorProfile: user.counselorProfile,
        address: user.address,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    }
  });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists
    return res.status(200).json({
      status: 'success',
      message: 'If your email is registered, you will receive a password reset link.'
    });
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Send reset email
  // await sendPasswordResetEmail(user.email, resetToken);

  logger.security('Password reset requested', { userId: user._id, email });

  res.status(200).json({
    status: 'success',
    message: 'If your email is registered, you will receive a password reset link.'
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token
  const hashedToken = createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }).select('+password');

  if (!user) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid or expired reset token'
    });
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Generate new tokens
  const tokens = generateTokenPair(user);

  logger.security('Password reset completed', { userId: user._id, email: user.email });

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully',
    data: { tokens }
  });
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isCorrect = await user.comparePassword(currentPassword);

  if (!isCorrect) {
    return res.status(401).json({
      status: 'error',
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new tokens
  const tokens = generateTokenPair(user);

  logger.security('Password changed', { userId: user._id, email: user.email });

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
    data: { tokens }
  });
});

export const getMe = catchAsync(async (req, res) => {
  // Explicitly fetch all user fields except password
  const user = await User.findById(req.user._id)
    .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
    .lean(); // Use lean() for better performance since we're just reading

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const updateMe = catchAsync(async (req, res) => {
  const {
    // Basic fields
    name,
    phone,
    dateOfBirth,
    gender,
    languagePreference,
    language,
    theme,
    timezone,
    profilePicture,
    languagesKnown,

    // Student specific
    enrollmentNumber,
    department,
    year,
    course,

    // Counselor specific
    specialization,
    licenseNumber,
    experience,
    bio,

    // Address
    address,
    city,
    state,
    pincode,

    // Notification preferences
    notificationPreferences,

    // Privacy settings
    privacySettings
  } = req.body;

  // Enforce email lock
  if (req.body.email && req.user.isEmailVerified) {
    return res.status(400).json({
      status: 'error',
      message: 'Email cannot be changed once verified'
    });
  }

  // Don't allow password update here
  if (req.body.password) {
    return res.status(400).json({
      status: 'error',
      message: 'Use /change-password to update password'
    });
  }

  // Build updates object
  const updates = {};

  // Basic fields
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
  if (gender) updates.gender = gender;
  if (languagePreference) updates.languagePreference = languagePreference;
  if (language) updates.language = language;
  if (theme) updates.theme = theme;
  if (timezone) updates.timezone = timezone;
  if (profilePicture) updates.profilePicture = profilePicture;
  if (languagesKnown !== undefined) updates.languagesKnown = languagesKnown;

  // Role-specific updates
  const user = await User.findById(req.user._id);

  if (user.role === 'student') {
    if (enrollmentNumber !== undefined) updates['studentProfile.enrollmentNumber'] = enrollmentNumber;
    if (department !== undefined) updates['studentProfile.department'] = department;
    if (year !== undefined) updates['studentProfile.year'] = year;
    if (course !== undefined) updates['studentProfile.course'] = course;
  }

  if (user.role === 'counselor') {
    if (specialization !== undefined) updates['counselorProfile.specialization'] = specialization;
    if (licenseNumber !== undefined) updates['counselorProfile.licenseNumber'] = licenseNumber;
    if (experience !== undefined) updates['counselorProfile.experience'] = experience;
    if (bio !== undefined) updates['counselorProfile.bio'] = bio;
  }

  // Address updates
  if (address !== undefined) updates['address.street'] = address;
  if (city !== undefined) updates['address.city'] = city;
  if (state !== undefined) updates['address.state'] = state;
  if (pincode !== undefined) updates['address.pincode'] = pincode;

  // Notification preferences
  if (notificationPreferences) {
    updates.notificationPreferences = {
      ...user.notificationPreferences,
      ...notificationPreferences
    };
  }

  // Privacy settings
  if (privacySettings) {
    updates.privacySettings = {
      ...user.privacySettings,
      ...privacySettings
    };
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  logger.audit('Profile updated', {
    userId: updatedUser._id,
    fieldsUpdated: Object.keys(updates)
  });

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { user: updatedUser }
  });
});

export const deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  logger.security('Account deactivated', {
    userId: req.user._id,
    email: req.user.email
  });

  res.status(200).json({
    status: 'success',
    message: 'Account deactivated successfully'
  });
});

