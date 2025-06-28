const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const os = require("os");

// Use /tmp directory for Vercel serverless environment
const uploadDir = process.env.VERCEL
  ? os.tmpdir()
  : path.join(__dirname, "../../uploads");

// Ensure upload directory exists (only for local development)
if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with serverless support
const getStorageConfig = () => {
  if (process.env.VERCEL) {
    // For Vercel, use memory storage and handle files in memory
    return multer.memoryStorage();
  } else {
    // For local development, use disk storage
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
      },
    });
  }
};

// Configure multer for file upload
const storage = getStorageConfig();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_IMAGE_TYPES?.split(",") || [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Tipe file tidak didukung. Gunakan JPEG, PNG, atau WebP."),
      false
    );
  }
};

// Configure multer with size limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1, // Only allow one file at a time
  },
});

// Middleware to handle single file upload with image processing
const uploadMiddleware = (req, res, next) => {
  const singleUpload = upload.single("image");

  singleUpload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Ukuran file terlalu besar. Maksimal 10MB.",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "Hanya boleh upload 1 file.",
          });
        }
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading file.",
      });
    }

    // If no file uploaded, continue
    if (!req.file) {
      return next();
    }

    try {
      // Process image with Sharp for optimization
      const inputPath = req.file.path;
      const outputPath = path.join(uploadDir, `optimized-${req.file.filename}`);

      // Optimize image: resize if too large, compress, and convert to WebP for better compression
      await sharp(inputPath)
        .resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85,
          progressive: true,
        })
        .toFile(outputPath);

      // Delete original file
      fs.unlinkSync(inputPath);

      // Update file info
      req.file.path = outputPath;
      req.file.filename = `optimized-${req.file.filename}`;

      // Get optimized file stats
      const stats = fs.statSync(outputPath);
      req.file.size = stats.size;

      next();
    } catch (imageError) {
      console.error("Image processing error:", imageError);

      // If image processing fails, continue with original file
      // In production, you might want to handle this differently
      next();
    }
  });
};

// Middleware for multiple file uploads (for gallery)
const multipleUploadMiddleware = (req, res, next) => {
  const multipleUpload = upload.array("images", 10); // Max 10 files

  multipleUpload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Ukuran file terlalu besar. Maksimal 10MB per file.",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "Maksimal 10 file dalam sekali upload.",
          });
        }
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading files.",
      });
    }

    // If no files uploaded, continue
    if (!req.files || req.files.length === 0) {
      return next();
    }

    try {
      // Process each uploaded image
      const processedFiles = [];

      for (const file of req.files) {
        const inputPath = file.path;
        const outputPath = path.join(uploadDir, `optimized-${file.filename}`);

        // Optimize image
        await sharp(inputPath)
          .resize(1200, 1200, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 85,
            progressive: true,
          })
          .toFile(outputPath);

        // Delete original file
        fs.unlinkSync(inputPath);

        // Update file info
        const stats = fs.statSync(outputPath);
        processedFiles.push({
          ...file,
          path: outputPath,
          filename: `optimized-${file.filename}`,
          size: stats.size,
        });
      }

      req.files = processedFiles;
      next();
    } catch (imageError) {
      console.error("Image processing error:", imageError);

      // Continue with original files if processing fails
      next();
    }
  });
};

// Error handling middleware for upload errors
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File terlalu besar",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Terlalu banyak file",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Field file tidak diharapkan",
        });
      default:
        return res.status(400).json({
          success: false,
          message: "Error upload file",
        });
    }
  }
  next(err);
};

module.exports = {
  upload: uploadMiddleware,
  multipleUpload: multipleUploadMiddleware,
  uploadErrorHandler,
};
