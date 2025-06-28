const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

// Use memory storage for Vercel serverless environment
const storage = multer.memoryStorage();

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

// Process image in memory for Vercel
const processImageBuffer = async (buffer, mimetype) => {
  try {
    let sharpInstance = sharp(buffer);

    // Resize if too large
    sharpInstance = sharpInstance.resize(1200, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    });

    // Convert to JPEG for better compression
    const processedBuffer = await sharpInstance
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error("Image processing error:", error);
    return buffer; // Return original if processing fails
  }
};

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
      // Process image buffer
      const processedBuffer = await processImageBuffer(
        req.file.buffer,
        req.file.mimetype
      );

      // Generate unique filename
      const uniqueFilename = `${Date.now()}-${uuidv4()}.jpg`;

      // Update file info with processed data
      req.file.buffer = processedBuffer;
      req.file.size = processedBuffer.length;
      req.file.filename = uniqueFilename;
      req.file.mimetype = "image/jpeg";

      next();
    } catch (imageError) {
      console.error("Image processing error:", imageError);
      // Continue with original file if processing fails
      req.file.filename = `${Date.now()}-${uuidv4()}.jpg`;
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
        const processedBuffer = await processImageBuffer(
          file.buffer,
          file.mimetype
        );
        const uniqueFilename = `${Date.now()}-${uuidv4()}.jpg`;

        processedFiles.push({
          ...file,
          buffer: processedBuffer,
          filename: uniqueFilename,
          size: processedBuffer.length,
          mimetype: "image/jpeg",
        });
      }

      req.files = processedFiles;
      next();
    } catch (imageError) {
      console.error("Image processing error:", imageError);
      // Continue with original files if processing fails
      req.files = req.files.map((file) => ({
        ...file,
        filename: `${Date.now()}-${uuidv4()}.jpg`,
      }));
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
  processImageBuffer, // Export for use in routes
};
