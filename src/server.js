const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const healthRoutes = require("./routes/health");
const galleryRoutes = require("./routes/gallery");
const timelineRoutes = require("./routes/timeline");
const diagnosaRoutes = require("./routes/diagnosa");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const auth = require("./middleware/auth");

const app = express();

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet());
app.use(compression());
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://localhost:3000",
      "https://localhost:3001",
    ];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In production, allow all origins for now (you can restrict later)
      if (process.env.NODE_ENV === "production") {
        callback(null, true); // Allow all origins for debugging
      } else {
        // In development, allow all origins
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Welcome endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Velora API",
    version: "1.0.0",
    documentation: "https://api-velora.vercel.app/docs",
    endpoints: {
      health: "/health",
      docs: "/docs",
      auth: "/api/auth/*",
      users: "/api/users/*",
      health_prediction: "/api/health/*",
      gallery: "/api/gallery/*",
      timeline: "/api/timeline/*",
      diagnosa: "/api/diagnosa/*",
    },
    timestamp: new Date().toISOString(),
  });
});

// Documentation endpoint
app.get("/docs", (req, res) => {
  const path = require("path");
  const fs = require("fs");

  try {
    const docsPath = path.join(__dirname, "../docs/docs.html");
    const docsContent = fs.readFileSync(docsPath, "utf8");
    res.setHeader("Content-Type", "text/html");
    res.send(docsContent);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Documentation not found",
      alternative: "Visit https://api-velora.vercel.app for documentation",
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Velora API Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", auth, userRoutes);
app.use("/api/health", auth, healthRoutes);
app.use("/api/gallery", auth, galleryRoutes);
app.use("/api/timeline", timelineRoutes); // Remove auth middleware - routes handle their own auth
app.use("/api/diagnosa", diagnosaRoutes); // Diagnosa routes handle their own auth

// Serve static files with CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    // Set CORS headers for images
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Cross-Origin-Resource-Policy", "cross-origin");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  },
  express.static("uploads")
);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 CORS enabled for: ${process.env.ALLOWED_ORIGINS}`);
  });
} else {
  console.log("🚀 Velora API ready for serverless deployment");
}

module.exports = app;
