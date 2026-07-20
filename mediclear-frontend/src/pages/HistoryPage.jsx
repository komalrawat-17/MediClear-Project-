import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // LocalStorage se history fetch karna
    const localSavedHistory = JSON.parse(localStorage.getItem('mediclear_local_history')) || [];
    setReports(localSavedHistory);
  }, []);

  const handleViewResults = (report) => {
    // Pura report object ResultsPage par bhej rahe hain
    navigate('/results', { 
      state: { report: report } 
    });
  };

  const totalUploads = reports.length;
  const latestReport = totalUploads > 0 ? reports[totalUploads - 1] : null;

  const getBarWidth = (value) => {
    // Value ko parse karke percentage nikalna
    const val = parseFloat(value) || 50;
    return Math.min(val > 100 ? 90 : val, 90) + '%';
  };

  return (
    <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 1s ease-in' }}>
      
      <h2 style={{ color: '#1e293b', fontWeight: '400', marginBottom: '30px' }}>
        Patient Analytics Dashboard
      </h2>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Upload History */}
        <div className="dashboard-card" style={{ flex: 1, minWidth: '350px', background: 'rgba(255,255,255,0.7)', padding: '25px', borderRadius: '20px', border: '1px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#475569', fontSize: '16px', marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
            Your Uploaded Reports ({totalUploads})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {totalUploads === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                No records found.
              </div>
            ) : (
              reports.map((report, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '14px', background: 'rgba(255,255,255,0.5)', borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  <div style={{ fontWeight: '500', fontSize: '14px', color: '#334155' }}>
                    📄 {report.file_name}
                  </div>
                  <button
                    onClick={() => handleViewResults(report)}
                    style={{ 
                      fontSize: '12px', padding: '6px 16px', borderRadius: '10px', 
                      fontWeight: '600', background: '#3b82f6', color: '#fff', 
                      border: 'none', cursor: 'pointer', transition: 'background 0.3s' 
                    }}
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Trends */}
        {latestReport && (
          <div className="dashboard-card" style={{ flex: 1, minWidth: '300px', background: 'rgba(255,255,255,0.7)', padding: '25px', borderRadius: '20px', border: '1px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#475569', fontSize: '16px', marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
              Biomarker Tracking Trends
            </h3>
            
            {latestReport.test_values?.map((test, index) => (
              <div key={index} style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                  <span style={{ color: '#334155' }}>{test.test_name}</span>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{test.value}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                  <div style={{ 
                    width: getBarWidth(test.value), 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', 
                    borderRadius: '4px',
                    transition: 'width 1.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                  }}></div>
                </div>
              </div>
            ))}
            <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '20px' }}>
              * Visualized from latest report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}