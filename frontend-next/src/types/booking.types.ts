// ============================================
// FILE: src/types/booking.types.ts
// ============================================
export interface Counselor {
  _id: string;
  name: string;
  specialization: string[];
  experience: number;
  languagesKnown: string[];
  avatar?: string;
  rating: number;
  availability?: string[];
}

export interface Booking {
  _id?: string;
  id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    phone?: string;
    gender?: string;
    studentProfile?: {
      studentId?: string;
      enrollmentNumber?: string;
      department?: string;
      year?: string;
      course?: string;
    };
  };
  counselor: {
    _id: string;
    name: string;
    email?: string;
    specialization?: string[];
  };
  appointmentDate: Date;
  appointmentTime: {
    start: string;
    end: string;
  };
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  sessionType?: 'first-visit' | 'follow-up' | 'crisis' | 'group' | 'emergency';
  mode?: 'online' | 'offline' | 'phone';
  studentNotes?: string;
  concernCategory?: string;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'urgent';
  counselorNotes?: string;
  meetingLink?: string;
  createdAt: Date;
  updatedAt?: Date;
}