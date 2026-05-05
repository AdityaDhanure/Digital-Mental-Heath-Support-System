// src/controllers/userController.js - To acces user's data

import User from '../models/User.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import logger from '../utils/logger.js';

export const getCounselors = catchAsync(async (req, res) => {
  const counselors = await User.find({ role: 'counselor', isActive: true })
    .select('name counselorProfile.specialization counselorProfile.experience languagePreference rating languagesKnown');

  // Flatten the counselorProfile fields for the frontend
  const flattenedCounselors = counselors.map(c => {
    const obj = c.toObject();
    if (obj.counselorProfile) {
      obj.specialization = obj.counselorProfile.specialization;
      obj.experience = obj.counselorProfile.experience;
      delete obj.counselorProfile;
    }
    return obj;
  });

  logger.info(`Retrieved ${flattenedCounselors.length} counselors`);

  res.status(200).json({
    status: 'success',
    results: flattenedCounselors.length,
    data: { counselors: flattenedCounselors }
  });
});

// Get student full details (for counselors)
export const getStudentDetails = catchAsync(async (req, res) => {
  const { studentId } = req.params;

  console.log('Looking for student with ID:', studentId);

  let student;
  try {
    student = await User.findById(studentId)
      .select('name email phone gender profilePicture studentProfile createdAt address role');
  } catch (err) {
    console.error('MongoDB query error:', err);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid student ID format'
    });
  }

  console.log('Found student:', student ? student.name : 'NOT FOUND');
  console.log('Student role:', student?.role);

  if (!student) {
    return res.status(404).json({
      status: 'error',
      message: 'Student not found in database'
    });
  }

  if (student.role !== 'student') {
    return res.status(400).json({
      status: 'error',
      message: `User found but role is '${student.role}', not 'student'`
    });
  }

  logger.info(`Retrieved details for student ${studentId}`);

  res.status(200).json({
    status: 'success',
    data: { student }
  });
});

// Get single counselor by ID
export const getCounselorById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const counselor = await User.findOne({ _id: id, role: 'counselor' })
    .select('name email counselorProfile rating totalRatings languagesKnown isEmailVerified');

  if (!counselor) {
    return res.status(404).json({
      status: 'error',
      message: 'Counselor not found'
    });
  }

  const obj = counselor.toObject();
  if (obj.counselorProfile) {
    obj.specialization = obj.counselorProfile.specialization;
    obj.experience = obj.counselorProfile.experience;
    obj.bio = obj.counselorProfile.bio;
    obj.education = obj.counselorProfile.education;
    obj.therapyApproaches = obj.counselorProfile.therapyApproaches;
    obj.licenseNumber = obj.counselorProfile.licenseNumber;
    delete obj.counselorProfile;
  }

  res.status(200).json({
    status: 'success',
    data: { counselor: obj }
  });
});