

const API_BASE_URL = 'http://localhost:3000'; // **Modify this URL to match your backend port/domain**

/**
 * Handles the user login request.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<string>} The JWT token received from the backend.
 */
export async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      // Throw an error with the response message for handling in the component
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed due to server error');
    }

    const data = await response.json();
    // The backend service returns { token: string }, so we extract the token.
    return data.token;
  } catch (error) {
    console.error('API Login Error:', error);
    // Re-throw the error to be caught by the component
    throw error;
  }
}