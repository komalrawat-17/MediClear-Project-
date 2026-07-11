import { useState } from "react";
import "./UploadPage.css";

const API_URL = "http://localhost:5000";

export default function UploadPage({ user, onLogout }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: "error", message: "Please choose a file first." });
      return;
    }

    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("report", file);

    try {
      const token = localStorage.getItem("mediclear_token");

      const res = await fetch(`${API_URL}/reports/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Upload failed." });
        return;
      }

      setStatus({
        type: "success",
        message: `Received "${data.fileName}" (${data.fileSizeKB} KB). Full analysis coming in the next milestone.`,
      });
    } catch (err) {
      setStatus({ type: "error", message: "Could not reach the server. Is the backend running?" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <header className="upload-header">
        <h2 className="upload-brand">MediClear</h2>
        <button className="logout-btn" onClick={onLogout}>Log Out</button>
      </header>

      <div className="upload-card">
        <h1>Upload your lab report</h1>
        <p className="upload-subtitle">PDF, JPG, or PNG accepted</p>

        <label className="file-drop">
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
          {file ? file.name : "Choose a file"}
        </label>

        <button className="analyze-btn" onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Analyze Report"}
        </button>

        {status && (
          <p className={status.type === "error" ? "upload-error" : "upload-success"}>
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}