// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../auth';

/**
 * Simple protected route:
 * - If token exists, render children.
 * - Otherwise redirect to /login.
 *
 * If you need to validate the token with the backend,
 * replace the local token check with a request to /api/admin/me.
 */
export default function ProtectedRoute({ children }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // quick local check
    const token = getToken();
    if (token) {
      setAuthed(true);
      setReady(true);
      return;
    }

    // Optionally: verify token by calling backend
    // fetch('/api/admin/me', { credentials: 'include' }).then(...)

    setAuthed(false);
    setReady(true);
  }, []);

  if (!ready) return null; // or a spinner

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
