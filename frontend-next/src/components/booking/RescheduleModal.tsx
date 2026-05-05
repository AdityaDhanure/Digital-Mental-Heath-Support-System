'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Booking } from '@/types/booking.types';
import { XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { bookingAPI } from '@/lib/api/booking';
import { availabilityAPI } from '@/lib/api/availability';

interface RescheduleModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RescheduleModal({ booking, onClose, onSuccess }: RescheduleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isFetchingAvailability, setIsFetchingAvailability] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    endTime: '',
  });

  useEffect(() => {
    if (formData.date) {
      loadAvailability();
    }
  }, [formData.date]);

  const loadAvailability = async () => {
    setIsFetchingAvailability(true);
    try {
      const data = await availabilityAPI.getCounselorAvailability(
        booking.counselor._id,
        formData.date
      );
      setAvailableSlots(data.slots || []);

      // Reset selection if no longer valid
      if (formData.time && !data.slots.some((s: any) => s.startTime === formData.time)) {
        setFormData(prev => ({ ...prev, time: '', endTime: '' }));
      }
    } catch (error) {
      toast.error('Failed to load availability');
      setAvailableSlots([]);
    } finally {
      setIsFetchingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.time) {
      toast.error('Please select a time slot');
      return;
    }

    setIsLoading(true);

    try {
      await bookingAPI.rescheduleBooking((booking._id || booking.id) as string, {
        appointmentDate: formData.date,
        appointmentTime: {
          start: formData.time,
          end: formData.endTime,
        },
      });

      toast.success('Booking rescheduled successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reschedule';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reschedule Appointment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Current Booking Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Current Appointment:</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              {new Date(booking.appointmentDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gray-500" />
              {booking.appointmentTime.start} - {booking.appointmentTime.end}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="New Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />

          {formData.date && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Available Slot
              </label>

              {isFetchingAvailability ? (
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 bg-gray-50 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                  <p className="text-sm text-red-600 font-medium">No slots available for this date.<br />Please choose another date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.startTime}
                      type="button"
                      onClick={() => setFormData({ ...formData, time: slot.startTime, endTime: slot.endTime })}
                      className={`px-3 py-2 rounded-lg text-sm font-bold border-2 transition-all ${formData.time === slot.startTime
                        ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                        : 'bg-white border-gray-100 text-gray-700 hover:border-purple-200 hover:bg-purple-50'
                        }`}
                    >
                      {slot.startTime} - {slot.endTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Both you and the counselor will be notified about this reschedule request.
            </p>
          </div>

          <div className="flex gap-3">
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
              disabled={!formData.date || !formData.time}
              className="flex-1"
            >
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}