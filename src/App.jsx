
import React, { useState, useEffect } from "react";
import AdminApartments from "./pages/AdminApartments";
import Login from "./components/Login";
// Note: You should update your ApartmentService calls to include the token in headers.

// Helper function to check if the token is present (basic check)
const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  // Function to handle successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };
  
  // Optional: Function to handle logout (you might add a Logout button to AdminApartments)
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    // Once logged in, show the admin area.
    // Pass the logout function down if you want a logout button.
    return <AdminApartments onLogout={handleLogout} />;
  } else {
    // If not logged in, show the login form.
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
}