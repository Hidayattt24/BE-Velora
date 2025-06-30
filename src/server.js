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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Velora API is running smoothly",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Documentation endpoint
app.get("/docs", (req, res) => {
  try {
    const path = require("path");
    const fs = require("fs");

    // Try multiple paths for the docs file
    const possiblePaths = [
      path.join(__dirname, "..", "public", "docs.html"),
      path.join(__dirname, "..", "docs", "docs.html"),
      path.join(process.cwd(), "public", "docs.html"),
      path.join(process.cwd(), "docs", "docs.html"),
    ];

    let docsContent = null;
    for (const docsPath of possiblePaths) {
      if (fs.existsSync(docsPath)) {
        docsContent = fs.readFileSync(docsPath, "utf8");
        break;
      }
    }

    if (docsContent) {
      res.setHeader("Content-Type", "text/html");
      res.send(docsContent);
    } else {
      // Fallback to inline documentation if file not found
      res.setHeader("Content-Type", "text/html");
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Velora API Documentation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
            h1 { color: #d291bc; }
            .endpoint { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🌸 Velora API Documentation</h1>
            <p>Selamat datang di dokumentasi API Velora - platform kesehatan maternal yang inovatif.</p>
            
            <div class="endpoint">
              <h3>GET /</h3>
              <p>Welcome endpoint dengan informasi dasar API</p>
            </div>
            
            <div class="endpoint">
              <h3>GET /health</h3>
              <p>Health check endpoint untuk monitoring status API</p>
            </div>
            
            <div class="endpoint">
              <h3>POST /api/auth/register</h3>
              <p>Registrasi user baru</p>
            </div>
            
            <div class="endpoint">
              <h3>POST /api/auth/login</h3>
              <p>Login user yang sudah terdaftar</p>
            </div>
            
            <div class="endpoint">
              <h3>GET /api/users/profile</h3>
              <p>Mendapatkan profil user (auth required)</p>
            </div>
            
            <div class="endpoint">
              <h3>POST /api/health/predict</h3>
              <p>Prediksi risiko kesehatan maternal (auth required)</p>
            </div>
            
            <div class="endpoint">
              <h3>GET /api/gallery</h3>
              <p>Mendapatkan galeri foto (auth required)</p>
            </div>
            
            <div class="endpoint">
              <h3>GET /api/timeline</h3>
              <p>Mendapatkan timeline kesehatan</p>
            </div>
            
            <div class="endpoint">
              <h3>POST /api/diagnosa</h3>
              <p>Endpoint diagnosa kesehatan</p>
            </div>
          </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error("Error serving documentation:", error);
    res.status(500).json({
      success: false,
      message: "Error loading documentation",
      error: error.message,
    });
  }
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

// Serve public static files (like docs.html)
app.use("/public", express.static("public"));

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
