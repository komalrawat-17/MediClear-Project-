import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Pehle location.state check karo, agar wahan nahi hai toh sessionStorage se uthao
  let reportData = location.state?.report;

  if (!reportData) {
    const saved = sessionStorage.getItem('last_viewed_report');
    if (saved) {
      reportData = JSON.parse(saved);
    }
  } else {
    // 2. Agar state se data mila hai, toh usse sessionStorage mein save kar lo
    sessionStorage.setItem('last_viewed_report', JSON.stringify(reportData));
  }

  const results = reportData?.test_values || [];
  const fileName = reportData?.file_name || "Unknown Report";

  // Status style helper
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Normal': return { background: '#e6f4ea', color: '#137333', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' };
      case 'Monitor': return { background: '#fef7e0', color: '#b06000', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' };
      case 'Consult Doctor Soon': return { background: '#fce8e6', color: '#c5221f', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' };
      default: return { background: '#eee', color: '#333', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' };
    }
  };

  // Agar data phir bhi nahi milta
  if (!reportData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Report data not found!</h2>
        <button onClick={() => navigate('/history')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <button 
        onClick={() => navigate('/history')} 
        style={{ marginBottom: '20px', padding: '8px 16px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
      >
        ← Back to History
      </button>

      <div style={{ marginBottom: '20px' }}>
        <h2>Results for: {fileName}</h2>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <thead>
          <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
            <th style={{ padding: '15px' }}>Test</th>
            <th style={{ padding: '15px' }}>Your Value</th>
            <th style={{ padding: '15px' }}>Reference Range</th>
            <th style={{ padding: '15px' }}>Status</th>
            <th style={{ padding: '15px' }}>Explanation</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '15px', fontWeight: '600' }}>{item.test_name}</td>
              <td style={{ padding: '15px' }}>{item.value}</td>
              <td style={{ padding: '15px', color: '#64748b' }}>{item.reference_range || 'N/A'}</td>
              <td style={{ padding: '15px' }}>
                <span style={getStatusStyle(item.status)}>{item.status || 'N/A'}</span>
              </td>
              <td style={{ padding: '15px', fontSize: '14px', color: '#475569' }}>{item.explanation || 'No explanation available'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button 
        onClick={() => navigate('/upload')}
        style={{ marginTop: '30px', padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
      >
        Upload Another Report
      </button>
    </div>
  );
}