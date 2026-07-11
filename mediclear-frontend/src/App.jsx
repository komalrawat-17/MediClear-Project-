import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import UploadPage from "./pages/UploadPage";

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
  return <UploadPage user={user} onLogout={handleLogout} />;
}