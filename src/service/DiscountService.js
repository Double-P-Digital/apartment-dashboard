
const API_BASE_URL = 'http://localhost:3000/api/discount-code-service'; 
const apiKey = import.meta.env.VITE_X_API_KEY; // For Vite

/**
 * Helper function to retrieve the JWT and construct the necessary headers.
 * (Copied from ApartmentService.js for consistency)
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        throw new Error('Authentication token not found. Please log in.');
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
        'x-api-key': apiKey 
    };
};

/**
 * Handles common HTTP error responses (401 logout logic included).
 * (Copied from ApartmentService.js for consistency)
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

// --- CRUD Operations ---

// CREATE
export const saveDiscount = async (discountData) => {
    try {
        const response = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(discountData)
        });

        return await handleResponse(response);
    } catch (error) {
        console.error("Error saving discount:", error);
        throw error;
    }
};

// READ ALL
export const getDiscounts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/all`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        return await handleResponse(response);
    }
    catch (error) {
        console.error("Error fetching discounts:", error);
        throw error;
    }
};

// DELETE
export const deleteDiscount = async (discountId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${discountId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.status === 204 || response.ok) {
            return { message: 'Discount deleted successfully' };
        }

        return await handleResponse(response);
    } catch (error) {
        console.error("Error deleting discount:", error);
        throw error;
    }
};