const express = require('express');
const path = require('path');
const connectDB = require('./db');
const hospitalRoutes = require('./routes/hospitals');
const policeRoutes = require('./routes/police');
const fireStationRoutes = require('./routes/fireStation');
const crashRoutes = require('./routes/Crash');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Menjadi:
app.use((req, res, next) => {
  // Skip JSON parsing for multipart requests
  if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debugging
console.log("Environment Variables:");
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "***tersedia***" : "TIDAK TERSEDIA");

// Set BASE_URL untuk file links
if (!process.env.BASE_URL) {
  process.env.BASE_URL = `http://localhost:${PORT}`;
}

// Koneksi database
connectDB();

// Routes
app.use("/api/v1/hospitals", hospitalRoutes);
app.use("/api/v1/police", policeRoutes);
app.use("/api/v1/damkar", fireStationRoutes);
app.use("/api/crash", crashRoutes);

// Test endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Smart Crash Alert API",
    endpoints: {
      hospitals: "GET /api/v1/hospitals",
      police: "GET /api/v1/police",
      damkar: "GET /api/v1/damkar",
      report_crash: "POST /api/crash/upload"
    },
    whatsapp_notification: "Active"
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan server!' });
});

app.listen(PORT, () => {
  console.log(`🟢 Server running on http://0.0.0.0:${PORT}`);
});