import { useState } from "react";
import axios from "axios";

// This is a placeholder for Milestone 1 — just confirms the frontend
// can talk to the backend. Real screens (login, upload, results,
// history) get built in Milestones 2 and 3.

const BACKEND_URL = "http://localhost:5000";

export default function App() {
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  async function checkBackend() {
    setChecking(true);
    try {
      const res = await axios.get(BACKEND_URL);
      setStatus(res.data.message);
    } catch (err) {
      setStatus("Could not reach backend — is it running on port 5000?");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
      <h1>MediClear</h1>
      <p>Milestone 1 setup check.</p>
      <button onClick={checkBackend} disabled={checking}>
        {checking ? "Checking..." : "Check backend connection"}
      </button>
      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
    </div>
  );
}
