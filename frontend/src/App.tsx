import React, { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen"; // Import the new LoginScreen

import { message } from "antd"; // Import AntD components

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import "./App.css"; // Keep this for any custom overrides or global styles
import Dashboard from "./components/Dashboard";

// Root App component for routing and authentication flow
function App() {
  const [authToken, setAuthToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem("username")
  );
  const navigate = useNavigate(); // This hook must be inside Router

  useEffect(() => {
    // Check local storage for token on initial load
    const storedToken = localStorage.getItem("authToken");
    const storedUsername = localStorage.getItem("username");
    if (storedToken && storedUsername) {
      setAuthToken(storedToken);
      setUsername(storedUsername);
    }
  }, []);

  const handleLoginSuccess = (token: string, user: string) => {
    setAuthToken(token);
    setUsername(user);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUsername(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    localStorage.clear();
    message.info("Logged out successfully.");
    navigate("/login"); // Redirect to login page
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginScreen onLoginSuccess={handleLoginSuccess} />}
      />
      <Route
        path="/"
        element={
          authToken && username ? (
            <Dashboard
              onLogout={handleLogout}
            />
          ) : (
            <LoginScreen onLoginSuccess={handleLoginSuccess} /> // Redirect to login if not authenticated
          )
        }
      />
      {/* Add a catch-all route for unmatched paths, redirect to home or login */}
      <Route
        path="*"
        element={
          authToken && username ? (
            <Dashboard
              onLogout={handleLogout}
            />
          ) : (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          )
        }
      />
    </Routes>
  );
}

export default App;
