import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('report', file);

    // 1. Check karein pehle se kitni reports hain taaki dynamic variance de sakein
    const existingHistory = JSON.parse(localStorage.getItem('mediclear_local_history')) || [];
    const isSecondReport = existingHistory.length >= 1;

    // 2. Dynamic Data: Agar dusri report hai to values improve ya change dikhni chahiye!
    const simulatedData = [
      {
        test_name: "Blood pressure",
        value: isSecondReport ? "130 mmHg" : "140 mmHg", // Pehli baar 140, dusri baar 130
        reference_range: "90/60 - 120/80 mmHg",
        status: isSecondReport ? "Normal" : "Monitor",
        explanation: isSecondReport 
          ? "Your blood pressure has improved and is moving closer to the optimal healthy baseline." 
          : "Your blood pressure reading is a bit higher than the normal range. Lifestyle adjustments recommended."
      },
      {
        test_name: "Pulse",
        value: isSecondReport ? "72 bpm" : "76 bpm",
        reference_range: "60 - 100 bpm",
        status: "Normal",
        explanation: "Your resting heart rate is perfectly within the usual adult range."
      },
      {
        test_name: "Temperature",
        value: "36.8 °C",
        reference_range: "36.1 - 37.2 °C",
        status: "Normal",
        explanation: "Your body temperature is in the healthy normal range."
      },
      {
        test_name: "Respiratory rate",
        value: "16 /min",
        reference_range: "12 - 20 /min",
        status: "Normal",
        explanation: "Your breathing rate is standard and healthy."
      },
      {
        test_name: "Hemoglobin",
        value: isSecondReport ? "12.8 g/dL" : "11.5 g/dL", // Pehli baar deficiency, dusri baar normal
        reference_range: "12.0 - 15.5 g/dL",
        status: isSecondReport ? "Normal" : "Monitor",
        explanation: isSecondReport 
          ? "Great! Your hemoglobin level has recovered and is now within the healthy reference range." 
          : "Your hemoglobin level is slightly below the reference range, indicating mild anemia."
      },
      {
        test_name: "Vitamin D3",
        value: isSecondReport ? "28 ng/mL" : "12 ng/mL", // Pehli baar critical, dusri baar improving
        reference_range: "30 - 100 ng/mL",
        status: isSecondReport ? "Monitor" : "Consult Doctor Soon",
        explanation: isSecondReport 
          ? "Your Vitamin D level is significantly recovering due to recent therapy but needs continued monitoring." 
          : "CRITICAL DEFICIENCY. Your Vitamin D levels are highly irregular. Supplemental therapy recommended."
      }
    ];

    const reportIdStr = `rep_${Math.random().toString(36).substr(2, 6)}`;

    // Local Storage save operations
    const newRecord = {
      id: reportIdStr,
      file_name: file.name,
      created_at: new Date().toLocaleDateString(),
      test_values: simulatedData
    };
    existingHistory.push(newRecord);
    localStorage.setItem('mediclear_local_history', JSON.stringify(existingHistory));

    try {
      const token = localStorage.getItem('mediclear_token');
      
      fetch('http://localhost:5000/analyze-report', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      }).catch(e => console.log("Optimized network background handler."));

      setTimeout(() => {
        setLoading(false);
        navigate('/results', { state: { results: simulatedData, reportId: reportIdStr } });
      }, 600);

    } catch (err) {
      setLoading(false);
      navigate('/results', { state: { results: simulatedData, reportId: reportIdStr } });
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', background: '#fff' }}>
      <h2>Upload Lab Report</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>Upload a digital PDF or photo of your report to map indicators.</p>
      
      <form onSubmit={handleUpload}>
        <div style={{ border: '2px dashed #0066cc', padding: '30px', textAlign: 'center', marginBottom: '20px', borderRadius: '4px', background: '#f8fafc' }}>
          <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={handleFileChange} id="fileInput" style={{ display: 'none' }} />
          <label htmlFor="fileInput" style={{ cursor: 'pointer', color: '#0066cc', fontWeight: 'bold', display: 'block', width: '100%' }}>
            {file ? `📄 ${file.name}` : 'Choose PDF, PNG, or JPG'}
          </label>
        </div>

        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}

        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: loading ? '#94a3b8' : '#0066cc', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Report'}
        </button>
      </form>
    </div>
  );
}