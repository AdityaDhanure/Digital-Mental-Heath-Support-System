import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema({
    startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    }
}, { _id: true });

const availabilitySchema = new mongoose.Schema({
    counselor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    slots: [availabilitySlotSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
availabilitySchema.index({ counselor: 1, date: 1 }, { unique: true });
availabilitySchema.index({ counselor: 1, date: 1, 'slots.isBooked': 1 });

// Pre-save middleware to update timestamps
availabilitySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get available slots for a counselor on a specific date
availabilitySchema.statics.getAvailableSlots = async function (counselorId, date) {
    const [year, month, day] = date.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const availability = await this.findOne({
        counselor: counselorId,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    if (!availability) {
        return [];
    }

    return availability.slots.filter(slot => !slot.isBooked);
};

// Static method to check if a slot is available
availabilitySchema.statics.isSlotAvailable = async function (counselorId, date, startTime, endTime) {
    const [year, month, day] = date.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const availability = await this.findOne({
        counselor: counselorId,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    if (!availability) {
        return false;
    }

    const slot = availability.slots.find(
        s => s.startTime === startTime && s.endTime === endTime && !s.isBooked
    );

    return !!slot;
};

// Instance method to mark slot as booked
availabilitySchema.methods.bookSlot = async function (startTime, endTime, bookingId) {
    const slot = this.slots.find(
        s => s.startTime === startTime && s.endTime === endTime && !s.isBooked
    );

    if (!slot) {
        throw new Error('Slot not available');
    }

    slot.isBooked = true;
    slot.bookingId = bookingId;
    await this.save();
    return slot;
};

// Instance method to release slot
availabilitySchema.methods.releaseSlot = async function (startTime, endTime) {
    const slot = this.slots.find(
        s => s.startTime === startTime && s.endTime === endTime
    );

    if (slot) {
        slot.isBooked = false;
        slot.bookingId = null;
        await this.save();
    }
    return slot;
};

// Instance method to get available slots
availabilitySchema.methods.getAvailableSlots = function () {
    return this.slots.filter(slot => !slot.isBooked);
};

// Static method to get default time slots (9 AM - 9 PM)
availabilitySchema.statics.getDefaultSlots = function () {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        slots.push({
            startTime,
            endTime,
            isBooked: false,
            bookingId: null
        });
    }
    return slots;
};

// Static method to find availability by counselor and date range
availabilitySchema.statics.findByCounselorAndDate = async function (counselorId, date) {
    const [year, month, day] = date.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    return await this.findOne({
        counselor: counselorId,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });
};

const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;
