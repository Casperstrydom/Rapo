import React, { useState } from "react";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onToggle={() => setShowRegister(false)} onSuccess={handleRegisterSuccess} />
    ) : (
      <Login onToggle={() => setShowRegister(true)} onSuccess={handleLoginSuccess} />
    );
  }

  return <Home />;
}

export default App;
