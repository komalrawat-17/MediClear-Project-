import { useState } from "react";
import AuthPage from "./pages/AuthPage";

export default function App() {
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("mediclear_token");
    setUser(null);
  };

  // Not logged in yet — show the Login/Signup screen
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Logged in — placeholder for now, real Upload screen comes next
  return (
    <div style={{ fontFamily: "'Work Sans', sans-serif", padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
      <h1>Welcome, {user.user_metadata?.full_name || user.email}</h1>
      <p>You're logged in. The Upload screen goes here next.</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}