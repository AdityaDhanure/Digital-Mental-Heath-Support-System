// ============================================
// FILE: src/components/booking/BookingModal.tsx
// ============================================
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Counselor } from '@/types/booking.types';
import { XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { bookingAPI } from '@/lib/api/booking';
import { availabilityAPI } from '@/lib/api/availability';

interface BookingModalProps {
  counselor: Counselor;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ counselor, onClose, onSuccess }: BookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAvailability, setIsFetchingAvailability] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    endTime: '',
    notes: '',
    sessionType: 'first-visit',
    mode: 'offline',
    concernCategory: 'other',
    urgencyLevel: 'medium'
  });

  useEffect(() => {
    if (formData.date) {
      fetchAvailability(formData.date);
    }
  }, [formData.date]);

  const fetchAvailability = async (date: string) => {
    setIsFetchingAvailability(true);
    try {
      const data = await availabilityAPI.getCounselorAvailability(counselor._id, date);
      setAvailableSlots(data.slots || []);
      // Reset time if selected time is no longer available
      if (formData.time && !data.slots.some((s: any) => s.startTime === formData.time)) {
        setFormData(prev => ({ ...prev, time: '', endTime: '' }));
      }
    } catch (error) {
      toast.error('Failed to load available slots');
      setAvailableSlots([]);
    } finally {
      setIsFetchingAvailability(false);
    }
  };

  // REPLACE handleSubmit function:

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.time) {
      toast.error('Please select a time slot');
      return;
    }

    setIsLoading(true);

    try {
      await bookingAPI.createBooking({
        counselorId: counselor._id,
        appointmentDate: formData.date,
        appointmentTime: {
          start: formData.time,
          end: formData.endTime
        },
        duration: 45,
        sessionType: formData.sessionType || 'first-visit',
        mode: formData.mode || 'offline',
        studentNotes: formData.notes,
        concernCategory: formData.concernCategory || 'other',
        urgencyLevel: formData.urgencyLevel || 'medium'
      });

      toast.success('Booking request sent successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden p-5 pt-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Book Session</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Counselor Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-900">{counselor.name}</p>
          <p className="text-sm text-gray-600">{counselor.specialization?.join(', ') || 'General Counseling'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
          <Input
            label="Preferred Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Select Available Slot
            </label>

            {!formData.date ? (
              <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Please select a date first to see available slots</p>
              </div>
            ) : isFetchingAvailability ? (
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                <ClockIcon className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-xs text-red-600 font-medium">No slots available for this date.<br />Please choose another date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => setFormData({ ...formData, time: slot.startTime, endTime: slot.endTime })}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-bold border-2 transition-all
                      ${formData.time === slot.startTime
                        ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                        : 'bg-white border-gray-100 text-gray-700 hover:border-purple-200 hover:bg-purple-50'
                      }
                    `}
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <select
              value={formData.sessionType}
              onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
              className="input-field"
            >
              <option value="first-visit">First Visit - Initial Consultation</option>
              <option value="follow-up">Follow-up Session</option>
              <option value="crisis">Crisis Intervention</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Mode
            </label>
            <select
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              className="input-field"
            >
              <option value="offline">In-Person (Face-to-Face)</option>
              <option value="online">Online Video Call</option>
              <option value="phone">Phone Call</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Concern
            </label>
            <select
              value={formData.concernCategory}
              onChange={(e) => setFormData({ ...formData, concernCategory: e.target.value })}
              className="input-field"
            >
              <option value="anxiety">Anxiety & Worry</option>
              <option value="depression">Depression & Low Mood</option>
              <option value="stress">Stress & Burnout</option>
              <option value="academic">Academic Pressure & Performance</option>
              <option value="relationship">Relationship & Social Issues</option>
              <option value="family">Family Conflicts</option>
              <option value="other">Other Concerns</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <select
              value={formData.urgencyLevel}
              onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
              className="input-field"
            >
              <option value="low">Low - Can wait a week</option>
              <option value="medium">Medium - Within few days</option>
              <option value="high">High - Need soon</option>
              <option value="urgent">Urgent - ASAP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Share any specific concerns or topics you'd like to discuss..."
              rows={3}
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1"
            >
              Confirm Booking
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          The counselor will review and confirm your request within 24 hours
        </p>
      </div>
    </div>
  );
}