// ============================================
// FILE: src/types/auth.types.ts
// ============================================
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'counselor' | 'admin' | 'moderator';
  isEmailVerified: boolean;
  language?: 'english' | 'hindi' | 'marathi';
  createdAt?: string;
  phone?: string;
  languagesKnown?: string[];
  dateOfBirth?: string;
  gender?: string;
  
  // Student-specific fields
  studentProfile?: {
    enrollmentNumber?: string;
    department?: string;
    year?: string;
    course?: string;
  };
  
  // Counselor-specific fields
  counselorProfile?: {
    specialization?: string[];
    licenseNumber?: string;
    experience?: number;
    bio?: string;
    rating?: number;
    totalRatings?: number;
    therapyApproaches?: string[];
    education?: string[];
  };
  
  // Flat counselor fields (when returned directly)
  rating?: number;
  totalRatings?: number;
  specialization?: string[];
  licenseNumber?: string;
  experience?: number;
  bio?: string;
  therapyApproaches?: string[];
  education?: string[];

  // Address
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  
  // Privacy & Notifications
  privacySettings?: {
    profileVisibility?: 'public' | 'students' | 'private';
    showEmail?: boolean;
    showPhone?: boolean;
    anonymousPosting?: boolean;
    dataCollection?: boolean;
  };
  notificationPreferences?: {
    email?: boolean;
    push?: boolean;
    bookingReminders?: boolean;
    bookingUpdates?: boolean;
    communityUpdates?: boolean;
    communityReplies?: boolean;
    resourceRecommendations?: boolean;
    systemAnnouncements?: boolean;
    marketingEmails?: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  role: 'student' | 'counselor';
  language?: string;
  studentId?: string;
  department?: string;
  year?: string;
  specialization?: string[];
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'student' | 'admin' | 'counselor';
      isEmailVerified: boolean;
      lastLogin: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}
