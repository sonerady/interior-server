const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Çevre değişkenlerini yükle
dotenv.config();

// Routes import
const interiorRoutes = require("./routes/interiorRoutes");

// Express app
const app = express();
const PORT = process.env.PORT || 5001;

console.log(`Server environment: ${process.env.NODE_ENV || "development"}`);
console.log(`Server starting on port ${PORT}`);

// Daha geniş CORS yapılandırması
app.use(
  cors({
    origin: function (origin, callback) {
      // Tüm originlere izin ver
      console.log("CORS origin istek:", origin);
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Özel CORS hatalarını yakalamak için
app.use((req, res, next) => {
  console.log(`${req.method} request received for ${req.url} from ${req.ip}`);
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Uploads klasörü oluştur
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Uploads directory created at: ${uploadsDir}`);
} else {
  console.log(`Uploads directory exists at: ${uploadsDir}`);
}

// Static dosyalar için klasör tanımla
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", interiorRoutes);

// Ana endpointler
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Interior Design API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req, res, next) => {
  console.error(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.url}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Something went wrong!",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
});

// UnhandledRejection ve UnhandledException yakalama
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Server başlat
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API access URL: http://localhost:${PORT}`);
});
