'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { availabilityAPI } from '@/lib/api/availability';
import {
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    CheckIcon,
    PlusCircleIcon,
    ClipboardDocumentCheckIcon,
    ArrowRightCircleIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format, addDays, subDays, startOfDay, isSameDay } from 'date-fns';

export default function AvailabilitySettings() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [slots, setSlots] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchAvailability = async (date: Date) => {
        setIsLoading(true);
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const data = await availabilityAPI.getMyAvailability(formattedDate);
            setSlots(data.slots || []);
        } catch (error) {
            toast.error('Failed to fetch availability');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailability(selectedDate);
    }, [selectedDate]);

    const defaultSlots = [
        '09:00-10:00', '10:00-11:00', '11:00-12:00',
        '12:00-13:00', '13:00-14:00', '14:00-15:00',
        '15:00-16:00', '16:00-17:00', '17:00-18:00',
        '18:00-19:00', '19:00-20:00', '20:00-21:00'
    ].map(s => ({
        startTime: s.split('-')[0],
        endTime: s.split('-')[1],
        isBooked: false
    }));

    const handleToggleSlot = (slot: any) => {
        const exists = slots.find(s => s.startTime === slot.startTime);
        if (exists) {
            if (exists.isBooked) {
                toast.error('Cannot remove a booked slot');
                return;
            }
            setSlots(slots.filter(s => s.startTime !== slot.startTime));
        } else {
            setSlots([...slots, slot].sort((a, b) => a.startTime.localeCompare(b.startTime)));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            await availabilityAPI.createOrUpdateSlots(formattedDate, slots);
            toast.success('Availability saved successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save availability');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyFromYesterday = async () => {
        try {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            const data = await availabilityAPI.copyFromYesterday(formattedDate);
            setSlots(data.slots || []);
            toast.success('Slots copied from yesterday');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'No slots found for yesterday');
        }
    };

    const handleApplyToTomorrow = async () => {
        try {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            await availabilityAPI.applyToTomorrow(formattedDate, slots);
            toast.success('Slots applied to tomorrow');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to apply to tomorrow');
        }
    };

    const handleDeleteDay = async () => {
        if (slots.some(s => s.isBooked)) {
            toast.error('Cannot delete day with booked slots');
            return;
        }

        if (!confirm('Are you sure you want to clear all slots for this day?')) return;

        try {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            await availabilityAPI.deleteAvailability(formattedDate);
            setSlots([]);
            toast.success('Availability cleared for this day');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to clear availability');
        }
    };

    const isPastDate = startOfDay(selectedDate) < startOfDay(new Date());

    return (
        <Card>
            <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Availability Management</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your appointment slots for counseling sessions</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyFromYesterday}
                        disabled={isPastDate}
                    >
                        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
                        Copy from Yesterday
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyToTomorrow}
                        disabled={isPastDate || slots.length === 0}
                    >
                        <ArrowRightCircleIcon className="h-4 w-4 mr-2" />
                        Apply to Tomorrow
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Date Selector */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                        className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                    </button>

                    <div className="text-center">
                        <div className="flex items-center gap-2 justify-center text-purple-600 font-bold mb-1">
                            <CalendarIcon className="h-5 w-5" />
                            <span>{format(selectedDate, 'MMMM yyyy')}</span>
                        </div>
                        <div className="text-2xl font-black text-gray-900 truncate">
                            {format(selectedDate, 'EEEE, do')}
                            {isSameDay(selectedDate, new Date()) && (
                                <span className="ml-2 text-sm font-medium px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full align-middle">
                                    Today
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                        className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                {/* Slots Grid */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <PlusCircleIcon className="h-5 w-5 text-purple-600" />
                            Time Slots (9 AM - 9 PM)
                        </h3>
                        <span className="text-sm text-gray-500">{slots.length} slots selected</span>
                    </div>

                    {isPastDate ? (
                        <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Cannot manage availability for past dates</p>
                        </div>
                    ) : isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {defaultSlots.map((slot) => {
                                const activeSlot = slots.find(s => s.startTime === slot.startTime);
                                const isSelected = !!activeSlot;
                                const isBooked = activeSlot?.isBooked;

                                return (
                                    <button
                                        key={slot.startTime}
                                        onClick={() => !isBooked && handleToggleSlot(slot)}
                                        disabled={isBooked}
                                        className={`
                      relative group flex items-center justify-between p-3 rounded-xl border-2 transition-all text-sm font-bold
                      ${isBooked
                                                ? 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                                                : isSelected
                                                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100'
                                                    : 'bg-white border-gray-100 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                                            }
                    `}
                                    >
                                        <span>{slot.startTime} - {slot.endTime}</span>
                                        {isSelected ? (
                                            isBooked ? (
                                                <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">Booked</span>
                                            ) : (
                                                <CheckIcon className="h-4 w-4" />
                                            )
                                        ) : (
                                            <PlusIcon className="h-4 w-4 text-gray-300 group-hover:text-purple-400" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {!isPastDate && (
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <Button
                            variant="outline"
                            className="text-red-500 hover:bg-red-50 hover:border-red-200 border-gray-200"
                            onClick={handleDeleteDay}
                        >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Clear All Slots
                        </Button>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => fetchAvailability(selectedDate)}
                                disabled={isSaving}
                            >
                                Discard
                            </Button>
                            <Button
                                onClick={handleSave}
                                isLoading={isSaving}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <CheckIcon className="h-4 w-4 mr-2" />
                                Save Availability
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
