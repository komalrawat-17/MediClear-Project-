import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";

const API_URL = "http://localhost:5000";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On first load, check if there's a saved token and if it's still valid.
  useEffect(() => {
    const token = localStorage.getItem("mediclear_token");

    if (!token) {
      setCheckingSession(false);
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid session");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        // Token is invalid or expired — clear it and stay logged out.
        localStorage.removeItem("mediclear_token");
      })
      .finally(() => {
        setCheckingSession(false);
      });
  }, []);

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("mediclear_token");
    setUser(null);
  };

  // Still checking if a saved session exists — show a simple loading state
  if (checkingSession) {
    return <p style={{ padding: "2rem", fontFamily: "sans-serif" }}>Loading...</p>;
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div style={{ fontFamily: "'Work Sans', sans-serif", padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
      <h1>Welcome, {user.user_metadata?.full_name || user.email}</h1>
      <p>You're logged in. The Upload screen goes here next.</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}