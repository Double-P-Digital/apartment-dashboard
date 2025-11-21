// src/service/ApartmentService.js

const API_BASE_URL = 'http://localhost:3000/api/apartment-service'; 
// Ensure your .env file has a variable like VITE_X_API_KEY=supersecretinternalapikey
const apiKey = import.meta.env.VITE_X_API_KEY; // For Vite

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
        console.warn("VITE_X_API_KEY is missing from environment configuration.");
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


// --- CRUD Operations (NO CHANGES HERE, they automatically use the new headers) ---

export const saveApartment = async (apartmentData) => {
    try {
        const response =  await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(apartmentData)
        });

        return await handleResponse(response);
    } catch (error) {
        console.error("Error saving apartment:", error);
        throw error;
    }
}

export const getApartments = async () => {
    try {
        const response =  await fetch(`${API_BASE_URL}/all`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        return await handleResponse(response);
    }
    catch (error) {
        console.error("Error fetching apartments:", error);
        throw error;
    }
}

export const updateApartment = async (apartmentData) => {
    try {
        const response =  await fetch(`${API_BASE_URL}/${apartmentData.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(apartmentData)
        });

        return await handleResponse(response);
    } catch (error) {
        console.error("Error updating apartment:", error);
        throw error;
    }
}

export const deleteApartment = async (apartmentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${apartmentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.status === 204 || response.ok) {
            return { message: 'Apartment deleted successfully' };
        }

        return await handleResponse(response);
    } catch (error) {
        console.error("Error deleting apartment:", error);
        throw error;
    }
}

// // src/service/ApartmentService.js

// const API_BASE_URL = 'http://localhost:3000/api/apartments'; 
// const apiKey = import.meta.env.VITE_X_API_KEY; // For Vite

// /**
//  * Helper function to retrieve the JWT and construct the necessary headers.
//  * Throws an error if the token is missing.
//  */
// const getAuthHeaders = () => {
//     const token = localStorage.getItem('authToken');
//     if (!token) {
//         // In a real app, you would redirect the user to the login page here.
//         throw new Error('Authentication token not found. Please log in.');
//     }
//     return {
//         'Content-Type': 'application/json',
//         // Replacing 'x-api-key' with the JWT Authorization header
//         'Authorization': `Bearer ${token}` 
//     };
// };

// /**
//  * Handles common HTTP error responses.
//  */
// const handleResponse = async (response) => {
//     if (response.status === 401) {
//         // Handle Unauthorized: Token is missing, expired, or invalid.
//         // **Crucial for security:** Force logout and redirect.
//         localStorage.removeItem('authToken');
//         // A full application would also trigger a UI redirect here, 
//         // e.g., window.location.href = '/login';
//         throw new Error('Session expired or invalid token. Please log in again.');
//     }
    
//     if (!response.ok) {
//         const errorBody = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
//         throw new Error(errorBody.message || errorBody.error || `Request failed with status ${response.status}`);
//     }
    
//     // Return the JSON data for successful responses
//     return response.json();
// };


// // --- CRUD Operations ---

// export const saveApartment = async (apartmentData) => {
//     try {
//         const response =  await fetch(`${API_BASE_URL}`, {
//             method: 'POST',
//             headers: getAuthHeaders(), // Use JWT headers
//             body: JSON.stringify(apartmentData)
//         });

//         return await handleResponse(response);
//     } catch (error) {
//         console.error("Error saving apartment:", error);
//         throw error; // Re-throw the error for component handling
//     }
// }

// export const getApartments = async () => {
//     try {
//         const response =  await fetch(`${API_BASE_URL}/all`, {
//             method: 'GET',
//             headers: getAuthHeaders(), // Use JWT headers
//         });

//         return await handleResponse(response);
//     }
//     catch (error) {
//         console.error("Error fetching apartments:", error);
//         throw error;
//     }
// }

// export const updateApartment = async (apartmentData) => {
//     try {
//         const response =  await fetch(`${API_BASE_URL}/${apartmentData.id}`, {
//             method: 'PUT',
//             headers: getAuthHeaders(), // Use JWT headers
//             body: JSON.stringify(apartmentData)
//         });

//         return await handleResponse(response);
//     } catch (error) {
//         console.error("Error updating apartment:", error);
//         throw error;
//     }
// }

// export const deleteApartment = async (apartmentId) => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/${apartmentId}`, {
//             method: 'DELETE',
//             headers: getAuthHeaders(), // Use JWT headers
//         });

//         // DELETE usually returns a 204 No Content or success message
//         if (response.status === 204 || response.ok) {
//             return { message: 'Apartment deleted successfully' };
//         }

//         return await handleResponse(response);
//     } catch (error) {
//         console.error("Error deleting apartment:", error);
//         throw error;
//     }
// }

// export const saveApartment = async (apartmentData) => {
//     try {
//         const response =  await fetch('http://localhost:3000/api/apartments', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-api-key': 'supersecretinternalapikey'
//             },
//             body: JSON.stringify(apartmentData)
//         });

//         return await response.json();
//     } catch (error) {
//         return error;
//     }
// }

// export const getApartments = async () => {
//     try {
//         const response =  await fetch('http://localhost:3000/api/apartments/all', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-api-key': 'supersecretinternalapikey'
//             },
//         });

//         return await response.json();
//     }
//     catch (error) {
//         return error;
//     }
// }

// export const updateApartment = async (apartmentData) => {
//     try {
//         const response =  await fetch(`http://localhost:3000/api/apartments/${apartmentData.id}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-api-key': 'supersecretinternalapikey'
//             },
//             body: JSON.stringify(apartmentData)
//         });

//         return await response.json();
//     } catch (error) {
//         return error;
//     }
// }

// export const deleteApartment = async (apartmentId) => {}