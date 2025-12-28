import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
// import db from "./db.js";

dotenv.config();

console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "Yes" : "No");
console.log("JWT_SECRET type:", typeof process.env.JWT_SECRET);
console.log("JWT_SECRET length:", process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);


const app = express();

app.use(cors());
app.use(express.json());

// Simple request logger to help debug incoming API calls
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);


app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
