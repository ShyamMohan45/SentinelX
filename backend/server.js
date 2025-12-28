import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";


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
