// src/service/ApartmentService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_ENDPOINT = `${API_BASE_URL}/api/apartment-service`;
// Ensure your .env file has a variable like VITE_X_API_KEY=supersecretinternalapikey
const apiKey = import.meta.env.VITE_X_API_KEY; // For Vite
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 

// Base URL for Cloudinary's unsigned upload API
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Helper function to retrieve the JWT and construct the necessary headers,
 * including the API Key for the backend's internal validation.
 * Throws an error if the user's JWT token is missing.
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    
    // Check for the user's JWT token
    if (!token) {
        throw new Error('Authentication token not found. Please log in.');
    }
    
    // Check for the API Key (optional, but good for debugging if missing)
    if (!apiKey) {
        // API key missing - requests may fail
    }
    
    return {
        'Content-Type': 'application/json',
        // 1. JWT for user authentication
        'Authorization': `Bearer ${token}`, 
        // 2. API Key for server/service validation (as required by your backend error)
        'x-api-key': apiKey 
    };
};

/**
 * Handles common HTTP error responses.
 */
const handleResponse = async (response) => {
    if (response.status === 401) {
        // Handle Unauthorized: Token is missing, expired, or invalid.
        localStorage.removeItem('authToken');
        throw new Error('Session expired or invalid token. Please log in again.');
    }
    
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorBody.message || errorBody.error || `Request failed with status ${response.status}`);
    }
    
    return response.json();
};

export const uploadFilesToCloudinary = async (files) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error("Cloudinary configuration (Cloud Name or Preset) is missing from environment variables.");
    }
    
    if (files.length === 0) return [];
    
    try {
        const uploadPromises = files.map(file => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            
            // Optimize image quality and format for best quality
            // quality: 'auto' uses Cloudinary's AI to determine optimal quality
            // You can also use a specific value like '90' or '100' for maximum quality
            formData.append('quality', 'auto:best'); // Best quality with auto optimization
            
            // Automatically convert to best format (WebP when supported, original otherwise)
            formData.append('fetch_format', 'auto');
            
            // Enable automatic format optimization
            formData.append('flags', 'immutable_cache');
            
            // Optional: Include an identifier if you want to use the hotelId
            // formData.append('public_id', `${hotelId}-${file.name}`);

            return fetch(CLOUDINARY_UPLOAD_URL, {
                method: 'POST',
                body: formData,
            });
        });

        const responses = await Promise.all(uploadPromises);
        const results = await Promise.all(responses.map(handleResponse));
        
        // Cloudinary returns the secure_url in the response body
        // The URL already includes the transformations we specified
        return results.map(result => result.secure_url);

    } catch (error) {
        throw error;
    }
}


// --- CRUD Operations (NO CHANGES HERE, they automatically use the new headers) ---

export const saveApartment = async (apartmentData) => {
    try {
        const response =  await fetch(`${API_ENDPOINT}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(apartmentData)
        });

        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
}

export const getApartments = async () => {
    try {
        const response =  await fetch(`${API_ENDPOINT}/all`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        return await handleResponse(response);
    }
    catch (error) {
        throw error;
    }
}

export const updateApartment = async (apartmentData) => {
    try {
        const response =  await fetch(`${API_ENDPOINT}/${apartmentData.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(apartmentData)
        });

        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
}

export const deleteApartment = async (apartmentId) => {
    try {
        const response = await fetch(`${API_ENDPOINT}/${apartmentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.status === 204 || response.ok) {
            return { message: 'Apartment deleted successfully' };
        }

        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
}
