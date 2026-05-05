import apiClient from './axios';

export const availabilityAPI = {
    // Get counselor's availability for a specific date
    getMyAvailability: async (date: string) => {
        const response = await apiClient.get(`/availability/my-slots?date=${date}`);
        return response.data;
    },

    // Get counselor's availability (public - for students)
    getCounselorAvailability: async (counselorId: string, date: string) => {
        const response = await apiClient.get(`/availability/counselor/${counselorId}?date=${date}`);
        return response.data;
    },

    // Create or update slots
    createOrUpdateSlots: async (date: string, slots: any[]) => {
        const response = await apiClient.post('/availability/slots', { date, slots });
        return response.data;
    },

    // Copy from yesterday
    copyFromYesterday: async (date: string) => {
        const response = await apiClient.post('/availability/copy-from-yesterday', { date });
        return response.data;
    },

    // Apply to tomorrow
    applyToTomorrow: async (date: string, slots: any[]) => {
        const response = await apiClient.post('/availability/apply-to-tomorrow', { date, slots });
        return response.data;
    },

    // Delete availability for a date
    deleteAvailability: async (date: string) => {
        const response = await apiClient.delete(`/availability/slots?date=${date}`);
        return response.data;
    }
};
