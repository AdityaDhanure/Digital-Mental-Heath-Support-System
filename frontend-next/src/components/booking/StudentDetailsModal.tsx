'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { bookingAPI } from '@/lib/api/booking';
import { Booking } from '@/types/booking.types';
import toast from 'react-hot-toast';

interface StudentDetailsModalProps {
    booking: Booking;
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: (bookingId: string) => void;
    onCancel?: (bookingId: string) => void;
    onReschedule?: (booking: Booking) => void;
    onMarkComplete?: (bookingId: string) => void;
}

interface SessionStats {
    total: number;
    completed: number;
    upcoming: number;
    pending: number;
    cancelled: number;
}

export default function StudentDetailsModal({
    booking,
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    onReschedule,
    onMarkComplete,
}: StudentDetailsModalProps) {
    const router = useRouter();
    const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
    const [loading, setLoading] = useState(true);
    // Local cache for the modal instance life or better, use a simpler dependency
    const [lastFetchedId, setLastFetchedId] = useState<string | null>(null);

    useEffect(() => {
        const studentId = typeof booking.student === 'string' ? booking.student : booking.student?._id;
        if (isOpen && studentId && studentId !== lastFetchedId) {
            loadStudentData(studentId);
        }
    }, [isOpen, booking.student, lastFetchedId]);

    const loadStudentData = async (studentId: string) => {
        try {
            setLoading(true);
            const response = await bookingAPI.getStudentSessionHistory(studentId);
            setSessionStats(response.data.stats);
            setLastFetchedId(studentId);
        } catch (error: any) {
            if (error.response?.status !== 429) {
                console.error('Failed to load student data:', error);
                toast.error('Failed to load student details');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewFullDetails = () => {
        const studentId = typeof booking.student === 'string' ? booking.student : booking.student._id;
        router.push(`/dashboard/students/${studentId}`);
        onClose();
    };

    if (!isOpen || !booking._id) return null;

    const student = typeof booking.student === 'object' ? booking.student : null;

    if (!student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Student Profile */}
                    <div className="flex items-start gap-4 mb-6">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            {student.profilePicture ? (
                                <img
                                    src={student.profilePicture}
                                    alt={student.name}
                                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-100">
                                    {student.name?.charAt(0).toUpperCase() || 'S'}
                                </div>
                            )}
                        </div>

                        {/* Student Info */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                {student.name}
                            </h2>
                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                                <AcademicCapIcon className="h-5 w-5" />
                                <span className="text-sm">
                                    {(student.studentProfile?.department && student.studentProfile?.year)
                                        ? `${student.studentProfile.department} • ${student.studentProfile.year} Year`
                                        : student.studentProfile?.studentId || 'Profile incomplete'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-gray-700">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm">
                                {student.phone && student.phone !== "Not provided" ? student.phone : "Not provided"}
                            </span>
                        </div>
                        {student.gender && (
                            <div className="flex items-center gap-3 text-gray-700">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-sm capitalize text-blue-600 font-medium">
                                    {student.gender.replace('_', ' ')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-6" />

                    {/* Session History */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Session History with You
                        </h3>

                        {loading ? (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : sessionStats ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-green-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold text-green-600">{sessionStats.completed}</p>
                                    <p className="text-xs text-green-700">Completed</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold text-blue-600">{sessionStats.upcoming}</p>
                                    <p className="text-xs text-blue-700">Upcoming</p>
                                </div>
                                <div className="bg-yellow-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold text-yellow-600">{sessionStats.pending}</p>
                                    <p className="text-xs text-yellow-700">Pending</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold text-gray-600">{sessionStats.total}</p>
                                    <p className="text-xs text-gray-700">Total Sessions</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No session history available</p>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-6" />

                    {/* View Full Details Button */}
                    <button
                        onClick={handleViewFullDetails}
                        className="w-full mb-4 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <span>View Full Details</span>
                        <ArrowRightIcon className="h-5 w-5" />
                    </button>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        {booking.status === 'pending' && onConfirm && booking._id && (
                            <button
                                onClick={() => {
                                    if (booking._id) onConfirm(booking._id);
                                    onClose();
                                }}
                                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                            >
                                Confirm Booking
                            </button>
                        )}

                        {(booking.status === 'pending' || booking.status === 'confirmed') && onReschedule && (
                            <button
                                onClick={() => {
                                    onReschedule(booking);
                                    onClose();
                                }}
                                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                            >
                                Reschedule
                            </button>
                        )}

                        {booking.status === 'confirmed' && onMarkComplete && booking._id && (
                            <button
                                onClick={() => {
                                    if (booking._id) onMarkComplete(booking._id);
                                    onClose();
                                }}
                                className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
                            >
                                Mark as Completed
                            </button>
                        )}

                        {(booking.status === 'pending' || booking.status === 'confirmed') && onCancel && booking._id && (
                            <button
                                onClick={() => {
                                    if (booking._id) onCancel(booking._id);
                                    onClose();
                                }}
                                className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                            >
                                Cancel Booking
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
