import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Payment from "./components/payment";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
    navigate("/payment"); // Redirect to payment page after registration
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // ProtectedRoute component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <Login
            onSuccess={handleLoginSuccess}
            onToggle={() => (window.location.href = "/register")}
          />
        }
      />
      <Route
        path="/register"
        element={
          <Register
            onSuccess={handleRegisterSuccess}
            onToggle={() => (window.location.href = "/login")}
          />
        }
      />
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <Payment onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      {/* Catch-all route */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;