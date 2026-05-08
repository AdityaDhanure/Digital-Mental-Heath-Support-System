'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { bookingAPI } from '@/lib/api/booking';
import { usePersistentState } from '@/lib/hooks/usePersistentState';
import type { Booking } from '@/types/booking.types';
import { Loading } from '@/components/common/Loading';
import BackButton from '@/components/common/BackButton';
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface StudentSummary {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  studentProfile?: Booking['student']['studentProfile'];
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  upcomingSessions: number;
  lastAppointment?: string;
  nextAppointment?: string;
}

const isUpcomingStatus = (status: Booking['status']) => status === 'pending' || status === 'confirmed';

export default function CounselorStudentsPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = usePersistentState('mindsage:counselor-students:search', '');

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getAllBookings({ limit: 100 });
      setBookings(response?.data?.bookings || []);
    } catch {
      toast.error('Failed to load students');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'counselor') {
      loadStudents();
    } else {
      setLoading(false);
    }
  }, [loadStudents, user?.role]);

  const students = useMemo(() => {
    const map = new Map<string, StudentSummary>();
    const now = new Date();

    bookings.forEach((booking) => {
      if (!booking.student?._id) return;

      const existing = map.get(booking.student._id) ?? {
        _id: booking.student._id,
        name: booking.student.name,
        email: booking.student.email,
        phone: booking.student.phone,
        studentProfile: booking.student.studentProfile,
        totalSessions: 0,
        completedSessions: 0,
        pendingSessions: 0,
        upcomingSessions: 0,
      };

      const appointmentDate = new Date(booking.appointmentDate);
      existing.totalSessions += 1;
      existing.completedSessions += booking.status === 'completed' ? 1 : 0;
      existing.pendingSessions += booking.status === 'pending' ? 1 : 0;
      existing.upcomingSessions += isUpcomingStatus(booking.status) && appointmentDate >= now ? 1 : 0;

      if (!existing.lastAppointment || appointmentDate > new Date(existing.lastAppointment)) {
        existing.lastAppointment = appointmentDate.toISOString();
      }

      if (isUpcomingStatus(booking.status) && appointmentDate >= now) {
        if (!existing.nextAppointment || appointmentDate < new Date(existing.nextAppointment)) {
          existing.nextAppointment = appointmentDate.toISOString();
        }
      }

      map.set(booking.student._id, existing);
    });

    return Array.from(map.values()).sort((a, b) => {
      const aDate = a.nextAppointment || a.lastAppointment || '';
      const bDate = b.nextAppointment || b.lastAppointment || '';
      return bDate.localeCompare(aDate);
    });
  }, [bookings]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) => {
      const studentId = student.studentProfile?.studentId || '';
      const department = student.studentProfile?.department || '';
      return [student.name, student.email, student.phone, studentId, department]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    });
  }, [search, students]);

  if (loading) {
    return <Loading />;
  }

  if (user?.role !== 'counselor') {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <BackButton className="mb-6" />
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900">Students are available for counselors only</h1>
          <p className="text-sm text-gray-500 mt-2">Use the dashboard navigation for your role.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <BackButton />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-sm text-gray-500 mt-1">
            Students who have booked sessions with you.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search students"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{students.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Upcoming Sessions</p>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {students.reduce((sum, student) => sum + student.upcomingSessions, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Completed Sessions</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {students.reduce((sum, student) => sum + student.completedSessions, 0)}
          </p>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <UserCircleIcon className="mx-auto h-14 w-14 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {students.length === 0 ? 'No students yet' : 'No matching students'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {students.length === 0
              ? 'Students will appear here after they book sessions with you.'
              : 'Try a different name, email, student ID, or department.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredStudents.map((student) => (
            <Link
              key={student._id}
              href={`/dashboard/students/${student._id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm transition hover:border-purple-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-lg font-bold text-purple-700">
                    {student.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{student.name}</h2>
                    <p className="text-xs text-gray-500">
                      {student.studentProfile?.studentId || 'Student ID not set'}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {student.totalSessions} session{student.totalSessions === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-gray-600">
                {student.email && (
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{student.email}</span>
                  </div>
                )}
                {student.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span>{student.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                  <span>
                    {student.nextAppointment
                      ? `Next: ${new Date(student.nextAppointment).toLocaleDateString()}`
                      : student.lastAppointment
                        ? `Last: ${new Date(student.lastAppointment).toLocaleDateString()}`
                        : 'No appointment date'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  {student.completedSessions} completed
                </span>
                <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
                  {student.pendingSessions} pending
                </span>
                {student.studentProfile?.department && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {student.studentProfile.department}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
