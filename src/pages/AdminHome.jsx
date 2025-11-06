// src/pages/AdminHome.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../auth';

export default function AdminHome() {
  const navigate = useNavigate();

  function handleLogout() {
    // clear client-side token (if any)
    clearToken();
    // if backend uses cookies, also call logout endpoint to clear cookie
    // fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });

    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded">
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        <h3 className="text-xl font-medium mb-4">Welcome, Admin</h3>

        <div className="bg-white p-6 rounded shadow">
          
          <div className="mt-4">
            <button className="px-3 py-2 bg-indigo-600 text-white rounded">Manage Apartments</button>
          </div>
        </div>
      </main>
    </div>
  );
}
