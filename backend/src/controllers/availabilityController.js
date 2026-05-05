import Availability from '../models/Availability.js';
import logger from '../utils/logger.js';

// Get counselor's availability for a specific date
export const getMyAvailability = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        // Parse date string and create UTC date range
        const [year, month, day] = date.split('-').map(Number);
        const startOfDay = new Date(Date.UTC(year, month - 1, day));
        const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        const availability = await Availability.findOne({
            counselor: req.user.id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (!availability) {
            return res.json({ slots: [] });
        }

        res.json(availability);
    } catch (error) {
        logger.error('Error fetching availability:', error);
        res.status(500).json({ message: 'Failed to fetch availability' });
    }
};

// Get counselor's availability (public - for students)
export const getCounselorAvailability = async (req, res) => {
    try {
        const { counselorId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        // Parse date string and create UTC date range
        const [year, month, day] = date.split('-').map(Number);
        const startOfDay = new Date(Date.UTC(year, month - 1, day));
        const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        const availability = await Availability.findOne({
            counselor: counselorId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).populate('counselor', 'name email');

        if (!availability) {
            return res.json({ slots: [] });
        }

        // Only return available slots (not booked)
        const availableSlots = availability.slots.filter(slot => !slot.isBooked);

        res.json({
            ...availability.toObject(),
            slots: availableSlots
        });
    } catch (error) {
        logger.error('Error fetching counselor availability:', error);
        res.status(500).json({ message: 'Failed to fetch availability' });
    }
};

// Create or update availability slots for a date
export const createOrUpdateSlots = async (req, res) => {
    try {
        const { date, slots } = req.body;

        if (!date || !slots || !Array.isArray(slots)) {
            return res.status(400).json({ message: 'Date and slots are required' });
        }

        // Parse date string and create a UTC date at midnight
        const [year, month, day] = date.split('-').map(Number);
        const selectedDate = new Date(Date.UTC(year, month - 1, day));

        // Validate date is not in the past
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return res.status(400).json({ message: 'Cannot set availability for past dates' });
        }

        // Find existing availability or create new
        const nextDay = new Date(selectedDate);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);

        let availability = await Availability.findOne({
            counselor: req.user.id,
            date: {
                $gte: selectedDate,
                $lt: nextDay
            }
        });

        if (availability) {
            // Update existing - preserve booked slots
            const newSlots = slots.map(newSlot => {
                const existingSlot = availability.slots.find(
                    s => s.startTime === newSlot.startTime && s.endTime === newSlot.endTime
                );

                // If slot was already booked, keep it booked
                if (existingSlot && existingSlot.isBooked) {
                    return existingSlot;
                }

                return newSlot;
            });

            availability.slots = newSlots;
            await availability.save();
        } else {
            // Create new availability
            availability = await Availability.create({
                counselor: req.user.id,
                date: selectedDate,
                slots
            });
        }

        res.json(availability);
    } catch (error) {
        logger.error('Error creating/updating availability:', error);
        res.status(500).json({ message: 'Failed to save availability' });
    }
};

// Copy slots from previous day
export const copyFromYesterday = async (req, res) => {
    try {
        const { date } = req.body;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const targetDate = new Date(Date.UTC(year, month - 1, day));
        const yesterday = new Date(targetDate);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setUTCHours(23, 59, 59, 999);

        // Get yesterday's availability using date range
        const yesterdayAvailability = await Availability.findOne({
            counselor: req.user.id,
            date: {
                $gte: yesterday,
                $lte: yesterdayEnd
            }
        });

        if (!yesterdayAvailability || yesterdayAvailability.slots.length === 0) {
            return res.status(404).json({ message: 'No availability found for yesterday' });
        }

        // Copy slots (excluding booked ones)
        const copiedSlots = yesterdayAvailability.slots
            .filter(slot => !slot.isBooked)
            .map(slot => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
                isBooked: false,
                bookingId: null
            }));

        res.json({ slots: copiedSlots });
    } catch (error) {
        logger.error('Error copying from yesterday:', error);
        res.status(500).json({ message: 'Failed to copy availability' });
    }
};

// Apply slots to tomorrow
export const applyToTomorrow = async (req, res) => {
    try {
        const { date, slots } = req.body;

        if (!date || !slots) {
            return res.status(400).json({ message: 'Date and slots are required' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const sourceDate = new Date(Date.UTC(year, month - 1, day));
        const tomorrow = new Date(sourceDate);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setUTCHours(23, 59, 59, 999);

        // Create/update tomorrow's availability using date range
        let tomorrowAvailability = await Availability.findOne({
            counselor: req.user.id,
            date: {
                $gte: tomorrow,
                $lte: tomorrowEnd
            }
        });

        const newSlots = slots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: false,
            bookingId: null
        }));

        if (tomorrowAvailability) {
            // Preserve already booked slots
            const preservedBookedSlots = tomorrowAvailability.slots.filter(s => s.isBooked);
            tomorrowAvailability.slots = [...newSlots, ...preservedBookedSlots];
            await tomorrowAvailability.save();
        } else {
            tomorrowAvailability = await Availability.create({
                counselor: req.user.id,
                date: tomorrow,
                slots: newSlots
            });
        }

        res.json({ message: 'Availability applied to tomorrow', availability: tomorrowAvailability });
    } catch (error) {
        logger.error('Error applying to tomorrow:', error);
        res.status(500).json({ message: 'Failed to apply availability' });
    }
};

// Delete availability for a specific date
export const deleteAvailability = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        // Parse date string and create UTC date range
        const [year, month, day] = date.split('-').map(Number);
        const startOfDay = new Date(Date.UTC(year, month - 1, day));
        const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        const availability = await Availability.findOne({
            counselor: req.user.id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (!availability) {
            return res.status(404).json({ message: 'Availability not found' });
        }

        // Check if any slots are booked
        const hasBookedSlots = availability.slots.some(slot => slot.isBooked);
        if (hasBookedSlots) {
            return res.status(400).json({
                message: 'Cannot delete availability with booked slots'
            });
        }

        await availability.deleteOne();
        res.json({ message: 'Availability deleted successfully' });
    } catch (error) {
        logger.error('Error deleting availability:', error);
        res.status(500).json({ message: 'Failed to delete availability' });
    }
};
