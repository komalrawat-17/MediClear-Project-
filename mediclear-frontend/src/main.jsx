import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import "./Global.css"; // Agar aap Global.css use kar rahe hain

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);