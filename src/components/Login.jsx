
import React, { useState } from 'react';
import { loginUser } from '../service/AuthService.js';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Both username and password are required.');
      setLoading(false);
      return;
    }

    try {
      const token = await loginUser(username, password);

      // Save the token to local storage
      localStorage.setItem('authToken', token);
      console.log('Login successful. Token saved.');
      
      // Call the prop function to update the parent state (App.jsx) and redirect
      onLoginSuccess();
    } catch (err) {
      // Display the error message from the API or service
      setError(err.message || 'An unexpected login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Admin Login 
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm font-medium text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}