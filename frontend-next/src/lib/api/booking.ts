// ============================================
// FILE: src/lib/api/booking.ts
// ============================================
import apiClient from './axios';

export const bookingAPI = {
  // Get all bookings with filters
  getAllBookings: async (params?: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/bookings', { params });
    return response.data;
  },

  // Get single booking
  getBooking: async (id: string) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  // Get counselors list
  getCounselors: async () => {
    const response = await apiClient.get('/users/counselors');
    return response.data;
  },

  // Get counselor availability
  getCounselorAvailability: async (counselorId: string, date: string) => {
    const response = await apiClient.get(`/bookings/counselor/${counselorId}/availability`, {
      params: { date },
    });
    return response.data;
  },

  // Create booking
  createBooking: async (data: {
    counselorId: string;  // ✅ Changed from 'counselor' to match backend
    appointmentDate: string;
    appointmentTime: { start: string; end: string };
    duration?: number;
    sessionType?: string;
    mode?: string;
    studentNotes?: string;
    concernCategory?: string;
    urgencyLevel?: string;
  }) => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  // Update booking status (counselor/admin only)
  updateBookingStatus: async (id: string, status: string, counselorNotes?: string) => {
    const response = await apiClient.patch(`/bookings/${id}/status`, {
      status,
      counselorNotes,
    });
    return response.data;
  },

  // Reschedule booking
  rescheduleBooking: async (
    id: string,
    data: {
      appointmentDate: string;
      appointmentTime: { start: string; end: string };
    }
  ) => {
    const response = await apiClient.patch(`/bookings/${id}/reschedule`, data);
    return response.data;
  },

  // Complete booking (counselor only)
  completeBooking: async (
    id: string,
    data: {
      attended: boolean;
      followUpRequired?: boolean;
      counselorNotes?: string;
    }
  ) => {
    const response = await apiClient.patch(`/bookings/${id}/complete`, data);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id: string) => {
    const response = await apiClient.delete(`/bookings/${id}`);
    return response.data;
  },

  // Get student session history with counselor
  getStudentSessionHistory: async (studentId: string) => {
    const response = await apiClient.get(`/bookings/student/${studentId}/history`);
    return response.data;
  },

  // Get student details
  getStudentDetails: async (studentId: string) => {
    const response = await apiClient.get(`/users/student/${studentId}`);
    return response.data;
  },
};
