// FILE: src/app/(dashboard)/bookings/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePersistentState } from '@/lib/hooks/usePersistentState';
import { bookingAPI } from '@/lib/api/booking';
import { CalendarIcon, UserGroupIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import MoodTrackerFloat from '@/components/mood/MoodTrackerFloat';
import BookingModal from '@/components/booking/BookingModal';
import RescheduleModal from '@/components/booking/RescheduleModal';
import CounselorDetailsModal from '@/components/booking/CounselorDetailsModal';
import StudentDetailsModal from '@/components/booking/StudentDetailsModal';
import {
  BookingsHeader,
  StatusFilter,
  SessionCard,
} from '@/components/bookings/shared';
import { CounselorCard } from '@/components/bookings/student';
import { CounselorSessionCard } from '@/components/bookings/counselor';

export default function BookingsPage() {
  const { user } = useAuthStore();
  const isCounselor = user?.role === 'counselor';

  const [counselors, setCounselors] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = usePersistentState('mindsage:bookings:status', 'all');
  const [activeTab, setActiveTab] = usePersistentState<'counselors' | 'bookings'>('mindsage:bookings:tab', 'counselors');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);
  const [viewDetailsCounselor, setViewDetailsCounselor] = useState<any>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = bookings;
    if (statusFilter !== 'all') {
      filtered = bookings.filter(b => b.status === statusFilter);
    }
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.appointmentDate).getTime();
      const dateB = new Date(b.appointmentDate).getTime();
      return dateB - dateA;
    });
    setFilteredBookings(filtered);
  }, [bookings, statusFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [counselorsRes, bookingsRes] = await Promise.all([
        bookingAPI.getCounselors(),
        bookingAPI.getAllBookings({}),
      ]);

      setCounselors(counselorsRes?.data?.counselors || []);
      setBookings(bookingsRes?.data?.bookings || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await bookingAPI.updateBookingStatus(bookingId, status);
      toast.success(`Session ${status === 'confirmed' ? 'confirmed' : 'declined'}`);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleMarkComplete = async (bookingId: string) => {
    try {
      await bookingAPI.completeBooking(bookingId, { attended: true });
      toast.success('Session marked as completed');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark complete');
    }
  };

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookings.length };
    bookings.forEach(b => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  return (
    <div className="space-y-6 pb-20">
      <MoodTrackerFloat />

      {/* Header */}
      <BookingsHeader 
        role={user?.role || 'student'} 
        counselorCount={counselors.length} 
      />

      {/* View Tabs - Students Only */}
      {!isCounselor && (
        <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('counselors')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'counselors'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UserGroupIcon className="h-5 w-5" />
            Counselors
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'bookings'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CalendarDaysIcon className="h-5 w-5" />
            My Bookings
          </button>
        </div>
      )}

      {/* Content */}
      {activeTab === 'bookings' || isCounselor ? (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                {isCounselor ? 'All Sessions' : 'My Bookings'}
              </h2>
            </div>
          </div>

          <StatusFilter 
            currentStatus={statusFilter} 
            onStatusChange={setStatusFilter}
            counts={statusCounts}
          />

          {/* Sessions List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                isCounselor ? (
                  <CounselorSessionCard
                    key={booking._id}
                    booking={booking}
                    onConfirm={() => handleUpdateStatus(booking._id, 'confirmed')}
                    onDecline={() => handleUpdateStatus(booking._id, 'cancelled')}
                    onReschedule={() => setRescheduleBooking(booking)}
                    onMarkComplete={() => handleMarkComplete(booking._id)}
                    onCancel={() => handleCancelBooking(booking._id)}
                    onViewStudent={() => setSelectedBooking(booking)}
                  />
                ) : (
                  <SessionCard
                    key={booking._id}
                    booking={booking}
                    onReschedule={() => setRescheduleBooking(booking)}
                    onCancel={() => handleCancelBooking(booking._id)}
                  />
                )
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-6">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} bookings at the moment`
                  : "You haven't booked any sessions yet"
                }
              </p>
              {!isCounselor && statusFilter === 'all' && (
                <button
                  onClick={() => setActiveTab('counselors')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Browse Counselors
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Counselors Grid - Students Only */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Counselors ({counselors.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-4 h-32"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {counselors.map((counselor) => (
                <CounselorCard
                  key={counselor._id}
                  counselor={counselor}
                  onViewDetails={() => setViewDetailsCounselor(counselor)}
                  onBookNow={() => setSelectedCounselor(counselor)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {viewDetailsCounselor && (
        <CounselorDetailsModal
          counselor={viewDetailsCounselor}
          onClose={() => setViewDetailsCounselor(null)}
          onBook={(counselor) => {
            setViewDetailsCounselor(null);
            setSelectedCounselor(counselor);
          }}
        />
      )}

      {selectedCounselor && (
        <BookingModal
          counselor={selectedCounselor}
          onClose={() => setSelectedCounselor(null)}
          onSuccess={loadData}
        />
      )}

      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onSuccess={loadData}
        />
      )}

      {selectedBooking && isCounselor && (
        <StudentDetailsModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={(id) => handleUpdateStatus(id, 'confirmed')}
          onCancel={handleCancelBooking}
          onReschedule={setRescheduleBooking}
          onMarkComplete={handleMarkComplete}
        />
      )}
    </div>
  );
}
