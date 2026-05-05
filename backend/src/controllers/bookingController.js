// src/controllers/bookingController.js - Counseling Booking Business Logic

import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Availability from '../models/Availability.js';
import Notification from '../models/Notification.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import logger from '../utils/logger.js';

export const createBooking = catchAsync(async (req, res) => {
  const {
    counselorId,
    appointmentDate,
    appointmentTime,
    sessionType,
    mode,
    concernCategory,
    urgencyLevel,
    studentNotes
  } = req.body;

  const studentId = req.user._id;

  // Verify counselor exists
  const counselor = await User.findOne({
    _id: counselorId,
    role: 'counselor',
    isActive: true
  });

  if (!counselor) {
    return res.status(404).json({
      status: 'error',
      message: 'Counselor not found'
    });
  }

  // Check and book slot in Availability model
  const availability = await Availability.findOne({
    counselor: counselorId,
    date: new Date(appointmentDate)
  });

  if (!availability) {
    return res.status(409).json({
      status: 'error',
      message: 'Counselor has not set availability for this date',
      code: 'AVAILABILITY_NOT_SET'
    });
  }

  const slot = availability.slots.find(
    s => s.startTime === appointmentTime.start && s.endTime === appointmentTime.end
  );

  if (!slot || slot.isBooked) {
    return res.status(409).json({
      status: 'error',
      message: 'This time slot is not available',
      code: 'SLOT_UNAVAILABLE'
    });
  }

  // Check if student already has a booking at this time
  const conflictingStudentBooking = await Booking.findOne({
    student: studentId,
    appointmentDate,
    status: { $nin: ['cancelled', 'completed'] },
    $or: [
      {
        'appointmentTime.start': { $lte: appointmentTime.start },
        'appointmentTime.end': { $gt: appointmentTime.start }
      },
      {
        'appointmentTime.start': { $lt: appointmentTime.end },
        'appointmentTime.end': { $gte: appointmentTime.end }
      }
    ]
  });

  if (conflictingStudentBooking) {
    return res.status(409).json({
      status: 'error',
      message: 'You already have a booking at this time'
    });
  }

  // Create booking
  const booking = await Booking.create({
    student: studentId,
    counselor: counselorId,
    appointmentDate,
    appointmentTime,
    sessionType: sessionType || 'first-visit',
    mode: mode || 'offline',
    concernCategory,
    urgencyLevel: urgencyLevel || 'medium',
    studentNotes,
    status: 'pending',
    confidentialityAgreed: true
  });

  // Mark slot as booked in Availability model
  slot.isBooked = true;
  slot.bookingId = booking._id;
  await availability.save();

  // Create notifications
  await Notification.createNotification({
    recipient: counselorId,
    type: 'booking_confirmed',
    title: 'New Counseling Request',
    message: `You have a new counseling appointment request from ${req.user.name}`,
    priority: urgencyLevel === 'urgent' ? 'high' : 'medium',
    relatedEntity: {
      entityType: 'booking',
      entityId: booking._id
    },
    actionUrl: `/counselor/bookings/${booking._id}`,
    actionLabel: 'View Booking'
  });

  await Notification.createNotification({
    recipient: studentId,
    type: 'booking_confirmed',
    title: 'Booking Request Submitted',
    message: `Your counseling appointment request has been submitted. The counselor will confirm shortly.`,
    priority: 'medium',
    relatedEntity: {
      entityType: 'booking',
      entityId: booking._id
    },
    actionUrl: `/student/bookings/${booking._id}`,
    actionLabel: 'View Details'
  });

  logger.booking('Booking created', {
    bookingId: booking._id,
    studentId,
    counselorId,
    urgencyLevel
  });

  res.status(201).json({
    status: 'success',
    message: 'Booking request submitted successfully',
    data: { booking }
  });
});

export const getAllBookings = catchAsync(async (req, res) => {
  const { status, date, page = 1, limit = 10 } = req.query;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Build query based on role
  let query = {};

  if (userRole === 'student') {
    query.student = userId;
  } else if (userRole === 'counselor') {
    query.counselor = userId;
  } else if (userRole === 'admin') {
    // Admins can see all bookings
  } else {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied'
    });
  }

  // Apply filters
  if (status) {
    query.status = status;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query.appointmentDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }

  // Execute query with pagination
  const bookings = await Booking.find(query)
    .populate('student', 'name email phone studentProfile')
    .populate('counselor', 'name specialization')
    .sort({ appointmentDate: 1, 'appointmentTime.start': 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Booking.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    }
  });
});

export const getBooking = catchAsync(async (req, res) => {
  const bookingId = req.params.id;

  const booking = await Booking.findById(bookingId)
    .populate('student', 'name email phone studentProfile')
    .populate('counselor', 'name email specialization');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  // Check access permissions
  const userId = req.user._id.toString();
  const studentId = booking.student._id.toString();
  const counselorId = booking.counselor._id.toString();

  if (userId !== studentId && userId !== counselorId && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied'
    });
  }

  res.status(200).json({
    status: 'success',
    data: { booking }
  });
});

// Get student session history with a specific counselor
export const getStudentSessionHistory = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const counselorId = req.user._id;

  // Verify student exists
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return res.status(404).json({
      status: 'error',
      message: 'Student not found'
    });
  }

  // Get all bookings between this student and counselor
  const bookings = await Booking.find({
    student: studentId,
    counselor: counselorId
  })
    .sort({ scheduledAt: -1 })
    .populate('student', 'name email phone profilePicture studentProfile')
    .populate('counselor', 'name');

  // Calculate statistics
  const stats = {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    upcoming: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  logger.info(`Counselor ${counselorId} retrieved session history for student ${studentId}`);

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      stats,
      student: bookings.length > 0 ? bookings[0].student : student
    }
  });
});

export const updateBookingStatus = catchAsync(async (req, res) => {
  const bookingId = req.params.id;
  const { status, counselorNotes } = req.body;

  const booking = await Booking.findById(bookingId)
    .populate('student', 'name email')
    .populate('counselor', 'name');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  // Only counselor or admin can update status
  if (req.user.role !== 'counselor' && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Only counselors can update booking status'
    });
  }

  // Handle slot release if status changed to cancelled
  if (status === 'cancelled' && booking.status !== 'cancelled') {
    const availability = await Availability.findOne({
      counselor: booking.counselor._id,
      date: booking.appointmentDate
    });
    if (availability) {
      await availability.releaseSlot(booking.appointmentTime.start, booking.appointmentTime.end);
    }
  }

  // Update booking
  booking.status = status;
  if (counselorNotes) {
    booking.counselorNotes = counselorNotes;
  }

  await booking.save();

  // Send notification to student
  let notificationMessage = '';
  if (status === 'confirmed') {
    notificationMessage = `Your counseling appointment has been confirmed for ${new Date(booking.appointmentDate).toLocaleDateString()}`;
  } else if (status === 'cancelled') {
    notificationMessage = `Your counseling appointment has been cancelled. Please book another slot if needed.`;
  }

  if (notificationMessage) {
    await Notification.createNotification({
      recipient: booking.student._id,
      type: status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled',
      title: 'Booking Status Update',
      message: notificationMessage,
      priority: 'high',
      relatedEntity: {
        entityType: 'booking',
        entityId: booking._id
      }
    });
  }

  logger.booking('Booking status updated', {
    bookingId,
    status,
    counselorId: req.user._id
  });

  res.status(200).json({
    status: 'success',
    message: 'Booking status updated',
    data: { booking }
  });
});

export const rescheduleBooking = catchAsync(async (req, res) => {
  const bookingId = req.params.id;
  const { appointmentDate, appointmentTime } = req.body;

  const booking = await Booking.findById(bookingId)
    .populate('student', 'name email')
    .populate('counselor', 'name');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  // Book new slot
  const newAvailability = await Availability.findOne({
    counselor: booking.counselor._id,
    date: new Date(appointmentDate)
  });

  if (!newAvailability) {
    return res.status(409).json({
      status: 'error',
      message: 'Counselor has not set availability for the new date'
    });
  }

  try {
    await newAvailability.bookSlot(appointmentTime.start, appointmentTime.end, booking._id);

    // Release old slot
    const oldAvailability = await Availability.findOne({
      counselor: booking.counselor._id,
      date: booking.appointmentDate
    });
    if (oldAvailability) {
      await oldAvailability.releaseSlot(booking.appointmentTime.start, booking.appointmentTime.end);
    }

    // Determine new status based on who is rescheduling
    const newStatus = req.user.role === 'counselor' ? 'confirmed' : 'pending';

    // Reschedule
    await booking.reschedule(appointmentDate, appointmentTime, newStatus);
  } catch (err) {
    return res.status(409).json({
      status: 'error',
      message: err.message || 'The selected time slot is not available'
    });
  }

  // Notify both parties
  const recipients = [booking.student._id, booking.counselor._id];
  for (const recipient of recipients) {
    await Notification.createNotification({
      recipient,
      type: 'booking_rescheduled',
      title: 'Appointment Rescheduled',
      message: `Your appointment has been rescheduled to ${new Date(appointmentDate).toLocaleDateString()}`,
      priority: 'high',
      relatedEntity: {
        entityType: 'booking',
        entityId: booking._id
      }
    });
  }

  logger.booking('Booking rescheduled', { bookingId });

  res.status(200).json({
    status: 'success',
    message: 'Booking rescheduled successfully',
    data: { booking }
  });
});

export const cancelBooking = catchAsync(async (req, res) => {
  const bookingId = req.params.id;
  const { reason } = req.body;

  const booking = await Booking.findById(bookingId)
    .populate('student', 'name email')
    .populate('counselor', 'name email');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  // Determine who is cancelling
  const userId = req.user._id.toString();
  const studentId = booking.student._id.toString();
  const counselorId = booking.counselor._id.toString();

  let cancelledBy = 'student';
  if (userId === counselorId) cancelledBy = 'counselor';
  if (req.user.role === 'admin') cancelledBy = 'admin';

  // Release slot in Availability model
  const availability = await Availability.findOne({
    counselor: booking.counselor._id,
    date: booking.appointmentDate
  });
  if (availability) {
    await availability.releaseSlot(booking.appointmentTime.start, booking.appointmentTime.end);
  }

  // Cancel booking
  await booking.cancel(cancelledBy, reason);

  // Notify other party
  const otherParty = cancelledBy === 'student' ? booking.counselor._id : booking.student._id;

  await Notification.createNotification({
    recipient: otherParty,
    type: 'booking_cancelled',
    title: 'Appointment Cancelled',
    message: `Your appointment scheduled for ${new Date(booking.appointmentDate).toLocaleDateString()} has been cancelled.`,
    priority: 'high',
    relatedEntity: {
      entityType: 'booking',
      entityId: booking._id
    }
  });

  logger.booking('Booking cancelled', {
    bookingId,
    cancelledBy,
    reason
  });

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully'
  });
});

export const completeBooking = catchAsync(async (req, res) => {
  const bookingId = req.params.id;
  const { attended, followUpRequired, nextAppointmentSuggested, sessionRating } = req.body;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  // Only counselor can complete
  if (req.user.role !== 'counselor') {
    return res.status(403).json({
      status: 'error',
      message: 'Only counselors can complete bookings'
    });
  }

  await booking.complete({
    attended,
    followUpRequired,
    nextAppointmentSuggested,
    sessionRating
  });

  logger.booking('Booking completed', { bookingId });

  res.status(200).json({
    status: 'success',
    message: 'Session marked as completed',
    data: { booking }
  });
});

export const getCounselorAvailability = catchAsync(async (req, res) => {
  const { counselorId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      status: 'error',
      message: 'Date parameter is required'
    });
  }

  const counselor = await User.findById(counselorId);

  if (!counselor || counselor.role !== 'counselor') {
    return res.status(404).json({
      status: 'error',
      message: 'Counselor not found'
    });
  }

  // Get all bookings for this date
  const bookings = await Booking.getCounselorSchedule(counselorId, date);

  // Get counselor's availability settings
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
  const availableSlots = counselor.availability?.get(dayOfWeek) || [];

  res.status(200).json({
    status: 'success',
    data: {
      counselor: {
        id: counselor._id,
        name: counselor.name,
        specialization: counselor.specialization
      },
      date,
      availableSlots,
      bookedSlots: bookings.map(b => ({
        start: b.appointmentTime.start,
        end: b.appointmentTime.end,
        status: b.status
      }))
    }
  });
});

