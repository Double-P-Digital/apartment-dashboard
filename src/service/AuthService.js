const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_ENDPOINT = `${API_BASE_URL}/api/auth-service`;
// Use the same apiKey variable setup as in your other services
const apiKey = import.meta.env.VITE_X_API_KEY; 

/**
 * Handles the user login request.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<string>} The JWT token received from the backend.
 */
export async function loginUser(username, password) {
  try {
    // 1. FIX: Append '/login' to reach the correct backend route
    const response = await fetch(`${API_ENDPOINT}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 2. FIX: Include the API Key as required by your backend infrastructure
        'x-api-key': apiKey, 
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      // Throw an error with the response message for handling in the component
      const errorData = await response.json().catch(() => ({ message: `Login failed with HTTP status ${response.status}` }));
      throw new Error(errorData.message || 'Login failed due to server error');
    }

    const data = await response.json();
    // The backend service returns { token: string }, so we extract the token.
    return data.token;
  } catch (error) {
    // Re-throw the error to be caught by the component
    throw error;
  }
}

