// src/models/Booking.js - Counseling Appointment Booking Schema

import { Schema, model } from 'mongoose';

const bookingSchema = new Schema({
  // References
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  counselor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Appointment details
  appointmentDate: {
    type: Date,
    required: true,
    index: true
  },

  appointmentTime: {
    start: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    end: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },

  duration: {
    type: Number, // in minutes
    default: 45,
    min: 15,
    max: 120
  },

  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
    index: true
  },

  // Session type
  sessionType: {
    type: String,
    enum: ['first-visit', 'follow-up', 'crisis', 'group', 'emergency'],
    default: 'first-visit'
  },

  mode: {
    type: String,
    enum: ['online', 'offline', 'phone'],
    default: 'offline'
  },

  // Student information (kept confidential)
  studentNotes: {
    type: String,
    maxlength: 500,
    trim: true
  },

  concernCategory: {
    type: String,
    enum: ['anxiety', 'depression', 'stress', 'academic', 'relationship', 'family', 'other'],
    default: 'other'
  },

  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Counselor notes (private, only counselor can access)
  counselorNotes: {
    type: String,
    maxlength: 2000,
    trim: true,
    select: false // Hidden by default
  },

  // Session outcomes
  sessionSummary: {
    attended: {
      type: Boolean,
      default: null
    },
    completedAt: Date,
    followUpRequired: {
      type: Boolean,
      default: false
    },
    nextAppointmentSuggested: Date,
    sessionRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Cancellation details
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['student', 'counselor', 'admin'],
    },
    reason: String,
    cancelledAt: Date
  },

  // Rescheduling history
  rescheduledFrom: {
    date: Date,
    time: {
      start: String,
      end: String
    }
  },

  // Reminders sent
  remindersSent: {
    type: [Date],
    default: []
  },

  // Notifications
  notificationsSent: {
    studentNotified: {
      type: Boolean,
      default: false
    },
    counselorNotified: {
      type: Boolean,
      default: false
    }
  },

  // Meeting link (for online sessions)
  meetingLink: {
    type: String,
    trim: true
  },

  // Confidentiality agreement
  confidentialityAgreed: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

// Compound indexes for performance
bookingSchema.index({ student: 1, appointmentDate: -1 });
bookingSchema.index({ counselor: 1, appointmentDate: 1 });
bookingSchema.index({ appointmentDate: 1, status: 1 });

// Virtual for full appointment datetime
bookingSchema.virtual('fullDateTime').get(function () {
  if (!this.appointmentDate || !this.appointmentTime.start) return null;

  const date = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.start.split(':');
  date.setHours(parseInt(hours), parseInt(minutes));

  return date;
});

// Static method: Check slot availability
bookingSchema.statics.isSlotAvailable = async function (counselorId, date, timeSlot) {
  const conflictingBooking = await this.findOne({
    counselor: counselorId,
    appointmentDate: date,
    $or: [
      {
        'appointmentTime.start': { $lte: timeSlot.start },
        'appointmentTime.end': { $gt: timeSlot.start }
      },
      {
        'appointmentTime.start': { $lt: timeSlot.end },
        'appointmentTime.end': { $gte: timeSlot.end }
      }
    ],
    status: { $nin: ['cancelled', 'completed'] }
  });

  return !conflictingBooking;
};

// Static method: Get counselor's bookings for a date
bookingSchema.statics.getCounselorSchedule = async function (counselorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await this.find({
    counselor: counselorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['cancelled'] }
  }).sort({ 'appointmentTime.start': 1 });
};

// Instance method: Send reminder
bookingSchema.methods.addReminder = function () {
  this.remindersSent.push(new Date());
  return this.save();
};

// Instance method: Cancel appointment
bookingSchema.methods.cancel = function (cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy,
    reason,
    cancelledAt: new Date()
  };
  return this.save();
};

// Instance method: Reschedule appointment
bookingSchema.methods.reschedule = function (newDate, newTime, newStatus) {
  this.rescheduledFrom = {
    date: this.appointmentDate,
    time: this.appointmentTime
  };

  this.appointmentDate = newDate;
  this.appointmentTime = newTime;
  if (newStatus) {
    this.status = newStatus;
  }

  return this.save();
};

// Instance method: Complete appointment
bookingSchema.methods.complete = function (summaryData) {
  this.status = 'completed';
  this.sessionSummary = {
    ...this.sessionSummary,
    ...summaryData,
    attended: true,
    completedAt: new Date()
  };
  return this.save();
};

// Pre-save middleware: Validate appointment time
bookingSchema.pre('save', function (next) {
  if (this.isModified('appointmentDate')) {
    const appointmentDate = new Date(this.appointmentDate);
    const now = new Date();

    if (appointmentDate < now) {
      return next(new Error('Cannot book appointments in the past'));
    }
  }
  next();
});

export default model('Booking', bookingSchema);