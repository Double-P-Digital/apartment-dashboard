// src/service/ReservationService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_ENDPOINT = `${API_ENDPOINT}/api/reservation-service`;
const apiKey = import.meta.env.VITE_X_API_KEY;

/**
 * Helper function to retrieve the JWT and construct the necessary headers.
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        throw new Error('Authentication token not found. Please log in.');
    }
    
    if (!apiKey) {
        // API key missing - requests may fail
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': apiKey
    };
};

/**
 * Handles common HTTP error responses.
 */
const handleResponse = async (response) => {
    if (response.status === 401) {
        localStorage.removeItem('authToken');
        throw new Error('Session expired or invalid token. Please log in again.');
    }
    
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorBody.message || errorBody.error || `Request failed with status ${response.status}`);
    }
    
    return response.json();
};

/**
 * Get all reservations that failed to sync with PynBooking
 */
export const getFailedReservations = async () => {
    try {
        const response = await fetch(`${API_ENDPOINT}/failed`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};

/**
 * Retry syncing a failed reservation with PynBooking
 */
export const retryReservationSync = async (reservationId) => {
    try {
        const response = await fetch(`${API_ENDPOINT}/${reservationId}/retry-sync`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};

/**
 * Mark a failed reservation as manually resolved
 */
export const markReservationResolved = async (reservationId, notes = '') => {
    try {
        const response = await fetch(`${API_ENDPOINT}/${reservationId}/mark-resolved`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ notes }),
        });

        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};



