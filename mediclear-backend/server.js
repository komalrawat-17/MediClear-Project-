import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/reports.js";
import analyzeRoutes from "./routes/analyze.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/reports", reportRoutes);
app.use("/analyze-report", analyzeRoutes);

// Health check route — confirms the server is running.
// The real /analyze-report route (with the agentic reasoning chain)
// gets added in Milestone 2.
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "MediClear backend is running" });
});

app.listen(PORT, () => {
  console.log(`MediClear backend listening on http://localhost:${PORT}`);
});
