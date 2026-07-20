import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './Global.css';
import UploadPage from './pages/UploadPage';
import HistoryPage from './pages/HistoryPage';
import ResultsPage from './pages/ResultsPage'; // <--- ResultsPage import add karein
import AuthPage from './pages/AuthPage';

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('mediclear_user')));

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <nav className="navbar-glass">
        <span style={{ fontWeight: 'bold', fontSize: '20px', marginRight: '20px' }}>MediClear</span>
        
        {user && (
          <>
            <Link to="/upload" style={{ marginRight: '15px', textDecoration: 'none', color: '#334' }}>Upload</Link>
            <Link to="/history" style={{ textDecoration: 'none', color: '#334' }}>History</Link>
            
            {/* Ye part aapke navbar mein missing tha */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span>Hi, {user.name || 'Priya'}</span>
              <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</button>
            </div>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={user ? <Navigate to="/history" /> : <AuthPage onAuthSuccess={setUser} />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/results" element={<ResultsPage />} /> {/* <--- Results Route zaroori hai */}
      </Routes>
    </Router>
  );
}