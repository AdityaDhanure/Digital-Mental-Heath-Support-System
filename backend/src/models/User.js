// src/models/User.js - User Schema with Role-Based Access

import { Schema, model } from 'mongoose';
import { randomBytes, createHash } from 'crypto';

import pkg from 'bcryptjs';
const { hash, compare } = pkg;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function () {
      return this.authProvider === 'local';
    },
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'counselor', 'admin'],
    default: 'student'
  },
  authProvider: {
    type: String,
    enum: ['local', 'oauth', 'sso'],
    default: 'local'
  },
  profilePicture: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^(\+91[\s-]?)?[6-9]\d{9}$/, 'Please provide a valid Indian mobile number']
  },

  // ✅ NEW: Basic profile fields
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  languagesKnown: {
    type: [String],
    default: []
  },

  // Language & Preferences
  languagePreference: {
    type: String,
    enum: ['english', 'hindi', 'marathi'],
    default: 'english'
  },
  language: {
    type: String,
    enum: ['english', 'hindi', 'marathi'],
    default: 'english'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },

  // Student-specific fields
  // studentId: {
  //   type: String,
  //   sparse: true,
  //   unique: true
  // },
  // department: {
  //   type: String,
  //   trim: true
  // },
  // year: {
  //   type: Number,
  //   min: 1,
  //   max: 5
  // },

  // ✅ NEW: Structured Student Profile
  studentProfile: {
    studentId: {
      type: String,
      trim: true
    },
    enrollmentNumber: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      required: function () {
        return this.role === 'student';
      },
      enum: {
        values: ['CSE', 'ENTC', 'Mechanical', 'Civil', 'Electrical', 'IT'],
        message: 'Please select a valid department'
      },
      trim: true
    },
    year: {
      type: Number,
      required: function () {
        return this.role === 'student';
      },
      min: [1, 'Year must be between 1 and 4'],
      max: [4, 'Year must be between 1 and 4']
    },
    course: {
      type: String,
      trim: true
    }
  },

  // Counselor-specific fields
  // specialization: {
  //   type: [String],
  //   default: []
  // },
  // availability: {
  //   type: Map,
  //   of: [{
  //     start: String,
  //     end: String
  //   }],
  //   default: {}
  // },
  // maxAppointmentsPerDay: {
  //   type: Number,
  //   default: 8
  // },

  // ✅ NEW: Structured Counselor Profile
  counselorProfile: {
    availability: {
      type: Map,
      of: [{
        start: String,
        end: String
      }],
      default: {}
    },
    specialization: {
      type: [String],
      required: function () {
        return this.role === 'counselor';
      },
      validate: {
        validator: function (v) {
          if (this.role !== 'counselor') return true;
          return v && v.length > 0;
        },
        message: 'At least one specialization is required for counselors'
      },
      enum: {
        values: [
          'Anxiety & Stress Management',
          'Depression & Mood Disorders',
          'Academic Counseling',
          'Career Guidance',
          'Relationship & Family Counseling',
          'Trauma & PTSD',
          'Addiction & Substance Abuse',
          'General Mental Health'
        ],
        message: 'Please select valid specialization(s)'
      }
    },
    maxAppointmentsPerDay: {
      type: Number,
      default: 8
    },
    licenseNumber: {
      type: String,
      trim: true
    },
    experience: {
      type: Number,
      min: 0
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    }
  },

  // ✅ NEW: Address
  address: {
    street: {
      type: String,
      required: function () {
        return this.role === 'counselor';
      },
      trim: true
    },
    city: {
      type: String,
      required: function () {
        return this.role === 'counselor';
      },
      trim: true
    },
    state: {
      type: String,
      required: function () {
        return this.role === 'counselor';
      },
      trim: true
    },
    pincode: {
      type: String,
      required: function () {
        return this.role === 'counselor';
      },
      trim: true,
      match: [/^\d{6}$/, 'Please provide a valid 6-digit PIN code']
    }
  },

  // ✅ NEW: Notification Preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: false
    },
    bookingReminders: {
      type: Boolean,
      default: true
    },
    bookingUpdates: {
      type: Boolean,
      default: true
    },
    communityUpdates: {
      type: Boolean,
      default: false
    },
    communityReplies: {
      type: Boolean,
      default: true
    },
    resourceRecommendations: {
      type: Boolean,
      default: true
    },
    systemAnnouncements: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    }
  },

  // ✅ NEW: Privacy Settings
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'students', 'private'],
      default: 'public'
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showPhone: {
      type: Boolean,
      default: false
    },
    anonymousPosting: {
      type: Boolean,
      default: true
    },
    dataCollection: {
      type: Boolean,
      default: true
    }
  },

  // Privacy & Security
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // OTP-based email verification
  emailOtp: String,
  emailOtpExpires: Date,

  // Consent & Privacy
  termsAccepted: {
    type: Boolean,
    default: false
  },
  privacyPolicyAccepted: {
    type: Boolean,
    default: false
  },
  dataRetentionConsent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'studentProfile.studentId': 1 }, { sparse: true });

// Prevent email changes after verification
userSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified('email') && this.isEmailVerified) {
    return next(new Error('EMAIL_LOCKED: Email cannot be changed after verification'));
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await hash(this.password, 12);
  next();
});

// Update passwordChangedAt
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method: Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await compare(candidatePassword, this.password);
};

// Instance method: Check if password changed after JWT issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method: Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = randomBytes(32).toString('hex');

  this.passwordResetToken = createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Instance method: Generate 6-digit OTP for email verification
userSchema.methods.createEmailOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store hashed OTP
  this.emailOtp = createHash('sha256').update(otp).digest('hex');
  this.emailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return otp; // Return plain OTP to send via email
};

// Instance method: Generate email verification token
userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = randomBytes(32).toString('hex');

  this.emailVerificationToken = createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Remove sensitive data from output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.emailOtp;
  delete user.emailOtpExpires;
  return user;
};

export default model('User', userSchema);